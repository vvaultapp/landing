-- Fix client visibility/create issues for owner accounts.
-- 1) Backfill missing coach portal_roles for existing workspace owners.
-- 2) Ensure clients policies allow workspace owners directly (not only portal coach role).

-- Backfill owners into portal_roles as coach where missing.
INSERT INTO public.portal_roles (id, user_id, workspace_id, role, client_id, created_at)
SELECT
  gen_random_uuid(),
  wm.user_id,
  wm.workspace_id,
  'coach',
  NULL,
  now()
FROM public.workspace_members wm
WHERE wm.role = 'owner'
  AND NOT EXISTS (
    SELECT 1
    FROM public.portal_roles pr
    WHERE pr.user_id = wm.user_id
      AND pr.workspace_id = wm.workspace_id
  );

-- Recreate clients policies with owner+coach visibility.
DROP POLICY IF EXISTS "Coaches can view workspace clients" ON public.clients;
DROP POLICY IF EXISTS "Clients can view their own record" ON public.clients;
DROP POLICY IF EXISTS "Coaches can create clients" ON public.clients;
DROP POLICY IF EXISTS "Coaches can update clients" ON public.clients;
DROP POLICY IF EXISTS "Clients can update their own record" ON public.clients;
DROP POLICY IF EXISTS "Coaches can delete clients" ON public.clients;

DROP POLICY IF EXISTS "Owners or coaches can view workspace clients" ON public.clients;
CREATE POLICY "Owners or coaches can view workspace clients"
ON public.clients FOR SELECT
USING (
  public.is_workspace_owner(workspace_id)
);

DROP POLICY IF EXISTS "Clients can view their own client record" ON public.clients;
CREATE POLICY "Clients can view their own client record"
ON public.clients FOR SELECT
USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Owners or coaches can create clients" ON public.clients;
CREATE POLICY "Owners or coaches can create clients"
ON public.clients FOR INSERT
WITH CHECK (
  public.is_workspace_owner(workspace_id)
);

DROP POLICY IF EXISTS "Owners or coaches can update clients" ON public.clients;
CREATE POLICY "Owners or coaches can update clients"
ON public.clients FOR UPDATE
USING (
  public.is_workspace_owner(workspace_id)
)
WITH CHECK (
  public.is_workspace_owner(workspace_id)
);

DROP POLICY IF EXISTS "Clients can update their own client record" ON public.clients;
CREATE POLICY "Clients can update their own client record"
ON public.clients FOR UPDATE
USING (user_id::text = auth.uid()::text)
WITH CHECK (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Owners or coaches can delete clients" ON public.clients;
CREATE POLICY "Owners or coaches can delete clients"
ON public.clients FOR DELETE
USING (
  public.is_workspace_owner(workspace_id)
);
