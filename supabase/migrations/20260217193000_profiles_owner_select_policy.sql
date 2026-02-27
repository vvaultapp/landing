-- Allow workspace owners to read member profiles (names/avatars) so Team + assignment UIs
-- can show the real name a setter entered at signup instead of falling back to email prefix.

-- NOTE: profiles has strict RLS by default (self-only). This policy expands SELECT only
-- for owners to members of their own workspaces.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace owners can view member profiles" ON public.profiles;
CREATE POLICY "Workspace owners can view member profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.workspace_members me
      JOIN public.workspace_members them
        ON them.workspace_id::text = me.workspace_id::text
      WHERE me.user_id::text = auth.uid()::text
        AND me.role::text = 'owner'
        AND them.user_id::text = public.profiles.id::text
    )
  );

