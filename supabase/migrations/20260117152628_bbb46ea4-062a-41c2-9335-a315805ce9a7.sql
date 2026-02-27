-- Fix the workspaces INSERT policy - change from RESTRICTIVE to PERMISSIVE
-- RESTRICTIVE policies only restrict; we need a PERMISSIVE policy to grant access

DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;

CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);