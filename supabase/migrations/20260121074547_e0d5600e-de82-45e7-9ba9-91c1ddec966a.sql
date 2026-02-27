-- Fix workspace_members enumeration vulnerability by explicitly requiring authentication
DROP POLICY IF EXISTS "Members can view workspace members" ON workspace_members;

CREATE POLICY "Members can view workspace members" 
ON workspace_members 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_workspace_member(workspace_id));