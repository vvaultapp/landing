-- Create a SECURITY DEFINER function to create workspace during onboarding
-- This bypasses RLS completely for the initial workspace creation
CREATE OR REPLACE FUNCTION public.create_workspace_for_user(
  p_workspace_name TEXT,
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  -- Create the workspace
  INSERT INTO public.workspaces (name)
  VALUES (p_workspace_name)
  RETURNING id INTO v_workspace_id;
  
  -- Add user as owner
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, p_user_id, 'owner');
  
  -- Create onboarding record
  INSERT INTO public.onboarding_responses (workspace_id, business_name)
  VALUES (v_workspace_id, p_workspace_name);
  
  -- Update user profile
  UPDATE public.profiles
  SET current_workspace_id = v_workspace_id
  WHERE id = p_user_id;
  
  RETURN v_workspace_id;
END;
$$;