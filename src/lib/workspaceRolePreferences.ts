export type WorkspaceRoleContext = 'main_app' | 'setter_portal' | 'client_portal';

export type PortalRoleRowLike = {
  role?: string | null;
  workspace_id?: string | null;
  client_id?: string | null;
};

export type WorkspaceMemberRowLike = {
  role?: string | null;
  workspace_id?: string | null;
  created_at?: string | null;
};

export function inferWorkspaceRoleContext(pathname: string): WorkspaceRoleContext {
  const normalized = String(pathname || '');
  if (normalized.startsWith('/setter-portal')) return 'setter_portal';
  if (normalized.startsWith('/portal')) return 'client_portal';
  return 'main_app';
}

export function pickPreferredPortalRoleRow<T extends PortalRoleRowLike>(
  rows: T[],
  context: WorkspaceRoleContext,
  signInIntentOwner = false,
): T | null {
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const findClient = () =>
    rows.find((r) => r.role === 'client' && (r.client_id != null ? String(r.client_id).trim() !== '' : false)) ||
    rows.find((r) => r.role === 'client');
  const findSetter = () => rows.find((r) => r.role === 'setter');
  const findCoach = () => rows.find((r) => r.role === 'coach');

  if (context === 'client_portal') {
    return findClient() || findSetter() || findCoach() || rows[0] || null;
  }
  if (context === 'setter_portal') {
    return findSetter() || findCoach() || findClient() || rows[0] || null;
  }

  // Main app: setter-first keeps invited setter accounts in limited mode even when they also
  // have a coach role row from legacy owner bootstrap flows.
  return findSetter() || findCoach() || findClient() || rows[0] || null;
}

export function pickPreferredWorkspaceMemberRow<T extends WorkspaceMemberRowLike>(
  rows: T[],
  context: WorkspaceRoleContext,
  signInIntentOwner: boolean,
): T | null {
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const owner = rows.find((r) => r.role === 'owner');
  const setter = rows.find((r) => r.role === 'setter');

  if (context === 'setter_portal') {
    return setter || owner || rows[0] || null;
  }

  if (context === 'main_app') {
    // Main app: setter-first avoids invited setter accounts being treated as owners when both
    // roles exist across workspaces.
    return setter || owner || rows[0] || null;
  }

  if (context === 'client_portal') {
    return owner || setter || rows[0] || null;
  }

  return owner || setter || rows[0] || null;
}
