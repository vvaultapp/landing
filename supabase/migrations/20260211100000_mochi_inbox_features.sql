-- Mochi Inbox Features 2-10 foundation:
-- tags, retag jobs, assignment/status, audit logs, alerts, summaries, and priority follow-up fields.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure updated_at helper exists (safe create)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'update_updated_at_column'
      AND n.nspname = 'public'
  ) THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$;
  END IF;
END
$$;

-- 1) Conversation metadata for assignment/status/priority workflows/summaries.
ALTER TABLE public.instagram_threads
  ADD COLUMN IF NOT EXISTS lead_status TEXT NOT NULL DEFAULT 'open'
    CHECK (lead_status IN ('open', 'qualified', 'disqualified', 'removed')),
  ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS priority_snoozed_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS priority_followed_up_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS removed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS summary_text TEXT,
  ADD COLUMN IF NOT EXISTS summary_updated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS summary_version INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_inbound_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_outbound_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_instagram_threads_workspace_status
  ON public.instagram_threads(workspace_id, lead_status);

CREATE INDEX IF NOT EXISTS idx_instagram_threads_workspace_assigned
  ON public.instagram_threads(workspace_id, assigned_user_id);

CREATE INDEX IF NOT EXISTS idx_instagram_threads_priority_snooze
  ON public.instagram_threads(workspace_id, priority, priority_snoozed_until);

CREATE INDEX IF NOT EXISTS idx_instagram_threads_last_inbound
  ON public.instagram_threads(workspace_id, last_inbound_at DESC);

CREATE INDEX IF NOT EXISTS idx_instagram_threads_last_outbound
  ON public.instagram_threads(workspace_id, last_outbound_at DESC);

-- Backfill basic activity timestamps from last message direction when possible.
UPDATE public.instagram_threads
SET
  last_inbound_at = COALESCE(last_inbound_at, CASE WHEN last_message_direction = 'inbound' THEN last_message_at ELSE NULL END),
  last_outbound_at = COALESCE(last_outbound_at, CASE WHEN last_message_direction = 'outbound' THEN last_message_at ELSE NULL END)
WHERE last_message_at IS NOT NULL;

-- 2) Tags model (AI-ready prompt-driven tags).
CREATE TABLE IF NOT EXISTS public.instagram_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8A8A8A',
  icon TEXT NOT NULL DEFAULT 'tag',
  prompt TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_instagram_tags_workspace_name_ci
  ON public.instagram_tags(workspace_id, lower(name));

CREATE INDEX IF NOT EXISTS idx_instagram_tags_workspace
  ON public.instagram_tags(workspace_id, created_at DESC);

ALTER TABLE public.instagram_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view Instagram tags" ON public.instagram_tags;
CREATE POLICY "Workspace members can view Instagram tags"
  ON public.instagram_tags FOR SELECT
  USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can insert Instagram tags" ON public.instagram_tags;
CREATE POLICY "Workspace members can insert Instagram tags"
  ON public.instagram_tags FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can update Instagram tags" ON public.instagram_tags;
