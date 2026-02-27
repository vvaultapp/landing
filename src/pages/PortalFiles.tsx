import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { PortalAccessBlocked } from '@/components/portal/PortalAccessBlocked';
import { ClientDriveExplorer } from '@/components/clients/ClientDriveExplorer';
import { PortalFrameSkeleton } from '@/components/skeletons/PortalFrameSkeleton';

export default function PortalFiles() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { portalRole, client, loading, isAccessBlocked, blockReason } = usePortalAuth();

  useEffect(() => {
    if (authLoading || loading) return;

    if (!user) {
      navigate('/portal/login');
      return;
    }

    if (portalRole !== 'client') {
      navigate('/dashboard');
      return;
    }

    if (client && !client.onboardingCompleted) {
      navigate('/portal/onboarding');
    }
  }, [user, authLoading, loading, portalRole, client, navigate]);

  if (authLoading || loading) {
    return <PortalFrameSkeleton />;
  }

  if (isAccessBlocked) {
    return <PortalAccessBlocked reason={blockReason} />;
  }

  if (!client) return null;

  return (
    <PortalLayout client={client}>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-[36px] font-bold mb-2">Drive</h1>
          <p className="text-muted-foreground">Shared files and folders synced with your coach.</p>
        </div>
        <ClientDriveExplorer client={client} />
      </div>
    </PortalLayout>
  );
}
