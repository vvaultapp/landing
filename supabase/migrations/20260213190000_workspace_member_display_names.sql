-- Ensure workspace member display names are persisted for both owners and setters.
-- This keeps Team pages stable without requiring cross-user profile reads (profiles has strict RLS).

-- 1) Create workspace with owner membership that has a display_name.
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
BEGIN
  INSERT INTO public.workspaces (name)
  VALUES (p_workspace_name)
  RETURNING id INTO v_workspace_id;

  SELECT COALESCE(full_name, display_name)
  INTO v_display_name
  FROM public.profiles
  WHERE id::text = p_user_id::text;

  IF v_display_name IS NULL OR btrim(v_display_name) = '' THEN
    SELECT split_part(email, '@', 1)
    INTO v_display_name
    FROM auth.users
    WHERE id::text = p_user_id::text;
  END IF;

  INSERT INTO public.workspace_members (workspace_id, user_id, role, display_name)
  VALUES (v_workspace_id, p_user_id, 'owner', v_display_name);

  INSERT INTO public.onboarding_responses (workspace_id, business_name)
  VALUES (v_workspace_id, p_workspace_name);

  UPDATE public.profiles
  SET current_workspace_id = v_workspace_id
  WHERE id = p_user_id;

  RETURN v_workspace_id;
END;
$$;

-- 2) Backfill owner display names.
UPDATE public.workspace_members wm
SET
  display_name = COALESCE(p.full_name, p.display_name, split_part(u.email, '@', 1)),
  updated_at = now()
FROM public.profiles p
LEFT JOIN auth.users u ON u.id::text = p.id::text
WHERE wm.user_id::text = p.id::text
  AND wm.role = 'owner'
  AND (wm.display_name IS NULL OR btrim(wm.display_name) = '');

-- 3) Backfill setter display names when legacy placeholders were used.
UPDATE public.workspace_members wm
SET
  display_name = COALESCE(p.full_name, p.display_name, split_part(u.email, '@', 1)),
  updated_at = now()
FROM public.profiles p
LEFT JOIN auth.users u ON u.id::text = p.id::text
WHERE wm.user_id::text = p.id::text
  AND wm.role = 'setter'
  AND (
    wm.display_name IS NULL
    OR btrim(wm.display_name) = ''
    OR wm.display_name ILIKE '%(APPT STTR)%'
    OR wm.display_name ILIKE '%APPT STTR%'
  );
