-- Fix permissive RLS policies for email_verifications and password_resets
-- These tables are managed by edge functions, so we use service role there
-- But we need to restrict client access

-- Drop overly permissive policies
DROP POLICY IF EXISTS "System can create verifications" ON public.email_verifications;
DROP POLICY IF EXISTS "System can update verifications" ON public.email_verifications;
DROP POLICY IF EXISTS "System can create resets" ON public.password_resets;
DROP POLICY IF EXISTS "System can update resets" ON public.password_resets;
DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;

-- Email verifications - only allow users to view their own (edge function uses service role)
-- No INSERT/UPDATE from client side

-- Password resets - only allow users to view their own (edge function uses service role)
-- No INSERT/UPDATE from client side

-- Workspaces - users can create if they're authenticated
CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);