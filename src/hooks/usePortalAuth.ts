import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Client, mapDbRowToClient, PortalRole } from '@/types/client-portal';
import {
  inferWorkspaceRoleContext,
  pickPreferredPortalRoleRow,
  pickPreferredWorkspaceMemberRow,
} from '@/lib/workspaceRolePreferences';
import { hasSetterMetadataHint, hasSetterRoleHint, setSetterRoleHint } from '@/lib/setterRoleHint';

interface PortalAuthState {
  portalRole: PortalRole | null;
  client: Client | null;
  workspaceId: string | null;
  loading: boolean;
  error: Error | null;
  isAccessBlocked: boolean;
  blockReason: 'paused' | 'expired' | null;
}

type PortalAuthCache = {
  userId: string;
  context: string;
  value: PortalAuthState;
  cachedAtMs: number;
};

const PORTAL_AUTH_CACHE_TTL_MS = 60_000;
let portalAuthCache: PortalAuthCache | null = null;

export function usePortalAuth() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const pathname = typeof window !== 'undefined' ? window.location.pathname || '' : '';
  const roleContext = inferWorkspaceRoleContext(pathname);
  const [state, setState] = useState<PortalAuthState>(() => {
    const cached = portalAuthCache;
    const stillValid =
      cached &&
      user?.id &&
      cached.userId === user.id &&
      cached.context === roleContext &&
      Date.now() - cached.cachedAtMs < PORTAL_AUTH_CACHE_TTL_MS;

    if (stillValid) return cached.value;

    return {
      portalRole: null,
      client: null,
      workspaceId: null,
      loading: authLoading ? true : Boolean(user),
      error: null,
      isAccessBlocked: false,
      blockReason: null,
    };
  });

  const fetchPortalRole = useCallback(async () => {
    if (!user) {
      portalAuthCache = null;
      setState({
        portalRole: null,
        client: null,
        workspaceId: null,
        loading: false,
        error: null,
        isAccessBlocked: false,
        blockReason: null,
      });
      return;
    }

    try {
      const signInIntentSetter =
        typeof window !== 'undefined' && window.sessionStorage.getItem('acq_signin_intent') === 'setter';
      const signInIntentOwner =
        typeof window !== 'undefined' && window.sessionStorage.getItem('acq_signin_intent') === 'owner';
      const setterHintActive = hasSetterRoleHint(user.id) || hasSetterMetadataHint(user.user_metadata);
      let ownerIntentActive = signInIntentOwner && !signInIntentSetter && !setterHintActive;

      const persistSetterHint = () => {
        setSetterRoleHint(user.id);
      };

      const selfHealDriftedOwnerRole = async (workspaceId: string | null) => {
        const targetWorkspaceId = String(workspaceId || '').trim();
        if (!targetWorkspaceId || roleContext === 'client_portal') return;

        try {
          const { data: ownerRows, error: ownerRowsError } = await supabase
            .from('workspace_members')
            .select('user_id,role')
            .eq('workspace_id', targetWorkspaceId)
            .eq('role', 'owner');

          if (ownerRowsError) {
            console.warn('Failed to inspect owner rows for setter self-heal:', ownerRowsError);
            return;
          }

          const owners = Array.isArray(ownerRows) ? ownerRows : [];
          const hasAnotherOwner = owners.some(
            (row) => String((row as any)?.user_id || '').trim() !== user.id,
          );
          const includesSelfAsOwner = owners.some(
            (row) => String((row as any)?.user_id || '').trim() === user.id,
          );

          if (!includesSelfAsOwner || !hasAnotherOwner) return;

          const { error: demoteError } = await supabase
            .from('workspace_members')
            .update({ role: 'setter' })
            .eq('workspace_id', targetWorkspaceId)
            .eq('user_id', user.id)
            .eq('role', 'owner');

          if (demoteError) {
            console.warn('Failed to self-heal drifted setter owner role:', demoteError);
          }
        } catch (selfHealError) {
          console.warn('Setter role self-heal failed:', selfHealError);
        }
      };

      if ((signInIntentSetter || setterHintActive) && roleContext !== 'client_portal') {
        const desiredWorkspaceId = String(profile?.current_workspace_id || '').trim() || null;
        await selfHealDriftedOwnerRole(desiredWorkspaceId);
        persistSetterHint();
        const nextState: PortalAuthState = {
          portalRole: 'setter',
          client: null,
          workspaceId: desiredWorkspaceId,
          loading: false,
          error: null,
          isAccessBlocked: false,
          blockReason: null,
        };
        setState(nextState);
        portalAuthCache = { userId: user.id, context: roleContext, value: nextState, cachedAtMs: Date.now() };
        return;
      }

      // Workspace membership is the ground truth for main-app/setter routing.
      // Prefer setter membership when present so invited setter accounts remain in the setter app,
      // even if portal_roles drifted to coach-only rows.
      let memberRows: Array<{ workspace_id: string; role: string; created_at: string | null }> = [];
      try {
        const { data: rawMembers, error: memberRowsError } = await supabase
          .from('workspace_members')
          .select('workspace_id,role,created_at')
          .eq('user_id', user.id)
          .in('role', ['owner', 'setter'])
          .order('created_at', { ascending: false })
          .limit(20);

        if (memberRowsError) throw memberRowsError;

        memberRows = (Array.isArray(rawMembers) ? rawMembers : []).map((m) => ({
          workspace_id: String((m as any)?.workspace_id || '').trim(),
          role: String((m as any)?.role || '').trim(),
          created_at: (m as any)?.created_at ? String((m as any).created_at) : null,
        }));

        const hasSetterMembership = memberRows.some((m) => m.role === 'setter' && m.workspace_id);
        if (hasSetterMembership && roleContext !== 'client_portal') {
          ownerIntentActive = false;
          persistSetterHint();
          const preferredSetterMember = pickPreferredWorkspaceMemberRow(
            memberRows,
            'setter_portal',
            false,
          );
          const desiredWorkspaceId = String(preferredSetterMember?.workspace_id || '').trim();

          try {
            if (desiredWorkspaceId && String(profile?.current_workspace_id || '') !== desiredWorkspaceId) {
              await updateProfile({ current_workspace_id: desiredWorkspaceId });
            }
          } catch (err) {
            console.warn('Failed to align setter current workspace from membership fallback:', err);
          }

          const nextState: PortalAuthState = {
            portalRole: 'setter',
            client: null,
            workspaceId: desiredWorkspaceId || null,
            loading: false,
            error: null,
            isAccessBlocked: false,
            blockReason: null,
          };
          setState(nextState);
          portalAuthCache = { userId: user.id, context: roleContext, value: nextState, cachedAtMs: Date.now() };
          return;
        }
      } catch (memberFetchError) {
        console.warn('Failed to fetch workspace memberships for portal role resolution:', memberFetchError);
      }

      // Fetch all portal roles for this user. A user can exist in multiple workspaces.
      const { data: roleRows, error: roleError } = await supabase
        .from('portal_roles')
        .select('*')
        .eq('user_id', user.id);

      if (roleError) throw roleError;

      const allRoles = roleRows || [];
      const roleData = pickPreferredPortalRoleRow(allRoles, roleContext, ownerIntentActive);

      if (!roleData) {
        // Fallback: if portal_roles row is missing but the user is already linked to a client record,
        // treat as client so they cannot access owner/setter routes.
        const { data: linkedClient, error: linkedClientError } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (linkedClientError) throw linkedClientError;

        if (linkedClient) {
          const client = mapDbRowToClient(linkedClient);
          const now = new Date();
          const isPaused = client.subscriptionStatus === 'paused';
          const isExpired = client.accessUntil && client.accessUntil < now;

          setState({
            portalRole: 'client',
            client,
            workspaceId: linkedClient.workspace_id,
            loading: false,
            error: null,
            isAccessBlocked: isPaused || isExpired,
            blockReason: isPaused ? 'paused' : isExpired ? 'expired' : null,
          });
          portalAuthCache = {
            userId: user.id,
            context: roleContext,
            value: {
              portalRole: 'client',
              client,
              workspaceId: linkedClient.workspace_id,
              loading: false,
              error: null,
              isAccessBlocked: isPaused || isExpired,
              blockReason: isPaused ? 'paused' : isExpired ? 'expired' : null,
            },
            cachedAtMs: Date.now(),
          };
          return;
        }

        // No portal role found - fallback to workspace_members.
        const preferredMember = pickPreferredWorkspaceMemberRow(
          memberRows,
          roleContext,
          ownerIntentActive,
        );

        if (preferredMember?.role === 'setter') {
          persistSetterHint();
          // If this user is a setter, ensure the app is pointed at the coach workspace.
          // Some legacy setter accounts may not have a portal_roles row, so we align
          // current_workspace_id from workspace_members as a fallback.
          try {
            const desiredWorkspaceId = String(preferredMember.workspace_id || '').trim();
            if (desiredWorkspaceId && String(profile?.current_workspace_id || '') !== desiredWorkspaceId) {
              await updateProfile({ current_workspace_id: desiredWorkspaceId });
            }
          } catch (err) {
            console.warn('Failed to align setter current workspace:', err);
          }

          const nextState: PortalAuthState = {
            portalRole: 'setter',
            client: null,
            workspaceId: preferredMember.workspace_id,
            loading: false,
            error: null,
            isAccessBlocked: false,
            blockReason: null,
          };
          setState(nextState);
          portalAuthCache = { userId: user.id, context: roleContext, value: nextState, cachedAtMs: Date.now() };
          return;
        }

        if (preferredMember?.role === 'owner') {
          // User is a workspace owner/coach
          const nextState: PortalAuthState = {
            portalRole: 'coach',
            client: null,
            workspaceId: preferredMember.workspace_id,
            loading: false,
            error: null,
            isAccessBlocked: false,
            blockReason: null,
          };
          setState(nextState);
          portalAuthCache = { userId: user.id, context: roleContext, value: nextState, cachedAtMs: Date.now() };
          return;
        }

        const nextState: PortalAuthState = {
          portalRole: null,
          client: null,
          workspaceId: null,
          loading: false,
          error: null,
          isAccessBlocked: false,
          blockReason: null,
        };
        setState(nextState);
        portalAuthCache = { userId: user.id, context: roleContext, value: nextState, cachedAtMs: Date.now() };
        return;
      }

      const role = roleData.role as PortalRole;
      const workspaceId = roleData.workspace_id;

      // If client role, fetch client data
      if (role === 'client' && roleData.client_id) {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', roleData.client_id)
          .maybeSingle();

        if (clientError) throw clientError;

        if (clientData) {
          const client = mapDbRowToClient(clientData);
          
          // Check access gating
          const now = new Date();
          const isPaused = client.subscriptionStatus === 'paused';
          const isExpired = client.accessUntil && client.accessUntil < now;

          const nextState: PortalAuthState = {
            portalRole: role,
            client,
            workspaceId,
            loading: false,
            error: null,
            isAccessBlocked: isPaused || isExpired,
            blockReason: isPaused ? 'paused' : isExpired ? 'expired' : null,
          };
          setState(nextState);
          portalAuthCache = { userId: user.id, context: roleContext, value: nextState, cachedAtMs: Date.now() };
          return;
        }
      }

      // Setter role
      if (role === 'setter') {
        persistSetterHint();
        // Best-effort: setter accounts must be real workspace members to access inbox/leads RLS.
        // Some login flows can end up with only a portal_roles row (no workspace_members row), which
        // makes the setter dashboard render but denies all data access.
        try {
          const desiredWorkspaceId = String(workspaceId || '').trim();
          if (desiredWorkspaceId) {
            const desiredDisplayName = String(
              profile?.full_name || profile?.display_name || user.email?.split('@')[0] || ''
            ).trim();

            const { error: joinError } = await supabase.from('workspace_members').insert({
              workspace_id: desiredWorkspaceId,
              user_id: user.id,
              role: 'setter',
              display_name: desiredDisplayName || null,
            });

            // Ignore duplicates (already a member).
            if (joinError && String((joinError as any)?.code || '') !== '23505') {
              console.warn('Failed to ensure workspace_members row for setter:', joinError);
            }

            if (String(profile?.current_workspace_id || '') !== desiredWorkspaceId) {
              await updateProfile({ current_workspace_id: desiredWorkspaceId });
            }
          }
        } catch (err) {
          console.warn('Setter workspace self-heal failed:', err);
        }

        const nextState: PortalAuthState = {
          portalRole: 'setter',
          client: null,
          workspaceId,
          loading: false,
          error: null,
          isAccessBlocked: false,
          blockReason: null,
        };
        setState(nextState);
        portalAuthCache = { userId: user.id, context: roleContext, value: nextState, cachedAtMs: Date.now() };
        return;
      }

      const nextState: PortalAuthState = {
        portalRole: role,
        client: null,
        workspaceId,
        loading: false,
        error: null,
        isAccessBlocked: false,
        blockReason: null,
      };
      setState(nextState);
      portalAuthCache = { userId: user.id, context: roleContext, value: nextState, cachedAtMs: Date.now() };
    } catch (err) {
      console.error('Error fetching portal role:', err);
      const nextState: PortalAuthState = {
        portalRole: null,
        client: null,
        workspaceId: null,
        loading: false,
        error: err as Error,
        isAccessBlocked: false,
        blockReason: null,
      };
      setState(nextState);
      portalAuthCache = { userId: user.id, context: roleContext, value: nextState, cachedAtMs: Date.now() };
    }
  }, [user, profile?.full_name, profile?.display_name, profile?.current_workspace_id, updateProfile, roleContext]);

  useEffect(() => {
    if (!authLoading) {
      fetchPortalRole();
    }
  }, [authLoading, fetchPortalRole]);

  const updateClient = async (updates: Partial<Client>) => {
    if (!state.client) return { error: new Error('No client') };

    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
      if (updates.instagramHandle !== undefined) dbUpdates.instagram_handle = updates.instagramHandle;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.goals !== undefined) dbUpdates.goals = updates.goals;
      if (updates.onboardingCompleted !== undefined) {
        dbUpdates.onboarding_completed = updates.onboardingCompleted;
        if (updates.onboardingCompleted) {
          dbUpdates.onboarding_completed_at = new Date().toISOString();
        }
      }

      const { error: updateError } = await supabase
        .from('clients')
        .update(dbUpdates)
        .eq('id', state.client.id);

      if (updateError) throw updateError;

      setState((prev) => ({
        ...prev,
        client: prev.client ? { ...prev.client, ...updates } : null,
      }));

      return { error: null };
    } catch (err) {
      console.error('Error updating client:', err);
      return { error: err as Error };
    }
  };

  return {
    ...state,
    authLoading,
    updateClient,
    refetch: fetchPortalRole,
  };
}