CREATE POLICY "Workspace members can update Instagram tags"
  ON public.instagram_tags FOR UPDATE
  USING (is_workspace_member(workspace_id))
  WITH CHECK (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can delete Instagram tags" ON public.instagram_tags;
CREATE POLICY "Workspace members can delete Instagram tags"
  ON public.instagram_tags FOR DELETE
  USING (is_workspace_member(workspace_id));

DROP TRIGGER IF EXISTS update_instagram_tags_updated_at ON public.instagram_tags;
CREATE TRIGGER update_instagram_tags_updated_at
  BEFORE UPDATE ON public.instagram_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Many-to-many tag links to conversations.
CREATE TABLE IF NOT EXISTS public.instagram_conversation_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  tag_id UUID NOT NULL REFERENCES public.instagram_tags(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai', 'retag', 'bulk')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, conversation_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_instagram_conversation_tags_workspace_conv
  ON public.instagram_conversation_tags(workspace_id, conversation_id);

CREATE INDEX IF NOT EXISTS idx_instagram_conversation_tags_workspace_tag
  ON public.instagram_conversation_tags(workspace_id, tag_id);

ALTER TABLE public.instagram_conversation_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view conversation tags" ON public.instagram_conversation_tags;
CREATE POLICY "Workspace members can view conversation tags"
  ON public.instagram_conversation_tags FOR SELECT
  USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can insert conversation tags" ON public.instagram_conversation_tags;
CREATE POLICY "Workspace members can insert conversation tags"
  ON public.instagram_conversation_tags FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can delete conversation tags" ON public.instagram_conversation_tags;
CREATE POLICY "Workspace members can delete conversation tags"
  ON public.instagram_conversation_tags FOR DELETE
  USING (is_workspace_member(workspace_id));

-- 4) Audit log for qualify/remove/pin/spam/tag/etc actions.
CREATE TABLE IF NOT EXISTS public.instagram_thread_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instagram_thread_audit_workspace_conv_time
  ON public.instagram_thread_audit_log(workspace_id, conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_instagram_thread_audit_workspace_action_time
  ON public.instagram_thread_audit_log(workspace_id, action, created_at DESC);

ALTER TABLE public.instagram_thread_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view Instagram thread audit logs" ON public.instagram_thread_audit_log;
CREATE POLICY "Workspace members can view Instagram thread audit logs"
  ON public.instagram_thread_audit_log FOR SELECT
  USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can insert Instagram thread audit logs" ON public.instagram_thread_audit_log;
CREATE POLICY "Workspace members can insert Instagram thread audit logs"
  ON public.instagram_thread_audit_log FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

-- 5) Background AI retag jobs with progress tracking.
CREATE TABLE IF NOT EXISTS public.instagram_retag_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.instagram_tags(id) ON DELETE SET NULL,
  only_last_30_days BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  progress_total INTEGER NOT NULL DEFAULT 0,
  progress_done INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_instagram_retag_jobs_workspace_status
  ON public.instagram_retag_jobs(workspace_id, status, created_at DESC);

ALTER TABLE public.instagram_retag_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view Instagram retag jobs" ON public.instagram_retag_jobs;
CREATE POLICY "Workspace members can view Instagram retag jobs"
  ON public.instagram_retag_jobs FOR SELECT
  USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can insert Instagram retag jobs" ON public.instagram_retag_jobs;
CREATE POLICY "Workspace members can insert Instagram retag jobs"
  ON public.instagram_retag_jobs FOR INSERT
  WITH CHECK (requested_by = auth.uid() AND is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can update Instagram retag jobs" ON public.instagram_retag_jobs;
CREATE POLICY "Workspace members can update Instagram retag jobs"
  ON public.instagram_retag_jobs FOR UPDATE
  USING (is_workspace_member(workspace_id))
  WITH CHECK (is_workspace_member(workspace_id));

DROP TRIGGER IF EXISTS update_instagram_retag_jobs_updated_at ON public.instagram_retag_jobs;
CREATE TRIGGER update_instagram_retag_jobs_updated_at
  BEFORE UPDATE ON public.instagram_retag_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Snitch/accountability alerts.
CREATE TABLE IF NOT EXISTS public.instagram_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('hot_lead_unreplied', 'qualified_inactive', 'no_show_followup')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  overdue_minutes INTEGER NOT NULL DEFAULT 0,
  recommended_action TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_instagram_alerts_workspace_conv_type_open
  ON public.instagram_alerts(workspace_id, conversation_id, alert_type)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_instagram_alerts_workspace_status_time
  ON public.instagram_alerts(workspace_id, status, created_at DESC);

ALTER TABLE public.instagram_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view Instagram alerts" ON public.instagram_alerts;
CREATE POLICY "Workspace members can view Instagram alerts"
  ON public.instagram_alerts FOR SELECT
  USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can insert Instagram alerts" ON public.instagram_alerts;
CREATE POLICY "Workspace members can insert Instagram alerts"
  ON public.instagram_alerts FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can update Instagram alerts" ON public.instagram_alerts;
CREATE POLICY "Workspace members can update Instagram alerts"
  ON public.instagram_alerts FOR UPDATE
  USING (is_workspace_member(workspace_id))
  WITH CHECK (is_workspace_member(workspace_id));

DROP TRIGGER IF EXISTS update_instagram_alerts_updated_at ON public.instagram_alerts;
CREATE TRIGGER update_instagram_alerts_updated_at
  BEFORE UPDATE ON public.instagram_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Seed defaults for quicker setup.
INSERT INTO public.instagram_tags (workspace_id, name, color, icon, prompt)
SELECT t.workspace_id, 'Hot Lead', '#F59E0B', 'star',
       'Tag this conversation when lead intent is high: asks about pricing, availability, next steps, booking, or sounds ready to buy.'
FROM (
  SELECT DISTINCT workspace_id
  FROM public.instagram_threads
) AS t
WHERE NOT EXISTS (
  SELECT 1
  FROM public.instagram_tags x
  WHERE x.workspace_id = t.workspace_id
    AND lower(x.name) = 'hot lead'
);
