import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Workspace, WorkspaceMember, WorkspaceRole, OnboardingResponse } from '@/types/workspace';
import {
  inferWorkspaceRoleContext,
  pickPreferredPortalRoleRow,
  pickPreferredWorkspaceMemberRow,
} from '@/lib/workspaceRolePreferences';
import { hasSetterMetadataHint, hasSetterRoleHint, setSetterRoleHint } from '@/lib/setterRoleHint';

interface WorkspaceContextType {
  workspace: Workspace | null;
  members: WorkspaceMember[];
  userRole: WorkspaceRole | null;
  onboarding: OnboardingResponse | null;
  loading: boolean;
  createWorkspace: (name: string) => Promise<{ workspace: Workspace | null; error: Error | null }>;
  updateWorkspace: (updates: Partial<Workspace>) => Promise<{ error: Error | null }>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  inviteMember: (email: string, role: WorkspaceRole) => Promise<{ token: string | null; error: Error | null }>;
  removeMember: (memberId: string) => Promise<{ error: Error | null }>;
  saveOnboarding: (data: Partial<OnboardingResponse>) => Promise<{ error: Error | null }>;
  completeOnboarding: () => Promise<{ error: Error | null }>;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [userRole, setUserRole] = useState<WorkspaceRole | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthTokenError = (err: unknown) => {
    const status = Number((err as any)?.status || (err as any)?.statusCode || 0);
    const code = String((err as any)?.code || '').toLowerCase();
    const message = String((err as any)?.message || err || '').toLowerCase();
    return (
      status === 401 ||
      code.includes('jwt') ||
      message.includes('invalid jwt') ||
      message.includes('jwt') ||
      (message.includes('token') && message.includes('expired'))
    );
  };

