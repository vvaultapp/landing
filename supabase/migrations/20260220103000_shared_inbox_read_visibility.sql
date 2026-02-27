-- Share inbox read state across owners/setters who can access a thread.

CREATE INDEX IF NOT EXISTS idx_instagram_thread_reads_workspace_conversation
  ON public.instagram_thread_reads(workspace_id, conversation_id);

ALTER TABLE public.instagram_thread_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their Instagram thread reads" ON public.instagram_thread_reads;
DROP POLICY IF EXISTS "Users can view visible Instagram thread reads" ON public.instagram_thread_reads;
DROP POLICY IF EXISTS "Users can view shared visible Instagram thread reads" ON public.instagram_thread_reads;
CREATE POLICY "Users can view shared visible Instagram thread reads"
  ON public.instagram_thread_reads FOR SELECT
  USING (
    public.can_setter_access_thread(workspace_id, conversation_id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage their Instagram thread reads" ON public.instagram_thread_reads;
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
