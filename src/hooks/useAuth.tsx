import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import {
  inferWorkspaceRoleContext,
  pickPreferredPortalRoleRow,
  pickPreferredWorkspaceMemberRow,
} from '@/lib/workspaceRolePreferences';
import { hasSetterMetadataHint, hasSetterRoleHint, setSetterRoleHint } from '@/lib/setterRoleHint';

const AVATAR_MODE_KEY = 'acq-avatar-mode';
const AVATAR_COLOR_KEY = 'acq-avatar-color';

const getStoredAvatarPrefs = () => {
  if (typeof window === 'undefined') {
    return { mode: null as string | null, color: null as string | null };
  }
  const mode = window.localStorage.getItem(AVATAR_MODE_KEY);
  const color = window.localStorage.getItem(AVATAR_COLOR_KEY);
  return { mode, color };
};

const setStoredAvatarPrefs = (mode?: string | null, color?: string | null) => {
  if (typeof window === 'undefined') return;
  if (mode !== undefined) {
    if (mode === null) {
      window.localStorage.removeItem(AVATAR_MODE_KEY);
    } else {
      window.localStorage.setItem(AVATAR_MODE_KEY, mode);
    }
  }
  if (color !== undefined) {
    if (color === null) {
      window.localStorage.removeItem(AVATAR_COLOR_KEY);
    } else {
      window.localStorage.setItem(AVATAR_COLOR_KEY, color);
    }
  }
};

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

export interface Profile {
  id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  avatar_mode: string | null;
  avatar_color: string | null;
  email_verified: boolean;
  current_workspace_id: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: Error | null; userId?: string; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (
    userId: string,
    userEmail?: string,
    isOAuthUser?: boolean,
    avatarUrl?: string | null,
    emailConfirmedAt?: string | null
  ) => {
    const syncNameFromMembership = async (row: Profile): Promise<Profile> => {
      try {
        const { data: memberRows, error: memberError } = await supabase
          .from('workspace_members')
          .select('display_name,role,created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (memberError) {
          console.warn('Failed to load membership names for profile sync:', memberError);
          return row;
        }

        const rows = Array.isArray(memberRows) ? memberRows : [];
        const ownerNamed = rows.find((m: any) => String(m?.role || '') === 'owner' && String(m?.display_name || '').trim());
        const fallbackNamed = rows.find((m: any) => String(m?.display_name || '').trim());
        const memberName = String((ownerNamed || fallbackNamed || ({} as any)).display_name || '').trim();
        if (!memberName) return row;

        const profileName = String(row.full_name || row.display_name || '').trim();
        if (memberName === profileName) return row;

        const nextRow: Profile = {
          ...row,
          display_name: memberName,
          full_name: memberName,
        };

        // Best effort: keep profiles aligned, but never block hydration on this.
        const { error: profileNameSyncError } = await supabase
          .from('profiles')
          .update({ display_name: memberName, full_name: memberName })
          .eq('id', userId);
        if (profileNameSyncError) {
          console.warn('Failed to persist membership name back to profile:', profileNameSyncError);
        }

        return nextRow;
      } catch (err) {
        console.warn('Membership name sync failed:', err);
        return row;
      }
    };

    const queryProfile = async () => {
      return supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
    };

    let { data, error } = await queryProfile();

    // If the session token is stale/invalid, refresh once then retry.
    if (error && isAuthTokenError(error)) {
      try {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError && refreshed?.session) {
          ({ data, error } = await queryProfile());
        }
      } catch (refreshErr) {
        console.warn('Session refresh failed while fetching profile:', refreshErr);
      }
    }

    if (error) {
      console.error('Error fetching profile:', error);

      // Avoid infinite "loading" states when the session is broken.
      if (isAuthTokenError(error)) {
        try {
          await supabase.auth.signOut();
        } catch (signOutErr) {
          console.warn('Sign out after invalid session failed:', signOutErr);
        }
      }

      return null;
    }

