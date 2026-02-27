import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { setSetterRoleHint } from '@/lib/setterRoleHint';

export default function SetterMagicCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      try {
        sessionStorage.setItem('acq_signin_intent', 'setter');
      } catch {
        // ignore storage errors
      }

      const token = searchParams.get('token');
      
      // Check if we have a session from the magic link
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setErrorMessage('Failed to verify your session. Please try again.');
        setStatus('error');
        return;
      }

      if (!session) {
        // No session yet, the magic link auth might still be processing
        // Check URL hash for auth tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            setErrorMessage('Failed to sign in. Please try again.');
            setStatus('error');
            return;
          }
        } else {
          setErrorMessage('No valid session found. Please use the link from your email.');
          setStatus('error');
          return;
        }
      }

      // If we have an invite token, accept the invite
      if (token) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setSetterRoleHint(user.id);
          // Accept the invite via edge function
          const { data, error } = await supabase.functions.invoke('accept-invite', {
            body: { token, userId: user.id },
          });

          if (error) {
            console.error('Error accepting invite:', error);
            // Continue anyway - might already be accepted
          } else if (data?.success) {
            console.log('Invite accepted successfully');
          }
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        setSetterRoleHint(user?.id || null);
      }

      setStatus('success');
      toast.success('Welcome! Let\'s set up your secure code.');
      
      // Redirect to setter onboarding to create secure code
      setTimeout(() => {
        navigate('/setter-portal/onboarding');
      }, 1000);

    } catch (err) {
      console.error('Callback error:', err);
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-border border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your access...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <h2 className="text-lg font-medium mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
          <button
            onClick={() => navigate('/auth')}
            className="text-blue-400 hover:underline text-sm"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-500 text-xl">✓</span>
        </div>
        <p className="text-muted-foreground">Redirecting to setup...</p>
      </div>
    </div>
  );
}
