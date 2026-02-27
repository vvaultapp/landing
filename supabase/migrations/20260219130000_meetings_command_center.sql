-- Meetings 3.0 command-center foundation:
-- - meeting outcomes/reminder tracking
-- - Google sync status bookkeeping
-- - atomic outcome automation RPC

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------------
-- meetings: workflow/outcome fields
-- -------------------------------------------------------
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS conversation_id TEXT,
  ADD COLUMN IF NOT EXISTS outcome_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS outcome_notes TEXT,
  ADD COLUMN IF NOT EXISTS outcome_set_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS outcome_set_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reminder_24h_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reminder_1h_sent_at TIMESTAMP WITH TIME ZONE;

DO $$
DECLARE
  v_client_task_id_type TEXT;
BEGIN
  SELECT c.data_type
  INTO v_client_task_id_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'client_tasks'
    AND c.column_name = 'id';

  IF v_client_task_id_type = 'uuid' THEN
    ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS follow_up_task_id UUID;
  ELSE
    -- Some environments drifted to text ids for client_tasks.id.
    ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS follow_up_task_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'meetings_follow_up_task_id_fkey'
  ) THEN
    ALTER TABLE public.meetings
      ADD CONSTRAINT meetings_follow_up_task_id_fkey
      FOREIGN KEY (follow_up_task_id)
      REFERENCES public.client_tasks(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'meetings_outcome_status_check'
  ) THEN
    ALTER TABLE public.meetings
      ADD CONSTRAINT meetings_outcome_status_check
      CHECK (outcome_status IN ('pending', 'completed', 'no_show', 'rescheduled', 'cancelled'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_meetings_workspace_conversation_start
  ON public.meetings(workspace_id, conversation_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_meetings_workspace_outcome_start
  ON public.meetings(workspace_id, outcome_status, start_time DESC);

-- Deduplicate rows before enforcing unique google event id per workspace.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY workspace_id, google_event_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.meetings
  WHERE google_event_id IS NOT NULL
)
DELETE FROM public.meetings m
USING ranked r
WHERE m.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_meetings_workspace_google_event
  ON public.meetings(workspace_id, google_event_id)
  WHERE google_event_id IS NOT NULL;

-- -------------------------------------------------------
-- connected_google_calendars: sync bookkeeping
-- -------------------------------------------------------
ALTER TABLE public.connected_google_calendars
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_sync_status TEXT NOT NULL DEFAULT 'ok',
  ADD COLUMN IF NOT EXISTS last_sync_error TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'connected_google_calendars_last_sync_status_check'
  ) THEN
    ALTER TABLE public.connected_google_calendars
      ADD CONSTRAINT connected_google_calendars_last_sync_status_check
      CHECK (last_sync_status IN ('ok', 'error'));
  END IF;
END
$$;

-- -------------------------------------------------------
-- Atomic meeting outcome automation
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_meeting_outcome(
  p_workspace_id TEXT,
  p_meeting_id UUID,
  p_outcome TEXT,
  p_notes TEXT DEFAULT NULL,
  p_create_followup BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_outcome TEXT := lower(trim(COALESCE(p_outcome, '')));
  v_meeting public.meetings%ROWTYPE;
  v_thread_assigned_to UUID;
  v_owner BOOLEAN := false;
  v_tag_id UUID;
  v_followup_task_id TEXT;
  v_followup_title TEXT;
  v_followup_description TEXT;
  v_followup_due_date DATE;
  v_alert_id UUID;
  v_actioned_by UUID;
BEGIN
  v_actioned_by := auth.uid();

  IF p_workspace_id IS NULL OR trim(p_workspace_id) = '' THEN
    RAISE EXCEPTION 'workspace_id is required'
      USING ERRCODE = '22023';
  END IF;

  IF v_outcome NOT IN ('pending', 'completed', 'no_show', 'rescheduled', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid meeting outcome: %', p_outcome
      USING ERRCODE = '22023';
  END IF;

  SELECT public.is_workspace_owner(p_workspace_id, v_actioned_by) INTO v_owner;
  IF NOT COALESCE(v_owner, false) THEN
    RAISE EXCEPTION 'Only workspace owners can apply meeting outcomes'
      USING ERRCODE = '42501';
  END IF;

  SELECT *
  INTO v_meeting
  FROM public.meetings
  WHERE id = p_meeting_id
    AND workspace_id::text = p_workspace_id
  LIMIT 1;

  IF v_meeting.id IS NULL THEN
    RAISE EXCEPTION 'Meeting not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_meeting.conversation_id IS NOT NULL THEN
    SELECT t.assigned_user_id
    INTO v_thread_assigned_to
    FROM public.instagram_threads t
    WHERE t.workspace_id::text = p_workspace_id
      AND t.conversation_id = v_meeting.conversation_id
    LIMIT 1;
  END IF;

  IF v_outcome = 'completed' THEN
    v_followup_title := 'Post-call follow-up';
    v_followup_description := 'Follow up after completed call.';
    v_followup_due_date := (now() + interval '24 hour')::date;
  ELSIF v_outcome = 'no_show' THEN
    v_followup_title := 'No-show recovery';
    v_followup_description := 'Lead missed the call. Send recovery follow-up.';
    v_followup_due_date := (now() + interval '1 hour')::date;
  ELSIF v_outcome = 'rescheduled' THEN
    v_followup_title := 'Reschedule confirmation';
    v_followup_description := 'Confirm the newly scheduled call details.';
    v_followup_due_date := now()::date;
  END IF;

  -- Funnel tag automation for linked conversations.
  IF v_meeting.conversation_id IS NOT NULL THEN
    IF v_outcome = 'no_show' THEN
      SELECT id
      INTO v_tag_id
      FROM public.instagram_tags
      WHERE workspace_id::text = p_workspace_id
        AND lower(name) = 'no show'
      LIMIT 1;

      IF v_tag_id IS NULL THEN
        INSERT INTO public.instagram_tags (workspace_id, name, color, icon, prompt, created_by)
        VALUES (p_workspace_id, 'No show', '#f97316', 'user-round-x', 'Lead did not show up to the scheduled call.', v_actioned_by)
        RETURNING id INTO v_tag_id;
      END IF;
    ELSIF v_outcome IN ('completed', 'rescheduled', 'pending') THEN
      SELECT id
      INTO v_tag_id
      FROM public.instagram_tags
      WHERE workspace_id::text = p_workspace_id
        AND lower(name) = 'call booked'
      LIMIT 1;

      IF v_tag_id IS NULL THEN
        INSERT INTO public.instagram_tags (workspace_id, name, color, icon, prompt, created_by)
        VALUES (p_workspace_id, 'Call booked', '#9ca3af', 'phone-call', 'A call has been booked with this lead.', v_actioned_by)
        RETURNING id INTO v_tag_id;
      END IF;
    END IF;

    IF v_tag_id IS NOT NULL THEN
      INSERT INTO public.instagram_conversation_tags (workspace_id, conversation_id, tag_id, source, created_by)
      VALUES (p_workspace_id, v_meeting.conversation_id, v_tag_id, 'manual', v_actioned_by)
      ON CONFLICT (workspace_id, conversation_id, tag_id) DO NOTHING;
    END IF;
  END IF;

  -- Alert + follow-up automation
  IF v_outcome = 'no_show' AND v_meeting.conversation_id IS NOT NULL THEN
    INSERT INTO public.instagram_alerts (
      workspace_id,
      conversation_id,
      alert_type,
      status,
      assigned_user_id,
      overdue_minutes,
      recommended_action,
      details
    )
    VALUES (
      p_workspace_id,
      v_meeting.conversation_id,
      'no_show_followup',
      'open',
      COALESCE(v_meeting.assigned_to, v_thread_assigned_to),
      0,
      'Lead missed the call. Send a recovery message and offer a new slot.',
      jsonb_build_object('meeting_id', v_meeting.id, 'outcome', v_outcome)
    )
    ON CONFLICT (workspace_id, conversation_id, alert_type) WHERE status = 'open'
    DO UPDATE SET
      assigned_user_id = EXCLUDED.assigned_user_id,
      overdue_minutes = 0,
      recommended_action = EXCLUDED.recommended_action,
      details = EXCLUDED.details,
      updated_at = now()
    RETURNING id INTO v_alert_id;
  ELSE
    UPDATE public.instagram_alerts
    SET
      status = 'resolved',
      resolved_by = v_actioned_by,
      resolved_at = now(),
      updated_at = now()
    WHERE workspace_id::text = p_workspace_id
      AND conversation_id = v_meeting.conversation_id
      AND alert_type = 'no_show_followup'
      AND status = 'open';
  END IF;

  IF p_create_followup
     AND v_outcome IN ('completed', 'no_show', 'rescheduled')
     AND v_followup_title IS NOT NULL THEN
    INSERT INTO public.client_tasks (
      workspace_id,
      client_id,
      created_by,
      title,
      description,
      due_date,
      status,
      assigned_to,
      conversation_id
    )
    VALUES (
      p_workspace_id,
      v_meeting.client_id,
      v_actioned_by,
      v_followup_title,
      v_followup_description,
      v_followup_due_date,
      'pending',
      COALESCE(v_meeting.assigned_to, v_thread_assigned_to),
      v_meeting.conversation_id
    )
    RETURNING id INTO v_followup_task_id;
  ELSE
    v_followup_task_id := v_meeting.follow_up_task_id;
  END IF;

  UPDATE public.meetings
  SET
    status = CASE WHEN v_outcome = 'cancelled' THEN 'cancelled' ELSE status END,
    outcome_status = v_outcome,
    outcome_notes = NULLIF(trim(COALESCE(p_notes, '')), ''),
    outcome_set_by = v_actioned_by,
    outcome_set_at = now(),
    follow_up_task_id = COALESCE(v_followup_task_id, follow_up_task_id),
    updated_at = now()
  WHERE id = v_meeting.id;

  RETURN jsonb_build_object(
    'success', true,
    'meeting_id', v_meeting.id,
    'outcome_status', v_outcome,
    'follow_up_task_id', v_followup_task_id,
    'no_show_alert_id', v_alert_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_meeting_outcome(TEXT, UUID, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_meeting_outcome(TEXT, UUID, TEXT, TEXT, BOOLEAN) TO authenticated;
