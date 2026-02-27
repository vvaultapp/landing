import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { AppFrameSkeleton } from '@/components/skeletons/AppFrameSkeleton';
import { hasSetterMetadataHint, hasSetterRoleHint, setSetterRoleHint } from '@/lib/setterRoleHint';

export default function SetterPortal() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { userRole, loading: workspaceLoading } = useWorkspace();
  const { portalRole, loading: portalLoading } = usePortalAuth();

  useEffect(() => {
    try {
      sessionStorage.setItem('acq_signin_intent', 'setter');
    } catch {
      // ignore storage errors
    }

    if (authLoading || workspaceLoading) return;
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    setSetterRoleHint(user.id);
    const setterHintActive = hasSetterRoleHint(user.id) || hasSetterMetadataHint(user.user_metadata);
    const isSetterMode = setterHintActive || userRole === 'setter' || portalRole === 'setter';
    if (!portalLoading && !isSetterMode) {
      navigate('/dashboard', { replace: true });
      return;
    }
    navigate('/setter-portal/messages', { replace: true });
  }, [authLoading, workspaceLoading, portalLoading, user, userRole, portalRole, navigate]);

  return <AppFrameSkeleton />;
}