    const isEmailVerified = Boolean(isOAuthUser || emailConfirmedAt);

    const ensureWorkspace = async (profileRow: Profile) => {
      try {
        const pathname = typeof window !== 'undefined' ? window.location.pathname || '' : '';
        const roleContext = inferWorkspaceRoleContext(pathname);
        const signInIntentSetter =
          typeof window !== 'undefined' && window.sessionStorage.getItem('acq_signin_intent') === 'setter';
        if (signInIntentSetter) {
          setSetterRoleHint(profileRow.id);
        }
        const isInviteOrPortalFlow =
          pathname === '/accept-invite' ||
          pathname.startsWith('/portal') ||
          pathname.startsWith('/setter-portal');
        const signInIntentOwner =
          typeof window !== 'undefined' && window.sessionStorage.getItem('acq_signin_intent') === 'owner';
        const setterHintActive = hasSetterRoleHint(profileRow.id) || hasSetterMetadataHint(user?.user_metadata);
        let ownerIntentActive = signInIntentOwner && !signInIntentSetter && !setterHintActive;

        let workspaceId: string | null = String(profileRow.current_workspace_id || '').trim() || null;
        let hasAnyWorkspaceMembership = false;
        let hasSetterMembership = false;
        let hasAnyPortalRole = false;
        let hasSetterPortalRole = false;

        let preferredPortalWorkspaceId: string | null = null;
        let preferredPortalRole: 'coach' | 'client' | 'setter' | null = null;
        const { data: portalRoleRows, error: portalRoleError } = await supabase
          .from('portal_roles')
          .select('workspace_id,role,client_id')
          .eq('user_id', profileRow.id);

        if (!portalRoleError && Array.isArray(portalRoleRows) && portalRoleRows.length > 0) {
          hasAnyPortalRole = true;
          hasSetterPortalRole = portalRoleRows.some((r) => String(r?.role || '') === 'setter');
          if (hasSetterPortalRole) {
            ownerIntentActive = false;
            setSetterRoleHint(profileRow.id);
          }
          const preferredPortal = pickPreferredPortalRoleRow(portalRoleRows, roleContext, ownerIntentActive);
          preferredPortalWorkspaceId = String(preferredPortal?.workspace_id || '').trim() || null;
          preferredPortalRole = (preferredPortal?.role as any) || null;
        } else if (portalRoleError) {
          console.warn('Failed to fetch portal roles while ensuring workspace:', portalRoleError);
        }

        // Read all workspace memberships once so we can pick a context-aware workspace.
        let memberRows: Array<{ workspace_id: string; role: string; created_at: string | null }> = [];
        const { data: membershipData, error: membershipError } = await supabase
          .from('workspace_members')
          .select('workspace_id,role,created_at')
          .eq('user_id', profileRow.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!membershipError && Array.isArray(membershipData)) {
          hasAnyWorkspaceMembership = membershipData.length > 0;
          memberRows = membershipData.map((m) => ({
            workspace_id: String(m.workspace_id),
            role: String(m.role),
            created_at: m.created_at ? String(m.created_at) : null,
          }));
          hasSetterMembership = memberRows.some((m) => String(m.role || '') === 'setter');
          if (hasSetterMembership) {
            ownerIntentActive = false;
            setSetterRoleHint(profileRow.id);
          }
        } else if (membershipError) {
          console.warn('Failed to fetch workspace memberships while ensuring workspace:', membershipError);
        }

        const preferredMember = pickPreferredWorkspaceMemberRow(memberRows, roleContext, ownerIntentActive);
        const preferredMemberWorkspaceId = String(preferredMember?.workspace_id || '').trim() || null;

        const shouldPreferSetterPortalWorkspace =
          preferredPortalRole === 'setter' && roleContext !== 'client_portal';
        if (shouldPreferSetterPortalWorkspace) {
          ownerIntentActive = false;
          setSetterRoleHint(profileRow.id);
        }

        const allowPortalWorkspacePreference =
          shouldPreferSetterPortalWorkspace || !ownerIntentActive || isInviteOrPortalFlow;
        if (preferredPortalWorkspaceId && allowPortalWorkspacePreference) {
          if (!workspaceId) {
            workspaceId = preferredPortalWorkspaceId;
          } else if (preferredPortalRole === 'setter' && workspaceId !== preferredPortalWorkspaceId) {
            // Setter portal role should always win over an owner-pinned workspace selection.
            workspaceId = preferredPortalWorkspaceId;
          } else if (roleContext === 'client_portal' && workspaceId !== preferredPortalWorkspaceId) {
            workspaceId = preferredPortalWorkspaceId;
          }
        }

        if (
          workspaceId &&
          preferredMemberWorkspaceId &&
          String(preferredMember?.role || '') === 'setter' &&
          workspaceId !== preferredMemberWorkspaceId
        ) {
          workspaceId = preferredMemberWorkspaceId;
        }

        if (!workspaceId && preferredMemberWorkspaceId) {
          workspaceId = preferredMemberWorkspaceId;
        } else if (workspaceId) {
          const hasCurrentMembership = memberRows.some(
            (m) => String(m.workspace_id || '').trim() === workspaceId
          );
          if (!hasCurrentMembership && preferredMemberWorkspaceId) {
            workspaceId = preferredMemberWorkspaceId;
          }
        }

        // If none found, create a default workspace.
        if (!workspaceId) {
          // Do not auto-create a workspace while handling invite/portal flows.
          const shouldAutoProvisionOwnerWorkspace =
            !isInviteOrPortalFlow &&
            !hasAnyWorkspaceMembership &&
            !hasAnyPortalRole &&
            !hasSetterMembership &&
            !hasSetterPortalRole &&
            !setterHintActive;

          if (!shouldAutoProvisionOwnerWorkspace) {
            return profileRow;
          }

          const defaultName = profileRow.display_name || profileRow.full_name || userEmail?.split('@')[0] || 'Workspace';
          const preferredDisplayName = profileRow.full_name || profileRow.display_name || userEmail?.split('@')[0] || null;

          const { data: rpcWorkspaceId, error: rpcError } = await supabase.rpc('create_workspace_for_user', {
            p_workspace_name: defaultName,
            p_user_id: profileRow.id,
          });

          if (!rpcError && rpcWorkspaceId) {
            workspaceId = String(rpcWorkspaceId).trim() || null;
          } else {
            if (rpcError) {
              console.warn('create_workspace_for_user RPC failed, trying direct fallback:', rpcError);
            }

            // Fallback to direct insert + membership creation.
            const fallbackWorkspaceId = crypto.randomUUID();
            const { data: wsData, error: wsInsertError } = await supabase
              .from('workspaces')
              .insert({ id: fallbackWorkspaceId, name: defaultName })
              .select()
              .single();

            if (wsInsertError) {
              console.warn('Direct workspace insert fallback failed:', wsInsertError);
            } else if (wsData?.id) {
              const { error: memberInsertError } = await supabase.from('workspace_members').insert({
                id: crypto.randomUUID(),
                workspace_id: fallbackWorkspaceId,
                user_id: profileRow.id,
                role: 'owner',
                display_name: preferredDisplayName,
              });

              if (!memberInsertError || String((memberInsertError as any)?.code || '') === '23505') {
                workspaceId = fallbackWorkspaceId;

                // Optional onboarding seed. Do not block workspace bootstrap if this fails.
                const { error: onboardingInsertError } = await supabase.from('onboarding_responses').insert({
                  id: crypto.randomUUID(),
                  workspace_id: fallbackWorkspaceId,
                  business_name: defaultName,
                });
                if (onboardingInsertError && String((onboardingInsertError as any)?.code || '') !== '23505') {
                  console.warn('Direct workspace onboarding seed failed:', onboardingInsertError);
                }
              } else {
                console.warn('Direct workspace owner membership insert failed:', memberInsertError);
              }
            }
          }
        }

        // Final sanity check: never persist a workspace the user is not a member of.
        if (workspaceId) {
          const { data: finalMemberRow, error: finalMemberError } = await supabase
            .from('workspace_members')
            .select('workspace_id')
            .eq('workspace_id', workspaceId)
            .eq('user_id', profileRow.id)
            .limit(1)
            .maybeSingle();

          if (finalMemberError) {
            console.warn('Final workspace membership validation failed:', finalMemberError);
          }

          if (!finalMemberRow?.workspace_id) {
            const { data: fallbackMembershipRows } = await supabase
              .from('workspace_members')
              .select('workspace_id,role,created_at')
              .eq('user_id', profileRow.id)
              .order('created_at', { ascending: false })
              .limit(20);

            const normalizedFallback = Array.isArray(fallbackMembershipRows)
              ? fallbackMembershipRows.map((m) => ({
                  workspace_id: String(m.workspace_id),
                  role: String(m.role),
                  created_at: m.created_at ? String(m.created_at) : null,
                }))
              : [];
            const fallbackMember = pickPreferredWorkspaceMemberRow(
              normalizedFallback,
              roleContext,
              ownerIntentActive,
            );
            workspaceId = String(fallbackMember?.workspace_id || '').trim() || null;
          }
        }

        if (!workspaceId && profileRow.current_workspace_id && !isInviteOrPortalFlow) {
          await supabase
            .from('profiles')
            .update({ current_workspace_id: null })
            .eq('id', profileRow.id);
          profileRow.current_workspace_id = null;
        }

        if (workspaceId && workspaceId !== profileRow.current_workspace_id) {
          await supabase
            .from('profiles')
            .update({ current_workspace_id: workspaceId, onboarding_completed: true })
            .eq('id', profileRow.id);
          profileRow.current_workspace_id = workspaceId;
          profileRow.onboarding_completed = true;
        }

        if (signInIntentOwner && typeof window !== 'undefined') {
          try {
            window.sessionStorage.removeItem('acq_signin_intent');
          } catch {
            // ignore storage errors
          }
        }
      } catch (workspaceError) {
        console.error('Error ensuring workspace:', workspaceError);
      }

      return profileRow;
    };

