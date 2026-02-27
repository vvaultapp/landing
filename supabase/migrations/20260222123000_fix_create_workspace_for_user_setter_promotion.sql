-- Prevent create_workspace_for_user from promoting existing setter memberships to owner.
-- Existing members should keep their role; only brand-new bootstrap users should be provisioned as owners.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
  v_existing_owner_workspace_id UUID;
  v_existing_member_workspace_id UUID;
  v_display_name TEXT;
  v_portal_id_type TEXT;
  v_normalized_workspace_name TEXT;
BEGIN
  v_normalized_workspace_name := COALESCE(NULLIF(btrim(p_workspace_name), ''), 'Workspace');

  -- Owner should keep owner workspace if one already exists.
  SELECT wm.workspace_id
  INTO v_existing_owner_workspace_id
  FROM public.workspace_members wm
  WHERE wm.user_id::text = p_user_id::text
    AND wm.role = 'owner'
  ORDER BY wm.created_at DESC
  LIMIT 1;

  IF v_existing_owner_workspace_id IS NOT NULL THEN
    UPDATE public.profiles
    SET current_workspace_id = v_existing_owner_workspace_id,
        onboarding_completed = TRUE,
        updated_at = now()
    WHERE id::text = p_user_id::text;

    RETURN v_existing_owner_workspace_id;
  END IF;

  -- If the user already belongs to a workspace (setter/member), do not mutate role.
  SELECT wm.workspace_id
  INTO v_existing_member_workspace_id
  FROM public.workspace_members wm
  WHERE wm.user_id::text = p_user_id::text
  ORDER BY wm.created_at DESC
  LIMIT 1;

  IF v_existing_member_workspace_id IS NOT NULL THEN
    UPDATE public.profiles
    SET current_workspace_id = v_existing_member_workspace_id,
        onboarding_completed = TRUE,
        updated_at = now()
    WHERE id::text = p_user_id::text;

    RETURN v_existing_member_workspace_id;
  END IF;

  -- Ensure profile row exists.
  INSERT INTO public.profiles (id, display_name, full_name, email_verified, onboarding_completed)
  VALUES (p_user_id, NULL, NULL, TRUE, TRUE)
  ON CONFLICT (id) DO NOTHING;

  -- Create workspace.
  INSERT INTO public.workspaces (name)
  VALUES (v_normalized_workspace_name)
  RETURNING id INTO v_workspace_id;

  -- Resolve owner display name from profile only; fallback to "Owner".
  SELECT COALESCE(NULLIF(btrim(full_name), ''), NULLIF(btrim(display_name), ''))
  INTO v_display_name
  FROM public.profiles
  WHERE id::text = p_user_id::text
  LIMIT 1;

  IF v_display_name IS NULL OR btrim(v_display_name) = '' THEN
    v_display_name := 'Owner';
  END IF;

  -- Ensure owner workspace membership.
  INSERT INTO public.workspace_members (workspace_id, user_id, role, display_name)
  VALUES (v_workspace_id, p_user_id, 'owner', v_display_name)
  ON CONFLICT (workspace_id, user_id) DO UPDATE
  SET role = 'owner',
      display_name = COALESCE(NULLIF(v_display_name, ''), public.workspace_members.display_name),
      updated_at = now();

  -- Ensure coach portal role exists.
  SELECT c.data_type
  INTO v_portal_id_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'portal_roles'
    AND c.column_name = 'id'
  LIMIT 1;

  IF NOT EXISTS (
    SELECT 1
    FROM public.portal_roles pr
    WHERE pr.user_id::text = p_user_id::text
      AND pr.workspace_id::text = v_workspace_id::text
  ) THEN
    IF v_portal_id_type = 'uuid' THEN
      INSERT INTO public.portal_roles (id, user_id, workspace_id, role, client_id, created_at)
      VALUES (gen_random_uuid(), p_user_id, v_workspace_id, 'coach', NULL, now());
    ELSE
      INSERT INTO public.portal_roles (id, user_id, workspace_id, role, client_id, created_at)
      VALUES (gen_random_uuid()::text, p_user_id, v_workspace_id, 'coach', NULL, now());
    END IF;
  END IF;

  -- Ensure onboarding row exists.
  IF NOT EXISTS (
    SELECT 1
    FROM public.onboarding_responses o
    WHERE o.workspace_id::text = v_workspace_id::text
  ) THEN
    INSERT INTO public.onboarding_responses (workspace_id, business_name)
    VALUES (v_workspace_id, v_normalized_workspace_name);
  END IF;

  -- Keep profile workspace pointer aligned.
  UPDATE public.profiles
  SET current_workspace_id = v_workspace_id,
      onboarding_completed = TRUE,
      updated_at = now()
  WHERE id::text = p_user_id::text;

  RETURN v_workspace_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_workspace_for_user(TEXT, UUID) TO authenticated;
