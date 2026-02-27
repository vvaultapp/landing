-- Allow client-portal users to view only their own meetings.

DROP POLICY IF EXISTS "Clients can view their own meetings" ON public.meetings;
CREATE POLICY "Clients can view their own meetings"
  ON public.meetings FOR SELECT
  USING (
    client_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id::text = meetings.client_id::text
        AND c.user_id::text = auth.uid()::text
    )
  );