    // If no profile exists, create one
    if (!data) {
      console.log('No profile found, creating one for user:', userId);
      const { data: authUserData } = await supabase.auth.getUser();
      const metadata = (authUserData?.user?.user_metadata || {}) as Record<string, unknown>;
      const metadataFullName = String(
        (metadata.full_name as string | undefined) ||
        (metadata.fullName as string | undefined) ||
        ''
      ).trim();
      const metadataDisplayName = String(
        (metadata.display_name as string | undefined) ||
        (metadata.displayName as string | undefined) ||
        ''
      ).trim();
      const fallbackName = String(userEmail?.split('@')[0] || '').trim();
      const preferredDisplayName = metadataFullName || metadataDisplayName || fallbackName || null;

      // OAuth users (Google) are automatically email verified
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: preferredDisplayName,
          full_name: metadataFullName || null,
          avatar_url: avatarUrl || null,
          email_verified: isEmailVerified,
          onboarding_completed: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        // Some environments can drift on profile INSERT RLS. Keep the app usable by
        // hydrating a synthetic profile from membership/auth metadata until DB repair.
        const storedPrefs = getStoredAvatarPrefs();
        let fallbackWorkspaceId: string | null = null;
        let memberDisplayName: string | null = null;

        try {
          const { data: memberRow } = await supabase
            .from('workspace_members')
            .select('workspace_id,display_name')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          fallbackWorkspaceId = String((memberRow as any)?.workspace_id || '').trim() || null;
          memberDisplayName = String((memberRow as any)?.display_name || '').trim() || null;
        } catch (membershipFallbackError) {
          console.warn('Failed to load membership fallback for profile bootstrap:', membershipFallbackError);
        }

        let profileData: Profile = {
          id: userId,
          display_name: memberDisplayName || metadataFullName || metadataDisplayName || fallbackName || null,
          full_name: metadataFullName || memberDisplayName || null,
          avatar_url: avatarUrl || null,
          avatar_mode: storedPrefs.mode ?? 'photo',
          avatar_color: storedPrefs.color ?? '#2A2A2A',
          email_verified: isEmailVerified,
          current_workspace_id: fallbackWorkspaceId,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        profileData = await ensureWorkspace(profileData);
        setProfile(profileData);
        return profileData;
      }

    const storedPrefs = getStoredAvatarPrefs();
    let profileData: Profile = {
      id: newProfile.id,
      display_name: newProfile.display_name,
      full_name: newProfile.full_name,
      avatar_url: newProfile.avatar_url,
      avatar_mode: storedPrefs.mode ?? (newProfile as any).avatar_mode ?? 'photo',
      avatar_color: storedPrefs.color ?? (newProfile as any).avatar_color ?? '#2A2A2A',
      email_verified: newProfile.email_verified ?? false,
      current_workspace_id: newProfile.current_workspace_id,
      onboarding_completed: true,
      created_at: newProfile.created_at,
        updated_at: newProfile.updated_at,
      };

      profileData = await ensureWorkspace(profileData);
      profileData = await syncNameFromMembership(profileData);
      setProfile(profileData);
      return profileData;
    }

