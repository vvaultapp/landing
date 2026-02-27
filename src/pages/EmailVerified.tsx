import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from '@/components/ui/icons';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

type Status = 'processing' | 'success' | 'error';

async function tryFinalizeAuthFromUrl(): Promise<void> {
  // Handle PKCE flows (?code=...) just in case Supabase uses it.
  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        throw error;
      }
    }
  } catch (e) {
    // Re-throw so the caller can render a useful error state.
    throw e;
  }

  // For implicit flows (#access_token=...), supabase-js will usually auto-detect.
  // Give it a tick to initialize in case the app redirected quickly.
  await new Promise((r) => setTimeout(r, 0));
}

export default function EmailVerified() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [status, setStatus] = useState<Status>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLikelyCallback = useMemo(() => {
    const hasHashTokens = window.location.hash.includes('access_token=');
    const hasCode = window.location.search.includes('code=');
    return hasHashTokens || hasCode;
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        if (isLikelyCallback) {
          await tryFinalizeAuthFromUrl();
        }

        // If a session exists, make sure email_verified is synced via AuthProvider.
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error('No session found. Please log in again and retry the email link.');
        }

        // Belt-and-suspenders: ensure the profile flag is synced so DashboardLayout doesn't bounce.
        try {
          await supabase
            .from('profiles')
            .update({ email_verified: true })
            .eq('id', sessionData.session.user.id);
        } catch {
          // ignore
        }

        setStatus('success');
        toast.success('Email verified!');
      } catch (e: any) {
        console.error('[EmailVerified] Error:', e);
        setStatus('error');
        setErrorMessage(String(e?.message || 'Failed to verify email'));
      }
    };

    run();
  }, [isLikelyCallback]);

  // While auth context is still loading, keep the page stable.
  if (loading && status !== 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Finalizing verification…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-medium mb-2">Verification Failed</h1>
          <p className="text-muted-foreground mb-6">
            {errorMessage || 'We could not verify your email. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/auth', { replace: true })}>
              Back to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const email = user?.email || profile?.display_name || '';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-xl font-medium mb-2">Email verified</h1>
        <p className="text-muted-foreground mb-6">
          {email ? <>You’re verified as <strong>{email}</strong>.</> : 'Your email is verified.'}
        </p>
        <Button onClick={() => navigate('/messages', { replace: true })}>
          View dashboard
        </Button>
      </div>
    </div>
  );
}
