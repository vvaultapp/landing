-- Harden owner workspace bootstrap for fresh Google sign-ins.
-- Goal: make owner provisioning resilient even when legacy trigger/default drift exists.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.ensure_portal_roles_id_default()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_data_type TEXT;
BEGIN
  SELECT c.data_type
  INTO v_data_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'portal_roles'
    AND c.column_name = 'id'
  LIMIT 1;

  IF v_data_type IS NULL THEN
    RETURN;
  END IF;

  IF v_data_type = 'uuid' THEN
    EXECUTE 'ALTER TABLE public.portal_roles ALTER COLUMN id SET DEFAULT gen_random_uuid()';
  ELSE
    EXECUTE 'ALTER TABLE public.portal_roles ALTER COLUMN id SET DEFAULT gen_random_uuid()::text';
  END IF;

  EXECUTE 'ALTER TABLE public.portal_roles ALTER COLUMN id SET NOT NULL';
END
$$;

SELECT public.ensure_portal_roles_id_default();

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
  v_display_name TEXT;
  v_portal_id_type TEXT;
  v_existing_workspace_id UUID;
BEGIN
  PERFORM public.ensure_portal_roles_id_default();

  -- If the user already owns a workspace, reuse it instead of creating duplicates.
  SELECT wm.workspace_id
  INTO v_existing_workspace_id
  FROM public.workspace_members wm
  WHERE wm.user_id::text = p_user_id::text
    AND wm.role = 'owner'
  ORDER BY wm.created_at DESC
  LIMIT 1;

  IF v_existing_workspace_id IS NOT NULL THEN
    UPDATE public.profiles
    SET current_workspace_id = v_existing_workspace_id,
        onboarding_completed = TRUE
    WHERE id::text = p_user_id::text;

    RETURN v_existing_workspace_id;
  END IF;

  -- Ensure profile row exists (can be missing for fresh OAuth races).
  INSERT INTO public.profiles (id, display_name, full_name, email_verified, onboarding_completed)
  SELECT
    p_user_id,
    split_part(u.email, '@', 1),
    NULL,
    TRUE,
    TRUE
  FROM auth.users u
  WHERE u.id::text = p_user_id::text
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.workspaces (name)
  VALUES (p_workspace_name)
  RETURNING id INTO v_workspace_id;

  SELECT COALESCE(NULLIF(btrim(full_name), ''), NULLIF(btrim(display_name), ''))
  INTO v_display_name
  FROM public.profiles
  WHERE id::text = p_user_id::text;

  IF v_display_name IS NULL THEN
    SELECT split_part(email, '@', 1)
    INTO v_display_name
    FROM auth.users
    WHERE id::text = p_user_id::text;
  END IF;

  INSERT INTO public.workspace_members (workspace_id, user_id, role, display_name)
  VALUES (v_workspace_id, p_user_id, 'owner', v_display_name)
  ON CONFLICT (workspace_id, user_id) DO UPDATE
  SET role = 'owner',
      display_name = EXCLUDED.display_name,
      updated_at = now();

  -- Ensure a coach portal role exists with explicit id typing.
  SELECT c.data_type
  INTO v_portal_id_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'portal_roles'
    AND c.column_name = 'id'
  LIMIT 1;

  IF v_portal_id_type = 'uuid' THEN
    INSERT INTO public.portal_roles (id, user_id, workspace_id, role, client_id, created_at)
    VALUES (gen_random_uuid(), p_user_id, v_workspace_id, 'coach', NULL, now())
    ON CONFLICT (user_id, workspace_id) DO NOTHING;
  ELSE
    INSERT INTO public.portal_roles (id, user_id, workspace_id, role, client_id, created_at)
    VALUES (gen_random_uuid()::text, p_user_id, v_workspace_id, 'coach', NULL, now())
    ON CONFLICT (user_id, workspace_id) DO NOTHING;
  END IF;

  INSERT INTO public.onboarding_responses (workspace_id, business_name)
  VALUES (v_workspace_id, p_workspace_name)
  ON CONFLICT DO NOTHING;

  UPDATE public.profiles
  SET current_workspace_id = v_workspace_id,
      onboarding_completed = TRUE
  WHERE id::text = p_user_id::text;

  RETURN v_workspace_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_portal_roles_id_default() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_workspace_for_user(TEXT, UUID) TO authenticated;

-- Repair users that have a selected workspace but no membership rows at all.
WITH orphan_profiles AS (
  SELECT
    p.id AS user_id,
    p.current_workspace_id AS workspace_id
  FROM public.profiles p
  WHERE p.current_workspace_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.workspaces w
      WHERE w.id::text = p.current_workspace_id::text
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.workspace_members wm
      WHERE wm.user_id::text = p.id::text
    )
)
INSERT INTO public.workspace_members (workspace_id, user_id, role, display_name)
SELECT
  o.workspace_id,
  o.user_id,
  'owner',
  COALESCE(
    NULLIF(btrim(pr.full_name), ''),
    NULLIF(btrim(pr.display_name), ''),
    split_part(au.email, '@', 1)
  ) AS display_name
FROM orphan_profiles o
LEFT JOIN public.profiles pr ON pr.id::text = o.user_id::text
LEFT JOIN auth.users au ON au.id::text = o.user_id::text
ON CONFLICT (workspace_id, user_id) DO UPDATE
SET role = 'owner',
    display_name = EXCLUDED.display_name,
    updated_at = now();

-- Keep profile.current_workspace_id aligned to a valid membership.
WITH preferred AS (
  SELECT
    p.id AS user_id,
    COALESCE(
      (
        SELECT wm.workspace_id
        FROM public.workspace_members wm
        WHERE wm.user_id::text = p.id::text
          AND wm.role = 'owner'
        ORDER BY wm.created_at DESC
        LIMIT 1
      ),
      (
        SELECT wm.workspace_id
        FROM public.workspace_members wm
        WHERE wm.user_id::text = p.id::text
        ORDER BY wm.created_at DESC
        LIMIT 1
      )
    ) AS preferred_workspace_id
  FROM public.profiles p
  WHERE p.current_workspace_id IS NULL
     OR NOT EXISTS (
       SELECT 1
       FROM public.workspace_members wm
       WHERE wm.user_id::text = p.id::text
         AND wm.workspace_id::text = p.current_workspace_id::text
     )
)
UPDATE public.profiles p
SET current_workspace_id = pref.preferred_workspace_id
FROM preferred pref
WHERE p.id::text = pref.user_id::text
  AND pref.preferred_workspace_id IS NOT NULL
  AND (p.current_workspace_id IS NULL OR p.current_workspace_id::text <> pref.preferred_workspace_id::text);
