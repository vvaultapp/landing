-- Make workspace role/member helpers resilient to TEXT workspace IDs that are not UUID-castable.
-- This prevents false negatives in RLS checks on inbox and invite tables.

CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_ws_id TEXT;
BEGIN
  normalized_ws_id := NULLIF(btrim(ws_id), '');
  IF normalized_ws_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id::text = normalized_ws_id
      AND wm.user_id = auth.uid()
  );
END
$$;

CREATE OR REPLACE FUNCTION public.workspace_role_for_user(
  ws_id TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  normalized_ws_id TEXT;
BEGIN
  normalized_ws_id := NULLIF(btrim(ws_id), '');
  IF normalized_ws_id IS NULL OR p_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT wm.role::text
  INTO v_role
  FROM public.workspace_members wm
  WHERE wm.workspace_id::text = normalized_ws_id
    AND wm.user_id = p_user_id
  LIMIT 1;

  RETURN v_role;
END;
$$;

