import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { AppFrameSkeleton } from '@/components/skeletons/AppFrameSkeleton';
import { hasSetterMetadataHint, hasSetterRoleHint } from '@/lib/setterRoleHint';

export default function Index() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { userRole, loading: workspaceLoading } = useWorkspace();
  const { portalRole, loading: portalLoading } = usePortalAuth();
  const signInIntentSetter =
    typeof window !== 'undefined' && window.sessionStorage.getItem('acq_signin_intent') === 'setter';
  const setterHintActive = Boolean(user?.id) && hasSetterRoleHint(user.id);
  const setterMetadataActive = hasSetterMetadataHint(user?.user_metadata);

  useEffect(() => {
    if (loading || portalLoading) return;

    // If the user landed here from a Supabase confirmation/magic link, don't immediately
    // navigate away and drop the URL tokens. Route them to the dedicated callback page.
    const hasAccessToken = window.location.hash.includes('access_token=');
    const hasCode = window.location.search.includes('code=');
    if (hasAccessToken || hasCode) {
      navigate(`/email-verified${window.location.search}${window.location.hash}`, { replace: true });
      return;
    }
    
    if (!user) {
      // Not logged in - go to auth
      navigate('/auth');
    } else {
      if (signInIntentSetter || setterHintActive || setterMetadataActive) {
        navigate('/setter-portal/messages', { replace: true });
        return;
      }
      if (portalRole === 'client') {
        navigate('/portal/meetings', { replace: true });
        return;
      }
      if (portalRole === 'setter') {
        navigate('/setter-portal/messages', { replace: true });
        return;
      }

      // Wait for workspace role so we can route correctly (owner -> dashboard, setter -> setter portal inbox).
      if (workspaceLoading) return;

      const target = userRole === 'setter' ? '/setter-portal/messages' : '/dashboard';
      navigate(target);
    }
  }, [
    user,
    loading,
    portalLoading,
    portalRole,
    navigate,
    userRole,
    workspaceLoading,
    signInIntentSetter,
    setterHintActive,
    setterMetadataActive,
  ]);

  return (
    <AppFrameSkeleton />
  );
}
