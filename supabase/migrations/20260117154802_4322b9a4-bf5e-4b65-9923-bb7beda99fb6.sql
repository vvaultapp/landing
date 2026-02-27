-- First drop all existing INSERT policies on workspaces
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "workspace_insert_for_authenticated" ON public.workspaces;

-- Create a simple PERMISSIVE INSERT policy that allows any authenticated user
CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK (true);