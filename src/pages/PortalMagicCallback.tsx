import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function PortalMagicCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientId = searchParams.get('clientId');

  useEffect(() => {
    const handleCallback = async () => {
      // Wait for auth to resolve
      if (!user) {
        // Check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Try to exchange the token from URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('Error setting session:', sessionError);
              setError('Failed to authenticate. Please try the link again.');
              setProcessing(false);
              return;
            }
          } else {
            // No token, redirect to auth
            setError('Invalid magic link. Please request a new one.');
            setProcessing(false);
            return;
          }
        }
      }

      // User is now authenticated, ensure portal role exists
      if (user && clientId) {
        // Check if portal role exists
        const { data: portalRole } = await supabase
          .from('portal_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'client')
          .maybeSingle();

        if (portalRole) {
          // Check if client onboarding is complete
          const { data: client } = await supabase
            .from('clients')
            .select('onboarding_completed')
            .eq('id', clientId)
            .maybeSingle();

          if (client?.onboarding_completed) {
            toast.success('Welcome back!');
            navigate('/portal');
          } else {
            toast.success('Welcome! Let\'s get you set up.');
            navigate('/portal/onboarding');
          }
        } else {
          // Portal role should have been created by the edge function
          // But just in case, redirect to portal and let it handle
          toast.success('Welcome!');
          navigate('/portal');
        }
      } else if (user) {
        // User exists but no clientId, just go to portal
        navigate('/portal');
      }

      setProcessing(false);
    };

    handleCallback();
  }, [user, clientId, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-medium mb-4">Link Expired</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate('/portal/login')}
            className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
