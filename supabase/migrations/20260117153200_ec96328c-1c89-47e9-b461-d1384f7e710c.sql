-- Drop and recreate the INSERT policy with explicit public role (which includes both anon and authenticated)
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;

CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces FOR INSERT
TO public
WITH CHECK (auth.uid() IS NOT NULL);