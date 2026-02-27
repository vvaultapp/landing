-- Fix the onboarding_responses INSERT policy to allow initial creation
-- The user must own the workspace OR be creating initial onboarding for a workspace they just created
DROP POLICY IF EXISTS "Owners can create onboarding" ON public.onboarding_responses;

-- Allow authenticated users to create onboarding if they're a workspace owner
-- This will work AFTER they've been added to workspace_members
CREATE POLICY "Owners can create onboarding"
ON public.onboarding_responses FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.workspace_id = onboarding_responses.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role = 'owner'
  )
);