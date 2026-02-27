-- Harden RLS helper functions for deployments where some IDs are TEXT instead of UUID.
-- We compare IDs via `::text` to avoid `operator does not exist: uuid = text` failures in policies/triggers.

CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id::text = ws_id::text
      AND wm.user_id::text = auth.uid()::text
  )
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id::text = ws_id::text
      AND wm.user_id::text = auth.uid()::text
      AND wm.role::text = 'owner'
  )
$$;

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
      AND wm.user_id::text = auth.uid()::text
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
    AND wm.user_id::text = p_user_id::text
  LIMIT 1;

  RETURN v_role;
END;
$$;

-- `can_setter_access_thread` is used in inbox policies for threads/messages/tags/etc.
-- Ensure it compares user IDs safely across UUID/TEXT schemas.
CREATE OR REPLACE FUNCTION public.can_setter_access_thread(
  ws_id TEXT,
  conv_id TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.workspace_role_for_user(ws_id, p_user_id);
  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;

  IF v_role = 'owner' THEN
    RETURN TRUE;
  END IF;

  IF v_role <> 'setter' THEN
    RETURN FALSE;
  END IF;

  IF conv_id IS NULL OR btrim(conv_id) = '' THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.instagram_threads t
    WHERE t.workspace_id::text = ws_id
      AND t.conversation_id = conv_id
      AND COALESCE(t.hidden_from_setters, FALSE) = FALSE
      AND (
        t.assigned_user_id::text = p_user_id::text
        OR COALESCE(t.shared_with_setters, FALSE) = TRUE
      )
  );
END;
$$;

