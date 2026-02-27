-- Safe bootstrap for inbox features on environments where migration history was not tracked.
-- This migration is idempotent and can be applied on partially initialized projects.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

-- Helper function overload for text workspace IDs.
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.is_workspace_member(ws_id::uuid);
EXCEPTION WHEN invalid_text_representation THEN
  RETURN false;
END
$$;

CREATE TABLE IF NOT EXISTS public.instagram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  instagram_account_id TEXT NOT NULL,
  instagram_user_id TEXT NOT NULL,
  sender_id TEXT,
  recipient_id TEXT,
  message_id TEXT UNIQUE,
  message_text TEXT,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  message_timestamp TIMESTAMP WITH TIME ZONE,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instagram_messages_workspace ON public.instagram_messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_user ON public.instagram_messages(instagram_user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_created_at ON public.instagram_messages(created_at);

ALTER TABLE public.instagram_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view Instagram messages" ON public.instagram_messages;
CREATE POLICY "Workspace members can view Instagram messages"
  ON public.instagram_messages FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE TABLE IF NOT EXISTS public.instagram_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  instagram_account_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  instagram_user_id TEXT NOT NULL,
  peer_username TEXT,
  peer_name TEXT,
  peer_profile_picture_url TEXT,
  priority BOOLEAN NOT NULL DEFAULT false,
  last_message_id TEXT,
  last_message_text TEXT,
  last_message_direction TEXT CHECK (last_message_direction IN ('inbound', 'outbound')),
  last_message_at TIMESTAMP WITH TIME ZONE,
  is_spam BOOLEAN NOT NULL DEFAULT false,
  lead_status TEXT NOT NULL DEFAULT 'open',
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority_snoozed_until TIMESTAMP WITH TIME ZONE,
  priority_followed_up_at TIMESTAMP WITH TIME ZONE,
  qualified_at TIMESTAMP WITH TIME ZONE,
  removed_at TIMESTAMP WITH TIME ZONE,
  summary_text TEXT,
  summary_updated_at TIMESTAMP WITH TIME ZONE,
  summary_version INTEGER NOT NULL DEFAULT 0,
  last_inbound_at TIMESTAMP WITH TIME ZONE,
  last_outbound_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, conversation_id),
  UNIQUE(workspace_id, instagram_account_id, instagram_user_id)
);

ALTER TABLE public.instagram_threads
  ADD COLUMN IF NOT EXISTS peer_username TEXT,
  ADD COLUMN IF NOT EXISTS peer_name TEXT,
  ADD COLUMN IF NOT EXISTS peer_profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS priority BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_message_id TEXT,
  ADD COLUMN IF NOT EXISTS last_message_text TEXT,
  ADD COLUMN IF NOT EXISTS last_message_direction TEXT,
  ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_spam BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lead_status TEXT NOT NULL DEFAULT 'open',
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'instagram_threads_lead_status_check'
  ) THEN
    ALTER TABLE public.instagram_threads
      ADD CONSTRAINT instagram_threads_lead_status_check
      CHECK (lead_status IN ('open', 'qualified', 'disqualified', 'removed'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_instagram_threads_workspace ON public.instagram_threads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_instagram_threads_priority ON public.instagram_threads(workspace_id, priority);
CREATE INDEX IF NOT EXISTS idx_instagram_threads_last_message_at ON public.instagram_threads(workspace_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_threads_spam ON public.instagram_threads(workspace_id, is_spam);
CREATE INDEX IF NOT EXISTS idx_instagram_threads_workspace_status ON public.instagram_threads(workspace_id, lead_status);
CREATE INDEX IF NOT EXISTS idx_instagram_threads_workspace_assigned ON public.instagram_threads(workspace_id, assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_threads_priority_snooze ON public.instagram_threads(workspace_id, priority, priority_snoozed_until);
CREATE INDEX IF NOT EXISTS idx_instagram_threads_last_inbound ON public.instagram_threads(workspace_id, last_inbound_at DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_threads_last_outbound ON public.instagram_threads(workspace_id, last_outbound_at DESC);

ALTER TABLE public.instagram_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view Instagram threads" ON public.instagram_threads;
CREATE POLICY "Workspace members can view Instagram threads"
  ON public.instagram_threads FOR SELECT
  USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can update Instagram threads" ON public.instagram_threads;
CREATE POLICY "Workspace members can update Instagram threads"
  ON public.instagram_threads FOR UPDATE
  USING (is_workspace_member(workspace_id))
  WITH CHECK (is_workspace_member(workspace_id));

DROP TRIGGER IF EXISTS update_instagram_threads_updated_at ON public.instagram_threads;
CREATE TRIGGER update_instagram_threads_updated_at
  BEFORE UPDATE ON public.instagram_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.instagram_thread_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_instagram_thread_reads_workspace_user ON public.instagram_thread_reads(workspace_id, user_id);

ALTER TABLE public.instagram_thread_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their Instagram thread reads" ON public.instagram_thread_reads;
CREATE POLICY "Users can view their Instagram thread reads"
  ON public.instagram_thread_reads FOR SELECT
  USING (user_id = auth.uid() AND is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Users can manage their Instagram thread reads" ON public.instagram_thread_reads;
CREATE POLICY "Users can manage their Instagram thread reads"
  ON public.instagram_thread_reads FOR ALL
  USING (user_id = auth.uid() AND is_workspace_member(workspace_id))
  WITH CHECK (user_id = auth.uid() AND is_workspace_member(workspace_id));

DROP TRIGGER IF EXISTS update_instagram_thread_reads_updated_at ON public.instagram_thread_reads;
CREATE TRIGGER update_instagram_thread_reads_updated_at
  BEFORE UPDATE ON public.instagram_thread_reads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

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

-- Seed Hot Lead tag if absent in any workspace that has instagram threads.
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
