-- Setter workspace enforcement:
-- - strict setter visibility for inbox data
-- - private lead controls (hidden_from_setters + shared_with_setters)
-- - internal lead team chat
-- - owner-only privileged jobs/actions

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------------
-- Visibility helpers
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.workspace_role_for_user(
  ws_id TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF ws_id IS NULL OR p_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  BEGIN
    SELECT wm.role::text
    INTO v_role
    FROM public.workspace_members wm
    WHERE wm.workspace_id = ws_id::uuid
      AND wm.user_id = p_user_id
    LIMIT 1;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN NULL;
  END;

  RETURN v_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.workspace_role_for_user(
  ws_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.workspace_role_for_user(ws_id::text, p_user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(
  ws_id TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.workspace_role_for_user(ws_id, p_user_id) = 'owner'
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(
  ws_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_workspace_owner(ws_id::text, p_user_id)
$$;

CREATE OR REPLACE FUNCTION public.instagram_message_conversation_key(
  p_instagram_account_id TEXT,
  p_instagram_user_id TEXT,
  p_raw_payload JSONB
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_key TEXT;
BEGIN
  conv_key := NULLIF(TRIM(COALESCE(p_raw_payload->>'conversation_key', '')), '');
  IF conv_key IS NOT NULL THEN
    RETURN conv_key;
  END IF;

  conv_key := NULLIF(TRIM(COALESCE(p_raw_payload->>'conversation_id', '')), '');
  IF conv_key IS NOT NULL THEN
    RETURN conv_key;
  END IF;

  IF p_instagram_account_id IS NULL OR p_instagram_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN p_instagram_account_id || ':' || p_instagram_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_setter_access_thread(
  ws_id TEXT,
  conv_id TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.workspace_role_for_user(ws_id, p_user_id);
  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;

  IF v_role = 'owner' THEN
    RETURN TRUE;
  END IF;

  IF v_role <> 'setter' THEN
    RETURN FALSE;
  END IF;

  IF conv_id IS NULL OR btrim(conv_id) = '' THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.instagram_threads t
    WHERE t.workspace_id = ws_id
      AND t.conversation_id = conv_id
      AND COALESCE(t.hidden_from_setters, FALSE) = FALSE
      AND (
        t.assigned_user_id = p_user_id
        OR COALESCE(t.shared_with_setters, FALSE) = TRUE
      )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_setter_access_thread(
  ws_id UUID,
  conv_id TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.can_setter_access_thread(ws_id::text, conv_id, p_user_id)
$$;

-- -------------------------------------------------------
-- Conversation privacy + assignment controls
-- -------------------------------------------------------
ALTER TABLE public.instagram_threads
  ADD COLUMN IF NOT EXISTS hidden_from_setters BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS shared_with_setters BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_instagram_threads_workspace_visibility
  ON public.instagram_threads(workspace_id, hidden_from_setters, shared_with_setters, assigned_user_id);

CREATE OR REPLACE FUNCTION public.instagram_threads_apply_visibility_rules()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.hidden_from_setters, FALSE) THEN
    NEW.assigned_user_id := NULL;
    NEW.shared_with_setters := FALSE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS apply_instagram_threads_visibility_rules ON public.instagram_threads;
CREATE TRIGGER apply_instagram_threads_visibility_rules
  BEFORE INSERT OR UPDATE ON public.instagram_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.instagram_threads_apply_visibility_rules();

CREATE OR REPLACE FUNCTION public.instagram_threads_restrict_setter_changes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.workspace_role_for_user(NEW.workspace_id, auth.uid());
  IF v_role = 'setter' THEN
    IF NEW.assigned_user_id IS DISTINCT FROM OLD.assigned_user_id
       OR NEW.hidden_from_setters IS DISTINCT FROM OLD.hidden_from_setters
       OR NEW.shared_with_setters IS DISTINCT FROM OLD.shared_with_setters THEN
      RAISE EXCEPTION 'Setter cannot modify assignment or privacy fields'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restrict_instagram_threads_setter_changes ON public.instagram_threads;
CREATE TRIGGER restrict_instagram_threads_setter_changes
  BEFORE UPDATE ON public.instagram_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.instagram_threads_restrict_setter_changes();

-- -------------------------------------------------------
-- Internal lead team chat (owner + visible setters)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_team_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  author_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(trim(body)) > 0 AND char_length(body) <= 4000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_team_messages_workspace_conv_created
  ON public.lead_team_messages(workspace_id, conversation_id, created_at);

ALTER TABLE public.lead_team_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners and visible setters can view lead team messages" ON public.lead_team_messages;
CREATE POLICY "Owners and visible setters can view lead team messages"
  ON public.lead_team_messages FOR SELECT
  USING (public.can_setter_access_thread(workspace_id, conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Owners and visible setters can create lead team messages" ON public.lead_team_messages;
CREATE POLICY "Owners and visible setters can create lead team messages"
  ON public.lead_team_messages FOR INSERT
  WITH CHECK (
    author_user_id = auth.uid()
    AND public.can_setter_access_thread(workspace_id, conversation_id, auth.uid())
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'lead_team_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_team_messages;
  END IF;
END
$$;

-- -------------------------------------------------------
-- RLS tightening: inbox core tables
-- -------------------------------------------------------
ALTER TABLE public.instagram_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_thread_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_conversation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_thread_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_retag_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_lead_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view Instagram threads" ON public.instagram_threads;
DROP POLICY IF EXISTS "Workspace members can update Instagram threads" ON public.instagram_threads;
DROP POLICY IF EXISTS "Workspace members can insert Instagram threads" ON public.instagram_threads;

DROP POLICY IF EXISTS "Owners and visible setters can view Instagram threads" ON public.instagram_threads;
CREATE POLICY "Owners and visible setters can view Instagram threads"
  ON public.instagram_threads FOR SELECT
  USING (
    public.is_workspace_member(workspace_id)
    AND (
      public.workspace_role_for_user(workspace_id, auth.uid()) = 'owner'
      OR (
        public.workspace_role_for_user(workspace_id, auth.uid()) = 'setter'
        AND COALESCE(hidden_from_setters, FALSE) = FALSE
        AND (
          assigned_user_id = auth.uid()
          OR COALESCE(shared_with_setters, FALSE) = TRUE
        )
      )
    )
  );

DROP POLICY IF EXISTS "Owners and visible setters can update Instagram threads" ON public.instagram_threads;
CREATE POLICY "Owners and visible setters can update Instagram threads"
  ON public.instagram_threads FOR UPDATE
  USING (
    public.is_workspace_member(workspace_id)
    AND (
      public.workspace_role_for_user(workspace_id, auth.uid()) = 'owner'
      OR (
        public.workspace_role_for_user(workspace_id, auth.uid()) = 'setter'
        AND COALESCE(hidden_from_setters, FALSE) = FALSE
        AND (
          assigned_user_id = auth.uid()
          OR COALESCE(shared_with_setters, FALSE) = TRUE
        )
      )
    )
  )
  WITH CHECK (
    public.is_workspace_member(workspace_id)
    AND (
      public.workspace_role_for_user(workspace_id, auth.uid()) = 'owner'
      OR (
        public.workspace_role_for_user(workspace_id, auth.uid()) = 'setter'
        AND COALESCE(hidden_from_setters, FALSE) = FALSE
        AND (
          assigned_user_id = auth.uid()
          OR COALESCE(shared_with_setters, FALSE) = TRUE
        )
      )
    )
  );

DROP POLICY IF EXISTS "Owners can insert Instagram threads" ON public.instagram_threads;
CREATE POLICY "Owners can insert Instagram threads"
  ON public.instagram_threads FOR INSERT
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Workspace members can view Instagram messages" ON public.instagram_messages;
DROP POLICY IF EXISTS "Owners and visible setters can view Instagram messages" ON public.instagram_messages;
CREATE POLICY "Owners and visible setters can view Instagram messages"
  ON public.instagram_messages FOR SELECT
  USING (
    public.can_setter_access_thread(
      workspace_id,
      public.instagram_message_conversation_key(instagram_account_id, instagram_user_id, raw_payload),
      auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view their Instagram thread reads" ON public.instagram_thread_reads;
DROP POLICY IF EXISTS "Users can manage their Instagram thread reads" ON public.instagram_thread_reads;
DROP POLICY IF EXISTS "Users can view visible Instagram thread reads" ON public.instagram_thread_reads;
CREATE POLICY "Users can view visible Instagram thread reads"
  ON public.instagram_thread_reads FOR SELECT
  USING (
    user_id = auth.uid()
    AND public.can_setter_access_thread(workspace_id, conversation_id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage visible Instagram thread reads" ON public.instagram_thread_reads;
CREATE POLICY "Users can manage visible Instagram thread reads"
  ON public.instagram_thread_reads FOR ALL
  USING (
    user_id = auth.uid()
    AND public.can_setter_access_thread(workspace_id, conversation_id, auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    AND public.can_setter_access_thread(workspace_id, conversation_id, auth.uid())
  );

DROP POLICY IF EXISTS "Workspace members can insert Instagram tags" ON public.instagram_tags;
DROP POLICY IF EXISTS "Workspace members can update Instagram tags" ON public.instagram_tags;
DROP POLICY IF EXISTS "Workspace members can delete Instagram tags" ON public.instagram_tags;

DROP POLICY IF EXISTS "Owners can insert Instagram tags" ON public.instagram_tags;
CREATE POLICY "Owners can insert Instagram tags"
  ON public.instagram_tags FOR INSERT
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Owners can update Instagram tags" ON public.instagram_tags;
CREATE POLICY "Owners can update Instagram tags"
  ON public.instagram_tags FOR UPDATE
  USING (public.is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Owners can delete Instagram tags" ON public.instagram_tags;
CREATE POLICY "Owners can delete Instagram tags"
  ON public.instagram_tags FOR DELETE
  USING (public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Workspace members can view conversation tags" ON public.instagram_conversation_tags;
DROP POLICY IF EXISTS "Workspace members can insert conversation tags" ON public.instagram_conversation_tags;
DROP POLICY IF EXISTS "Workspace members can delete conversation tags" ON public.instagram_conversation_tags;

DROP POLICY IF EXISTS "Owners and visible setters can view conversation tags" ON public.instagram_conversation_tags;
CREATE POLICY "Owners and visible setters can view conversation tags"
  ON public.instagram_conversation_tags FOR SELECT
  USING (public.can_setter_access_thread(workspace_id, conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Owners and visible setters can insert conversation tags" ON public.instagram_conversation_tags;
CREATE POLICY "Owners and visible setters can insert conversation tags"
  ON public.instagram_conversation_tags FOR INSERT
  WITH CHECK (public.can_setter_access_thread(workspace_id, conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Owners and visible setters can delete conversation tags" ON public.instagram_conversation_tags;
CREATE POLICY "Owners and visible setters can delete conversation tags"
  ON public.instagram_conversation_tags FOR DELETE
  USING (public.can_setter_access_thread(workspace_id, conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Workspace members can view Instagram thread audit logs" ON public.instagram_thread_audit_log;
DROP POLICY IF EXISTS "Workspace members can insert Instagram thread audit logs" ON public.instagram_thread_audit_log;

DROP POLICY IF EXISTS "Owners and visible setters can view Instagram thread audit logs" ON public.instagram_thread_audit_log;
CREATE POLICY "Owners and visible setters can view Instagram thread audit logs"
  ON public.instagram_thread_audit_log FOR SELECT
  USING (public.can_setter_access_thread(workspace_id, conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Owners and visible setters can insert Instagram thread audit logs" ON public.instagram_thread_audit_log;
CREATE POLICY "Owners and visible setters can insert Instagram thread audit logs"
  ON public.instagram_thread_audit_log FOR INSERT
  WITH CHECK (
    actor_user_id = auth.uid()
    AND public.can_setter_access_thread(workspace_id, conversation_id, auth.uid())
  );

DROP POLICY IF EXISTS "Workspace members can view Instagram alerts" ON public.instagram_alerts;
DROP POLICY IF EXISTS "Workspace members can insert Instagram alerts" ON public.instagram_alerts;
DROP POLICY IF EXISTS "Workspace members can update Instagram alerts" ON public.instagram_alerts;

DROP POLICY IF EXISTS "Owners and visible setters can view Instagram alerts" ON public.instagram_alerts;
CREATE POLICY "Owners and visible setters can view Instagram alerts"
  ON public.instagram_alerts FOR SELECT
  USING (public.can_setter_access_thread(workspace_id, conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Owners and visible setters can insert Instagram alerts" ON public.instagram_alerts;
CREATE POLICY "Owners and visible setters can insert Instagram alerts"
  ON public.instagram_alerts FOR INSERT
  WITH CHECK (public.can_setter_access_thread(workspace_id, conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Owners and visible setters can update Instagram alerts" ON public.instagram_alerts;
CREATE POLICY "Owners and visible setters can update Instagram alerts"
  ON public.instagram_alerts FOR UPDATE
  USING (public.can_setter_access_thread(workspace_id, conversation_id, auth.uid()))
  WITH CHECK (public.can_setter_access_thread(workspace_id, conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Workspace members can insert Instagram retag jobs" ON public.instagram_retag_jobs;
DROP POLICY IF EXISTS "Workspace members can update Instagram retag jobs" ON public.instagram_retag_jobs;

DROP POLICY IF EXISTS "Owners can insert Instagram retag jobs" ON public.instagram_retag_jobs;
CREATE POLICY "Owners can insert Instagram retag jobs"
  ON public.instagram_retag_jobs FOR INSERT
  WITH CHECK (requested_by = auth.uid() AND public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Owners can update Instagram retag jobs" ON public.instagram_retag_jobs;
CREATE POLICY "Owners can update Instagram retag jobs"
  ON public.instagram_retag_jobs FOR UPDATE
  USING (public.is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Workspace members can manage Instagram lead insights" ON public.instagram_lead_insights;

DROP POLICY IF EXISTS "Owners can manage Instagram lead insights" ON public.instagram_lead_insights;
CREATE POLICY "Owners can manage Instagram lead insights"
  ON public.instagram_lead_insights FOR ALL
  USING (public.is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Setters can view visible Instagram lead insights" ON public.instagram_lead_insights;
CREATE POLICY "Setters can view visible Instagram lead insights"
  ON public.instagram_lead_insights FOR SELECT
  USING (
    public.workspace_role_for_user(workspace_id, auth.uid()) = 'setter'
    AND EXISTS (
      SELECT 1
      FROM public.instagram_threads t
      WHERE t.workspace_id = instagram_lead_insights.workspace_id
        AND t.instagram_user_id = instagram_lead_insights.instagram_user_id
        AND public.can_setter_access_thread(t.workspace_id, t.conversation_id, auth.uid())
    )
  );

-- -------------------------------------------------------
-- Meetings/tasks visibility for setter mode
-- -------------------------------------------------------
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS conversation_id TEXT;

CREATE INDEX IF NOT EXISTS idx_meetings_workspace_conversation
  ON public.meetings(workspace_id, conversation_id);

ALTER TABLE public.client_tasks
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS conversation_id TEXT;

CREATE INDEX IF NOT EXISTS idx_client_tasks_workspace_assigned
  ON public.client_tasks(workspace_id, assigned_to);

CREATE INDEX IF NOT EXISTS idx_client_tasks_workspace_conversation
  ON public.client_tasks(workspace_id, conversation_id);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view meetings" ON public.meetings;
DROP POLICY IF EXISTS "Workspace members can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Workspace members can update meetings" ON public.meetings;
DROP POLICY IF EXISTS "Workspace owners can delete meetings" ON public.meetings;

DROP POLICY IF EXISTS "Owners can manage meetings" ON public.meetings;
CREATE POLICY "Owners can manage meetings"
  ON public.meetings FOR ALL
  USING (public.is_workspace_owner(workspace_id::text, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id::text, auth.uid()));

DROP POLICY IF EXISTS "Setters can view allowed meetings" ON public.meetings;
CREATE POLICY "Setters can view allowed meetings"
  ON public.meetings FOR SELECT
  USING (
    public.workspace_role_for_user(workspace_id::text, auth.uid()) = 'setter'
    AND (
      assigned_to::text = auth.uid()::text
      OR (
        conversation_id IS NOT NULL
        AND public.can_setter_access_thread(workspace_id::text, conversation_id, auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Coaches can view workspace tasks" ON public.client_tasks;
DROP POLICY IF EXISTS "Clients can view their own tasks" ON public.client_tasks;
DROP POLICY IF EXISTS "Coaches can create tasks" ON public.client_tasks;
DROP POLICY IF EXISTS "Coaches can update tasks" ON public.client_tasks;
DROP POLICY IF EXISTS "Clients can update their own tasks" ON public.client_tasks;
DROP POLICY IF EXISTS "Coaches can delete tasks" ON public.client_tasks;

DROP POLICY IF EXISTS "Owners can manage client tasks" ON public.client_tasks;
CREATE POLICY "Owners can manage client tasks"
  ON public.client_tasks FOR ALL
  USING (public.is_workspace_owner(workspace_id::text, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id::text, auth.uid()));

DROP POLICY IF EXISTS "Setters can view allowed client tasks" ON public.client_tasks;
CREATE POLICY "Setters can view allowed client tasks"
  ON public.client_tasks FOR SELECT
  USING (
    public.workspace_role_for_user(workspace_id::text, auth.uid()) = 'setter'
    AND (
      assigned_to::text = auth.uid()::text
      OR (
        conversation_id IS NOT NULL
        AND public.can_setter_access_thread(workspace_id::text, conversation_id, auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Setters can update allowed client tasks" ON public.client_tasks;
CREATE POLICY "Setters can update allowed client tasks"
  ON public.client_tasks FOR UPDATE
  USING (
    public.workspace_role_for_user(workspace_id::text, auth.uid()) = 'setter'
    AND (
      assigned_to::text = auth.uid()::text
      OR (
        conversation_id IS NOT NULL
        AND public.can_setter_access_thread(workspace_id::text, conversation_id, auth.uid())
      )
    )
  )
  WITH CHECK (
    public.workspace_role_for_user(workspace_id::text, auth.uid()) = 'setter'
    AND (
      assigned_to::text = auth.uid()::text
      OR (
        conversation_id IS NOT NULL
        AND public.can_setter_access_thread(workspace_id::text, conversation_id, auth.uid())
      )
    )
  );

CREATE OR REPLACE FUNCTION public.client_tasks_restrict_setter_updates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.workspace_role_for_user(NEW.workspace_id::text, auth.uid());
  IF v_role = 'setter' THEN
    IF NEW.client_id IS DISTINCT FROM OLD.client_id
       OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
       OR NEW.created_by IS DISTINCT FROM OLD.created_by
       OR NEW.title IS DISTINCT FROM OLD.title
       OR NEW.description IS DISTINCT FROM OLD.description
       OR NEW.due_date IS DISTINCT FROM OLD.due_date
       OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
       OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id THEN
      RAISE EXCEPTION 'Setter can only update task completion state'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restrict_client_tasks_setter_updates ON public.client_tasks;
CREATE TRIGGER restrict_client_tasks_setter_updates
  BEFORE UPDATE ON public.client_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.client_tasks_restrict_setter_updates();
