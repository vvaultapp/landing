-- Allow workspace members to insert missing instagram_threads rows.
-- This is required for client-side fallback upserts when a conversation exists in
-- instagram_messages but does not yet have a threads row.

ALTER TABLE public.instagram_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can insert Instagram threads" ON public.instagram_threads;
CREATE POLICY "Workspace members can insert Instagram threads"
  ON public.instagram_threads FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

