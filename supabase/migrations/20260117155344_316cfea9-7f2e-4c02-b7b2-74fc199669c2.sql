-- Drop ALL existing policies on workspaces table
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Owners can update their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Owners can delete their workspaces" ON public.workspaces;

-- Recreate ALL policies explicitly as PERMISSIVE
CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their workspaces"
ON public.workspaces
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (is_workspace_member(id));

CREATE POLICY "Owners can update their workspaces"
ON public.workspaces
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (is_workspace_owner(id));

CREATE POLICY "Owners can delete their workspaces"
ON public.workspaces
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (is_workspace_owner(id));