    // If Supabase has verified the user's email (or this is OAuth), sync it to profiles.email_verified.
    if (isEmailVerified && !data.email_verified) {
      console.log('Email verified detected, marking profile as verified');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ email_verified: true })
        .eq('id', userId);
      
      if (!updateError) {
        data.email_verified = true;
      }
    }

    // Force onboarding as completed (onboarding flow removed)
    if (!data.onboarding_completed) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId);
      data.onboarding_completed = true;
    }

    // If we have an OAuth avatar and profile is missing it, store it
    if (avatarUrl && !data.avatar_url) {
      const { error: avatarError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

      if (!avatarError) {
        data.avatar_url = avatarUrl;
      }
    }

    const storedPrefs = getStoredAvatarPrefs();
    let profileData: Profile = {
      id: data.id,
      display_name: data.display_name,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      avatar_mode: storedPrefs.mode ?? (data as any).avatar_mode ?? 'photo',
      avatar_color: storedPrefs.color ?? (data as any).avatar_color ?? '#2A2A2A',
      email_verified: data.email_verified ?? false,
      current_workspace_id: data.current_workspace_id,
      onboarding_completed: true,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    profileData = await ensureWorkspace(profileData);
    profileData = await syncNameFromMembership(profileData);
    setProfile(profileData);
    return profileData;
  }, []);

  useEffect(() => {
    let mounted = true;
    let resolved = false;

    const markResolved = () => {
      if (resolved) return;
      resolved = true;
      try {
        clearTimeout(initTimeoutId);
      } catch {
        // ignore
      }
    };

    const forceToLogin = (reason: string) => {
      console.warn('[auth] forcing login due to init stall:', reason);
      try {
        // Clear the Supabase auth token from storage so we don't get stuck in a broken refresh loop.
        const projectRef = String(import.meta.env.VITE_SUPABASE_PROJECT_ID || '').trim();
        if (projectRef && typeof window !== 'undefined') {
          window.localStorage.removeItem(`sb-${projectRef}-auth-token`);
        }
      } catch {
        // ignore
      }

      if (!mounted) return;
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    };

    // If Supabase auth init deadlocks (rare, but happens with corrupted/stale session state),
    // don't leave the app stuck on an infinite skeleton. Drop the user back to login.
    const initTimeoutId = window.setTimeout(() => {
      if (!resolved) forceToLogin('timeout');
    }, 8000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        markResolved();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // TOKEN_REFRESHED can fire frequently; avoid clobbering local profile state
          // with stale DB values right after user-initiated edits.
          const shouldHydrateProfile = event !== 'TOKEN_REFRESHED';
          if (!shouldHydrateProfile) {
            if (mounted) setLoading(false);
            return;
          }

          // Check if this is an OAuth user (Google, etc.)
          const isOAuthUser = session.user.app_metadata?.provider === 'google' || 
                              (session.user.app_metadata?.providers || []).includes('google');
          
          // Fetch profile with setTimeout to avoid deadlock
          const oauthAvatar = (session.user.user_metadata?.avatar_url as string | undefined) || null;
          const emailConfirmedAt =
            ((session.user as any).email_confirmed_at as string | null | undefined) ||
            ((session.user as any).confirmed_at as string | null | undefined) ||
            null;
          setTimeout(() => {
            fetchProfile(session.user.id, session.user.email, isOAuthUser, oauthAvatar, emailConfirmedAt);
          }, 0);
        } else {
          setProfile(null);
        }
        
        if (mounted) setLoading(false);
      }
    );

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check if this is an OAuth user (Google, etc.)
        const isOAuthUser = session.user.app_metadata?.provider === 'google' || 
                            (session.user.app_metadata?.providers || []).includes('google');
        
        const oauthAvatar = (session.user.user_metadata?.avatar_url as string | undefined) || null;
        const emailConfirmedAt =
          ((session.user as any).email_confirmed_at as string | null | undefined) ||
          ((session.user as any).confirmed_at as string | null | undefined) ||
          null;
        // Don't block auth readiness on profile hydration. If profile fetch hangs or fails,
        // we still want to render and allow the user to re-auth/retry.
        fetchProfile(session.user.id, session.user.email, isOAuthUser, oauthAvatar, emailConfirmedAt);
      }

      if (mounted) setLoading(false);
      markResolved();
    });

    return () => {
      mounted = false;
      try {
        clearTimeout(initTimeoutId);
      } catch {
        // ignore
      }
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Supabase sends its "Confirm your signup" email when confirmation is enabled.
        // Land on a dedicated page so we can show a clean "Email verified" success state.
        emailRedirectTo: `${window.location.origin}/email-verified`,
        data: {
          display_name: fullName || email.split('@')[0],
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { error: error as Error };
    }

    const userId = data.user?.id;
    const normalizedFullName = String(fullName || '').trim();

    // Upsert profile naming immediately so workspace/team views can use real names even before first profile fetch.
    if (userId) {
      await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            full_name: normalizedFullName || null,
            display_name: normalizedFullName || email.split('@')[0] || null,
          },
          { onConflict: 'id' }
        );
    }

    const needsEmailConfirmation = !data.session;

    // NOTE: We no longer send our own verification email here because Supabase already sends
    // "Confirm your signup" when email confirmation is enabled. We'll sync email_verified
    // from Supabase confirmation state instead.

    return { error: null, userId, needsEmailConfirmation };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`,
        // youtube.force-ssl allows reading AND editing video metadata (titles, descriptions)
        // yt-analytics.readonly for viewing channel analytics
        scopes: 'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/yt-analytics.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    try {
      window.sessionStorage.removeItem('acq_signin_intent');
    } catch {
      // ignore storage errors
    }
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const dbUpdates: Record<string, unknown> = {};
    if (updates.display_name !== undefined) dbUpdates.display_name = updates.display_name;
    if (updates.full_name !== undefined) dbUpdates.full_name = updates.full_name;
    if (updates.avatar_url !== undefined) dbUpdates.avatar_url = updates.avatar_url;
    if ((updates as any).avatar_mode !== undefined || (updates as any).avatar_color !== undefined) {
      setStoredAvatarPrefs(
        (updates as any).avatar_mode ?? undefined,
        (updates as any).avatar_color ?? undefined,
      );
    }
    if (updates.email_verified !== undefined) dbUpdates.email_verified = updates.email_verified;
    if (updates.current_workspace_id !== undefined) dbUpdates.current_workspace_id = updates.current_workspace_id;
    if (updates.onboarding_completed !== undefined) dbUpdates.onboarding_completed = updates.onboarding_completed;

    let error: Error | null = null;
    let persistedProfileRow: any | null = null;
    let profileRowMissing = false;
    if (Object.keys(dbUpdates).length > 0) {
      const writeProfile = () =>
        supabase
          .from('profiles')
          .update(dbUpdates, { count: 'exact' })
          .eq('id', user.id);

      let updateResult = await writeProfile();

      if (updateResult.error && isAuthTokenError(updateResult.error)) {
        try {
          await supabase.auth.refreshSession();
          updateResult = await writeProfile();
        } catch (refreshErr) {
          console.warn('Session refresh failed while updating profile:', refreshErr);
        }
      }

      let updatedCount = Number(updateResult.count || 0);
      if (!updateResult.error && updatedCount === 0) {
        const setterHintActive = hasSetterRoleHint(user.id) || hasSetterMetadataHint(user.user_metadata);
        if (!setterHintActive) {
          try {
            const fallbackWorkspaceName = String(
              profile?.full_name ||
              profile?.display_name ||
              user.email?.split('@')[0] ||
              'Workspace'
            ).trim() || 'Workspace';
            await supabase.rpc('create_workspace_for_user', {
              p_workspace_name: fallbackWorkspaceName,
              p_user_id: user.id,
            });
            updateResult = await writeProfile();
            updatedCount = Number(updateResult.count || 0);
          } catch (repairErr) {
            console.warn('Profile row repair attempt failed during updateProfile:', repairErr);
          }
        }
      }

      error = updateResult.error as Error | null;
      profileRowMissing = !error && updatedCount === 0;

      if (!error && !profileRowMissing) {
        const { data: freshProfile, error: freshProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (!freshProfileError && freshProfile) {
          persistedProfileRow = freshProfile;
        } else if (freshProfileError) {
          console.warn('Failed to fetch fresh profile row after update:', freshProfileError);
        }
      }
    }
    
    if (!error) {
      let nextWorkspaceId = String(
        updates.current_workspace_id ??
        profile?.current_workspace_id ??
        ''
      ).trim();
      const preferredMemberName = String(
        updates.full_name ??
        updates.display_name ??
        profile?.full_name ??
        profile?.display_name ??
        ''
      ).trim();

      const isNameUpdate = updates.full_name !== undefined || updates.display_name !== undefined;

      if (isNameUpdate && preferredMemberName) {
        // Keep member display names in sync everywhere this user appears.
        const { error: memberNameAllError } = await supabase
          .from('workspace_members')
          .update({ display_name: preferredMemberName })
          .eq('user_id', user.id);
        if (memberNameAllError) {
          console.warn('Failed to sync workspace member display names:', memberNameAllError);
        }
      }

      if (!nextWorkspaceId && preferredMemberName && isNameUpdate) {
        try {
          const { data: ownerMembershipRows } = await supabase
            .from('workspace_members')
            .select('workspace_id,role,created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);
          const ownerRow = (ownerMembershipRows || []).find((row: any) => String(row?.role || '') === 'owner');
          const fallbackRow = ownerRow || (ownerMembershipRows || [])[0];
          nextWorkspaceId = String((fallbackRow as any)?.workspace_id || '').trim();
        } catch (membershipLookupError) {
          console.warn('Failed to resolve fallback workspace for profile name sync:', membershipLookupError);
        }
      }

      if (nextWorkspaceId && preferredMemberName && isNameUpdate) {
        const { error: memberNameError } = await supabase
          .from('workspace_members')
          .update({ display_name: preferredMemberName })
          .eq('workspace_id', nextWorkspaceId)
          .eq('user_id', user.id);
        if (memberNameError) {
          console.warn('Failed to sync workspace member display name:', memberNameError);
        }
      }

      if (persistedProfileRow) {
        const storedPrefs = getStoredAvatarPrefs();
        const nextProfile: Profile = {
          id: persistedProfileRow.id,
          display_name: persistedProfileRow.display_name,
          full_name: persistedProfileRow.full_name,
          avatar_url: persistedProfileRow.avatar_url,
          avatar_mode:
            (updates as any).avatar_mode ??
            storedPrefs.mode ??
            (persistedProfileRow as any).avatar_mode ??
            profile?.avatar_mode ??
            'photo',
          avatar_color:
            (updates as any).avatar_color ??
            storedPrefs.color ??
            (persistedProfileRow as any).avatar_color ??
            profile?.avatar_color ??
            '#2A2A2A',
          email_verified: persistedProfileRow.email_verified ?? profile?.email_verified ?? false,
          current_workspace_id: persistedProfileRow.current_workspace_id ?? profile?.current_workspace_id ?? null,
          onboarding_completed: persistedProfileRow.onboarding_completed ?? profile?.onboarding_completed ?? true,
          created_at: persistedProfileRow.created_at ?? profile?.created_at ?? new Date().toISOString(),
          updated_at: persistedProfileRow.updated_at ?? profile?.updated_at ?? new Date().toISOString(),
        };
        setProfile(nextProfile);
      } else if (profile) {
        setProfile({ ...profile, ...updates });
      } else {
        const storedPrefs = getStoredAvatarPrefs();
        const metadata = (user.user_metadata || {}) as Record<string, unknown>;
        const metadataName = String(
          (metadata.full_name as string | undefined) ||
          (metadata.display_name as string | undefined) ||
          ''
        ).trim();
        const fallbackName = String(
          updates.full_name ??
          updates.display_name ??
          metadataName ??
          user.email?.split('@')[0] ??
          ''
        ).trim();
        const isOAuthUser = user.app_metadata?.provider === 'google' ||
          (user.app_metadata?.providers || []).includes('google');
        const emailConfirmedAt =
          ((user as any).email_confirmed_at as string | null | undefined) ||
          ((user as any).confirmed_at as string | null | undefined) ||
          null;
        const nextDisplayName =
          (updates.display_name as string | null | undefined) ??
          (fallbackName || null);
        const nextFullName =
          (updates.full_name as string | null | undefined) ??
          (fallbackName || null);
        setProfile({
          id: user.id,
          display_name: nextDisplayName,
          full_name: nextFullName,
          avatar_url: (updates.avatar_url as string | null | undefined) ?? null,
          avatar_mode:
            (updates as any).avatar_mode ??
            storedPrefs.mode ??
            'photo',
          avatar_color:
            (updates as any).avatar_color ??
            storedPrefs.color ??
            '#2A2A2A',
          email_verified: Boolean(isOAuthUser || emailConfirmedAt),
          current_workspace_id: (updates.current_workspace_id as string | null | undefined) ?? null,
          onboarding_completed: Boolean(updates.onboarding_completed ?? true),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
    
    return { error };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const requestPasswordReset = async (email: string) => {
    // Edge function will look up user by email server-side
    // Always return success to prevent user enumeration
    try {
      await supabase.functions.invoke('send-verification-email', {
        body: {
          email,
          type: 'password-reset',
        },
      });
    } catch (err) {
      // Log error but don't expose to user (prevent enumeration)
      console.error('Password reset error:', err);
    }

    // Always return success to prevent user enumeration attacks
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
      refreshProfile,
      requestPasswordReset,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
