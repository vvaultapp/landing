-- Instagram inbox metadata: threads, user profiles, and read markers.
-- This improves sender display, profile pictures, and enables manual "Priority" and per-user "Unread".

-- Ensure pgcrypto is available for gen_random_uuid
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

-- Threads (one per Instagram user; Meta does not support group messaging for this API)
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, conversation_id),
  UNIQUE(workspace_id, instagram_account_id, instagram_user_id)
);

CREATE INDEX IF NOT EXISTS idx_instagram_threads_workspace ON public.instagram_threads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_instagram_threads_priority ON public.instagram_threads(workspace_id, priority);
CREATE INDEX IF NOT EXISTS idx_instagram_threads_last_message_at ON public.instagram_threads(workspace_id, last_message_at DESC);

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

-- Cached Instagram user profiles (username / profile picture).
-- Populated by Edge Functions using the workspace's Instagram access token.
CREATE TABLE IF NOT EXISTS public.instagram_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  instagram_user_id TEXT NOT NULL,
  username TEXT,
  name TEXT,
  profile_pic_url TEXT,
  profile_pic_storage_path TEXT,
  profile_pic_public_url TEXT,
  profile_fetched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, instagram_user_id)
);

CREATE INDEX IF NOT EXISTS idx_instagram_users_workspace ON public.instagram_users(workspace_id);
CREATE INDEX IF NOT EXISTS idx_instagram_users_user ON public.instagram_users(workspace_id, instagram_user_id);

ALTER TABLE public.instagram_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view Instagram users" ON public.instagram_users;
CREATE POLICY "Workspace members can view Instagram users"
  ON public.instagram_users FOR SELECT
  USING (is_workspace_member(workspace_id));

DROP TRIGGER IF EXISTS update_instagram_users_updated_at ON public.instagram_users;
CREATE TRIGGER update_instagram_users_updated_at
  BEFORE UPDATE ON public.instagram_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Per-user read markers (drives Unread tab).
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

