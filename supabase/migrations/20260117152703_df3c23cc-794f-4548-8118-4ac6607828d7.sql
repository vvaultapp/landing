-- Fix workspace_members INSERT policy to be PERMISSIVE
DROP POLICY IF EXISTS "Users can join workspaces" ON public.workspace_members;

CREATE POLICY "Users can join workspaces"
ON public.workspace_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix onboarding_responses INSERT policy to be PERMISSIVE
DROP POLICY IF EXISTS "Owners can create onboarding" ON public.onboarding_responses;

CREATE POLICY "Owners can create onboarding"
ON public.onboarding_responses FOR INSERT
TO authenticated
WITH CHECK (is_workspace_owner(workspace_id));