  const fetchWorkspace = useCallback(async () => {
    if (!user) {
      setWorkspace(null);
      setMembers([]);
      setUserRole(null);
      setOnboarding(null);
      setLoading(false);
      return;
    }

    // Wait for auth to settle. (useAuth intentionally flips `loading` false before the profile
    // query resolves, but we also need to avoid getting stuck in a skeleton forever if the
    // profile fetch fails for any reason.)
    if (authLoading) {
      setWorkspace(null);
      setMembers([]);
      setUserRole(null);
      setOnboarding(null);
      setLoading(true);
      return;
    }

    const pathname = typeof window !== 'undefined' ? window.location.pathname || '' : '';
    const roleContext = inferWorkspaceRoleContext(pathname);
    const signInIntentSetter =
      typeof window !== 'undefined' && window.sessionStorage.getItem('acq_signin_intent') === 'setter';
    if (signInIntentSetter) {
      setSetterRoleHint(user.id);
    }
    const signInIntentOwner =
      typeof window !== 'undefined' && window.sessionStorage.getItem('acq_signin_intent') === 'owner';
    const setterHintActive = hasSetterRoleHint(user.id) || hasSetterMetadataHint(user.user_metadata);
    let ownerIntentActive = signInIntentOwner && !signInIntentSetter && !setterHintActive;
    const isInviteOrPortalFlow =
      pathname === '/accept-invite' ||
      pathname.startsWith('/portal') ||
      pathname.startsWith('/setter-portal');

    // Determine active workspace id. Prefer the in-memory profile (when available), then
    // role-aware workspace_members fallback, then portal_roles fallback.
    let activeWorkspaceId: string | null = String(profile?.current_workspace_id || '').trim() || null;
    let memberRows: Array<{ workspace_id: string; role: string; created_at: string | null }> = [];
    let preferredMemberWorkspaceId: string | null = null;
    let hasAnyWorkspaceMembership = false;
    let hasSetterMembership = false;
    let hasAnyPortalRole = false;
    let hasSetterPortalRole = false;

    try {
      if (!activeWorkspaceId) {
        let profileFetch = await supabase
          .from('profiles')
          .select('current_workspace_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileFetch.error && isAuthTokenError(profileFetch.error)) {
          try {
            await supabase.auth.refreshSession();
            profileFetch = await supabase
              .from('profiles')
              .select('current_workspace_id')
              .eq('id', user.id)
              .maybeSingle();
          } catch (refreshErr) {
            console.warn('Profile workspace lookup session refresh failed:', refreshErr);
          }
        }

        const { data: profileRow, error: profileError } = profileFetch;

        if (!profileError) {
          activeWorkspaceId = String((profileRow as any)?.current_workspace_id || '').trim() || null;
        } else {
          console.warn('Failed to fetch profile workspace id:', profileError);
        }
      }

      // Prefer workspace_members before portal_roles in main app context.
      let memberFetch = await supabase
        .from('workspace_members')
        .select('workspace_id,role,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (memberFetch.error && isAuthTokenError(memberFetch.error)) {
        try {
          await supabase.auth.refreshSession();
          memberFetch = await supabase
            .from('workspace_members')
            .select('workspace_id,role,created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);
        } catch (refreshErr) {
          console.warn('Membership lookup session refresh failed:', refreshErr);
        }
      }

      const { data: memberData, error: memberError } = memberFetch;

      if (!memberError && Array.isArray(memberData)) {
        hasAnyWorkspaceMembership = memberData.length > 0;
        memberRows = memberData.map((m) => ({
          workspace_id: String(m.workspace_id),
          role: String(m.role),
          created_at: m.created_at ? String(m.created_at) : null,
        }));

        hasSetterMembership = memberRows.some((m) => String(m.role || '') === 'setter');
        if (hasSetterMembership) {
          ownerIntentActive = false;
          setSetterRoleHint(user.id);
        }

        const preferredMember = pickPreferredWorkspaceMemberRow(memberRows, roleContext, ownerIntentActive);
        preferredMemberWorkspaceId = String(preferredMember?.workspace_id || '').trim() || null;

        if (!activeWorkspaceId && preferredMemberWorkspaceId) {
          activeWorkspaceId = preferredMemberWorkspaceId;
        } else if (
          activeWorkspaceId &&
          preferredMemberWorkspaceId &&
          String(preferredMember?.role || '') === 'setter' &&
          activeWorkspaceId !== preferredMemberWorkspaceId
        ) {
          // Setter assignments must not remain pinned to an owner workspace.
          activeWorkspaceId = preferredMemberWorkspaceId;
        } else if (activeWorkspaceId) {
          const hasCurrentMembership = memberRows.some(
            (m) => String(m.workspace_id || '').trim() === activeWorkspaceId
          );
          if (!hasCurrentMembership) {
            if (preferredMemberWorkspaceId) {
              activeWorkspaceId = preferredMemberWorkspaceId;
            } else if (!isInviteOrPortalFlow) {
              // Avoid persisting an orphan workspace selection for main-app users.
              activeWorkspaceId = null;
            }
          }
        }
      } else if (memberError) {
        console.warn('Failed to fetch workspace memberships:', memberError);
      }

      let portalFetch = await supabase
        .from('portal_roles')
        .select('workspace_id,role,client_id')
        .eq('user_id', user.id);

      if (portalFetch.error && isAuthTokenError(portalFetch.error)) {
        try {
          await supabase.auth.refreshSession();
          portalFetch = await supabase
            .from('portal_roles')
            .select('workspace_id,role,client_id')
            .eq('user_id', user.id);
        } catch (refreshErr) {
          console.warn('Portal role lookup session refresh failed:', refreshErr);
        }
      }

      const { data: portalRoleRows, error: portalRoleError } = portalFetch;

      if (!portalRoleError && portalRoleRows && portalRoleRows.length > 0) {
        hasAnyPortalRole = true;
        hasSetterPortalRole = portalRoleRows.some((row) => String((row as any)?.role || '') === 'setter');
        if (hasSetterPortalRole) {
          ownerIntentActive = false;
          setSetterRoleHint(user.id);
        }
        const preferredPortal = pickPreferredPortalRoleRow(portalRoleRows, roleContext, ownerIntentActive);
        const preferredPortalWorkspaceId = String(preferredPortal?.workspace_id || '').trim() || null;
        const preferredPortalRole = String((preferredPortal as any)?.role || '').trim().toLowerCase();

        if (!activeWorkspaceId && preferredPortalWorkspaceId) {
          activeWorkspaceId = preferredPortalWorkspaceId;
        } else if (
          preferredPortalRole === 'setter' &&
          preferredPortalWorkspaceId &&
          activeWorkspaceId !== preferredPortalWorkspaceId &&
          roleContext !== 'client_portal'
        ) {
          // If this user is a setter in any workspace, never leave them pinned to an owner workspace.
          activeWorkspaceId = preferredPortalWorkspaceId;
        } else if (
          roleContext === 'client_portal' &&
          preferredPortalWorkspaceId &&
          activeWorkspaceId !== preferredPortalWorkspaceId
        ) {
          activeWorkspaceId = preferredPortalWorkspaceId;
        }
      } else if (portalRoleError) {
        console.warn('Failed to fetch portal roles for workspace inference:', portalRoleError);
      }

      // Best-effort persist inferred workspace id so other parts of the app can rely on it.
      if (activeWorkspaceId && String(profile?.current_workspace_id || '').trim() !== activeWorkspaceId) {
        if (profile) {
          // Keeps local profile state in sync.
          await updateProfile({ current_workspace_id: activeWorkspaceId });
        } else {
          // No profile in memory; still try to persist to DB (do not block).
          const { error: persistError } = await supabase
            .from('profiles')
            .update({ current_workspace_id: activeWorkspaceId })
            .eq('id', user.id);
          if (persistError) {
            console.warn('Failed to persist inferred workspace id:', persistError);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to determine active workspace id:', err);
    }

    if (!activeWorkspaceId) {
      // Final owner fallback: provision a workspace if none exists yet.
      // Keeps first-time owner accounts fully functional even when profile/workspace linkage is missing.
      try {
        const shouldAutoProvisionOwnerWorkspace =
          !isInviteOrPortalFlow &&
          !hasAnyWorkspaceMembership &&
          !hasAnyPortalRole &&
          !hasSetterMembership &&
          !hasSetterPortalRole &&
          !setterHintActive;

        if (shouldAutoProvisionOwnerWorkspace) {
          const defaultWorkspaceName =
            String(profile?.full_name || profile?.display_name || user.email?.split('@')[0] || 'Workspace').trim() || 'Workspace';
          const preferredDisplayName =
            String(profile?.full_name || profile?.display_name || user.email?.split('@')[0] || '').trim() || null;

          let rpcResult = await supabase.rpc('create_workspace_for_user', {
            p_workspace_name: defaultWorkspaceName,
            p_user_id: user.id,
          });
          if (rpcResult.error && isAuthTokenError(rpcResult.error)) {
            try {
              await supabase.auth.refreshSession();
              rpcResult = await supabase.rpc('create_workspace_for_user', {
                p_workspace_name: defaultWorkspaceName,
                p_user_id: user.id,
              });
            } catch (refreshErr) {
              console.warn('Owner workspace RPC session refresh failed:', refreshErr);
            }
          }
          const { data: rpcWorkspaceId, error: rpcError } = rpcResult;

          if (!rpcError && rpcWorkspaceId) {
            activeWorkspaceId = String(rpcWorkspaceId).trim() || null;
          } else {
            if (rpcError) {
              console.warn('Owner workspace auto-provision RPC failed:', rpcError);
            }

            // Fallback path when RPC is unavailable/failing in a given project.
            const fallbackWorkspaceId = crypto.randomUUID();
            let wsInsert = await supabase
              .from('workspaces')
              .insert({ id: fallbackWorkspaceId, name: defaultWorkspaceName })
              .select()
              .single();
            if (wsInsert.error && isAuthTokenError(wsInsert.error)) {
              try {
                await supabase.auth.refreshSession();
                wsInsert = await supabase
                  .from('workspaces')
                  .insert({ id: fallbackWorkspaceId, name: defaultWorkspaceName })
                  .select()
                  .single();
              } catch (refreshErr) {
                console.warn('Owner workspace fallback insert session refresh failed:', refreshErr);
              }
            }
            const { data: wsData, error: wsInsertError } = wsInsert;

            if (wsInsertError) {
              console.warn('Owner workspace fallback insert failed:', wsInsertError);
            } else if (wsData?.id) {
              let memberInsert = await supabase.from('workspace_members').insert({
                id: crypto.randomUUID(),
                workspace_id: fallbackWorkspaceId,
                user_id: user.id,
                role: 'owner',
                display_name: preferredDisplayName,
              });
              if (memberInsert.error && isAuthTokenError(memberInsert.error)) {
                try {
                  await supabase.auth.refreshSession();
                  memberInsert = await supabase.from('workspace_members').insert({
                    id: crypto.randomUUID(),
                    workspace_id: fallbackWorkspaceId,
                    user_id: user.id,
                    role: 'owner',
                    display_name: preferredDisplayName,
                  });
                } catch (refreshErr) {
                  console.warn('Owner membership fallback insert session refresh failed:', refreshErr);
                }
              }
              const { error: memberInsertError } = memberInsert;

              if (memberInsertError && String((memberInsertError as any)?.code || '') !== '23505') {
                console.warn('Owner workspace fallback membership insert failed:', memberInsertError);
              } else {
                activeWorkspaceId = fallbackWorkspaceId;

                const { error: onboardingInsertError } = await supabase.from('onboarding_responses').insert({
                  id: crypto.randomUUID(),
                  workspace_id: fallbackWorkspaceId,
                  business_name: defaultWorkspaceName,
                });
                if (onboardingInsertError && String((onboardingInsertError as any)?.code || '') !== '23505') {
                  console.warn('Owner workspace fallback onboarding insert failed:', onboardingInsertError);
                }
              }
            }
          }

          if (activeWorkspaceId && String(profile?.current_workspace_id || '').trim() !== activeWorkspaceId) {
            if (profile) {
              await updateProfile({ current_workspace_id: activeWorkspaceId });
            } else {
              const { error: persistError } = await supabase
                .from('profiles')
                .update({ current_workspace_id: activeWorkspaceId })
                .eq('id', user.id);
              if (persistError) {
                console.warn('Failed to persist auto-provisioned workspace id:', persistError);
              }
            }
          }
        }
      } catch (autoProvisionError) {
        console.warn('Owner workspace auto-provision failed:', autoProvisionError);
      }
    }

    if (!activeWorkspaceId) {
      // Give up; callers will show "no workspace selected" UIs.
      setWorkspace(null);
      setMembers([]);
      setUserRole(null);
      setOnboarding(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch workspace
      const { data: wsData, error: wsError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', activeWorkspaceId)
        .single();

      if (wsError) throw wsError;

      setWorkspace({
        id: wsData.id,
        name: wsData.name,
        createdAt: new Date(wsData.created_at),
        updatedAt: new Date(wsData.updated_at),
      });

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', activeWorkspaceId);

      if (membersError) throw membersError;

      const memberUserIds = (membersData || []).map((m) => String(m.user_id)).filter(Boolean);
      const profileNameByUserId: Record<string, string> = {};
      if (memberUserIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id,full_name,display_name')
          .in('id', memberUserIds);
        if (profileError) {
          console.warn('Error fetching workspace member profiles:', profileError);
        } else {
          for (const p of profileRows || []) {
            const uid = String((p as any).id || '');
            const preferred = String((p as any).full_name || (p as any).display_name || '').trim();
            if (uid && preferred) profileNameByUserId[uid] = preferred;
          }
        }
      }

      const formattedMembers: WorkspaceMember[] = (membersData || []).map((m) => {
        const explicitDisplayName = String(m.display_name || '').trim();
        const fallbackDisplayName = profileNameByUserId[String(m.user_id)] || '';
        return {
          id: m.id,
          workspaceId: m.workspace_id,
          userId: m.user_id,
          role: m.role as WorkspaceRole,
          displayName: explicitDisplayName || fallbackDisplayName || null,
          createdAt: new Date(m.created_at),
          updatedAt: new Date(m.updated_at),
        };
      });

      setMembers(formattedMembers);

      // Find user's role
      const userMember = formattedMembers.find((m) => m.userId === user.id);
      let resolvedRole: WorkspaceRole | null = (userMember?.role as WorkspaceRole | undefined) || null;
      try {
        const { data: myPortalRoles, error: portalRoleError } = await supabase
          .from('portal_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('workspace_id', activeWorkspaceId);

        if (portalRoleError) {
          console.warn('Error fetching user portal roles for workspace role resolution:', portalRoleError);
        } else if (Array.isArray(myPortalRoles)) {
          if (myPortalRoles.some((row) => String((row as any)?.role || '') === 'setter')) {
            resolvedRole = 'setter';
          } else if (!resolvedRole && myPortalRoles.some((row) => String((row as any)?.role || '') === 'coach')) {
            resolvedRole = 'owner';
          }
        }
      } catch (roleLookupError) {
        console.warn('Portal role lookup failed during workspace role resolution:', roleLookupError);
      }

      if (signInIntentSetter && roleContext !== 'client_portal') {
        resolvedRole = 'setter';
      }
      if (setterHintActive && roleContext !== 'client_portal') {
        resolvedRole = 'setter';
      }
      if (resolvedRole === 'setter') {
        setSetterRoleHint(user.id);
      }
      setUserRole(resolvedRole);

      // Fetch onboarding
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('onboarding_responses')
        .select('*')
        .eq('workspace_id', activeWorkspaceId)
        .maybeSingle();

      if (onboardingError) {
        // Avoid breaking the entire workspace load (and avoid PostgREST 406 noise when no row exists).
        console.warn('Error fetching onboarding:', onboardingError);
      }

      if (onboardingData) {
        setOnboarding({
          id: onboardingData.id,
          workspaceId: onboardingData.workspace_id,
          businessName: onboardingData.business_name,
          hasTeam: onboardingData.has_team,
          revenueRange: onboardingData.revenue_range,
          kpiFilePath: onboardingData.kpi_file_path,
          completedAt: onboardingData.completed_at ? new Date(onboardingData.completed_at) : null,
          createdAt: new Date(onboardingData.created_at),
          updatedAt: new Date(onboardingData.updated_at),
        });
      }
    } catch (error) {
      console.error('Error fetching workspace:', error);
    } finally {
      setLoading(false);
    }
  }, [user, profile, profile?.current_workspace_id, updateProfile, authLoading]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const createWorkspace = async (name: string) => {
    if (!user) {
      console.error('[createWorkspace] No user found in context');
      return { workspace: null, error: new Error('Not authenticated') };
    }

    console.log('[createWorkspace] User ID from context:', user.id);
    console.log('[createWorkspace] Attempting to create workspace:', name);

    try {
      // Verify we have a valid session and refresh if needed
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('[createWorkspace] Session check:', {
        hasSession: !!sessionData?.session,
        userId: sessionData?.session?.user?.id,
        expiresAt: sessionData?.session?.expires_at,
        error: sessionError
      });
      
      if (!sessionData?.session) {
        // Try to refresh the session
        console.log('[createWorkspace] No session, attempting refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData?.session) {
          console.error('[createWorkspace] Session refresh failed:', refreshError);
          return { workspace: null, error: new Error('Session expired. Please log in again.') };
        }
        
        console.log('[createWorkspace] Session refreshed successfully');
      }

      // Create workspace
      console.log('[createWorkspace] Inserting workspace...');
      const createdWorkspaceId = crypto.randomUUID();
      const { data: wsData, error: wsError } = await supabase
        .from('workspaces')
        .insert({ id: createdWorkspaceId, name })
        .select()
        .single();

      console.log('[createWorkspace] Insert result:', { wsData, wsError });

      if (wsError) throw wsError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          id: crypto.randomUUID(),
          workspace_id: wsData.id,
          user_id: user.id,
          role: 'owner',
          display_name: profile?.full_name || profile?.display_name,
        });

      if (memberError) throw memberError;

      // Create onboarding record
      const { error: onboardingError } = await supabase
        .from('onboarding_responses')
        .insert({
          id: crypto.randomUUID(),
          workspace_id: wsData.id,
          business_name: name,
        });

      if (onboardingError) throw onboardingError;

      // Set as current workspace
      await updateProfile({ current_workspace_id: wsData.id });

      const newWorkspace: Workspace = {
        id: wsData.id,
        name: wsData.name,
        createdAt: new Date(wsData.created_at),
        updatedAt: new Date(wsData.updated_at),
      };

      setWorkspace(newWorkspace);
      setUserRole('owner');

      return { workspace: newWorkspace, error: null };
    } catch (error) {
      console.error('Error creating workspace:', error);
      return { workspace: null, error: error as Error };
    }
  };

  const updateWorkspace = async (updates: Partial<Workspace>) => {
    if (!workspace) return { error: new Error('No workspace selected') };

    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: updates.name,
        })
        .eq('id', workspace.id);

      if (error) throw error;

      setWorkspace({ ...workspace, ...updates });
      return { error: null };
    } catch (error) {
      console.error('Error updating workspace:', error);
      return { error: error as Error };
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    await updateProfile({ current_workspace_id: workspaceId });
    await fetchWorkspace();
  };

  const inviteMember = async (email: string, role: WorkspaceRole) => {
    if (!user || !workspace) {
      return { token: null, error: new Error('Not authenticated or no workspace') };
    }

    try {
      const token = crypto.randomUUID() + '-' + crypto.randomUUID();

      const { error: insertError } = await supabase
        .from('invites')
        .insert({
          workspace_id: workspace.id,
          email,
          role,
          token,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (insertError) throw insertError;

      // Send invite email
      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email,
          type: 'invite',
          inviteToken: token,
          workspaceName: workspace.name,
        },
      });

      if (emailError) {
        console.error('Error sending invite email:', emailError);
      }

      return { token, error: null };
    } catch (error) {
      console.error('Error inviting member:', error);
      return { token: null, error: error as Error };
    }
  };

  const removeMember = async (memberId: string) => {
    if (!workspace) return { error: new Error('No workspace selected') };

    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      return { error: null };
    } catch (error) {
      console.error('Error removing member:', error);
      return { error: error as Error };
    }
  };

  const saveOnboarding = async (data: Partial<OnboardingResponse>) => {
    if (!workspace) return { error: new Error('No workspace selected') };

    try {
      const { error } = await supabase
        .from('onboarding_responses')
        .update({
          business_name: data.businessName,
          has_team: data.hasTeam,
          revenue_range: data.revenueRange,
          kpi_file_path: data.kpiFilePath,
        })
        .eq('workspace_id', workspace.id);

      if (error) throw error;

      setOnboarding((prev) => prev ? { ...prev, ...data } : null);
      return { error: null };
    } catch (error) {
      console.error('Error saving onboarding:', error);
      return { error: error as Error };
    }
  };

  const completeOnboarding = async () => {
    if (!workspace || !user) return { error: new Error('No workspace or user') };

    try {
      // Mark onboarding as completed in onboarding_responses
      const { error: onboardingError } = await supabase
        .from('onboarding_responses')
        .update({ completed_at: new Date().toISOString() })
        .eq('workspace_id', workspace.id);

      if (onboardingError) throw onboardingError;

      // Mark profile as onboarding completed
      await updateProfile({ onboarding_completed: true });

      setOnboarding((prev) => prev ? { ...prev, completedAt: new Date() } : null);
      return { error: null };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return { error: error as Error };
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        members,
        userRole,
        onboarding,
        loading,
        createWorkspace,
        updateWorkspace,
        switchWorkspace,
        inviteMember,
        removeMember,
        saveOnboarding,
        completeOnboarding,
        refreshWorkspace: fetchWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
