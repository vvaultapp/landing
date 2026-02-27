import { useNavigate } from 'react-router-dom';
import { ShieldX, LogOut, Mail } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface PortalAccessBlockedProps {
  reason: 'paused' | 'expired' | null;
}

export function PortalAccessBlocked({ reason }: PortalAccessBlockedProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold mb-3">Access Paused</h1>

        <p className="text-muted-foreground mb-6">
          {reason === 'expired'
            ? 'Your access period has ended. Please contact the ACQ team to renew your subscription.'
            : 'Your access has been paused. Please contact the ACQ team to continue.'}
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => window.open('mailto:support@theacq.app', '_blank')}
            className="w-full bg-white text-black hover:bg-white/90 font-semibold"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact ACQ Team
          </Button>

          <Button variant="destructive" onClick={handleSignOut} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
