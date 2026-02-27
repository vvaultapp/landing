import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

type Status = 'processing' | 'success' | 'error';

function tryDecodeState(stateParam: string | null): { workspaceId?: string } | null {
  if (!stateParam) return null;
  try {
    const json = atob(decodeURIComponent(stateParam));
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object') return parsed as { workspaceId?: string };
    return null;
  } catch {
    return null;
  }
}

async function extractInvokeErrorMessage(error: unknown): Promise<string> {
  const typed = error as { message?: string; context?: Response };
  const fallback = String(typed?.message || '').trim();
  const ctx = typed?.context;
  if (!ctx) return fallback || 'Failed to connect Instagram.';

  try {
    const payload = await ctx.clone().json();
    const detail = String(payload?.error || payload?.message || '').trim();
    if (detail) return detail;
  } catch {
    // ignore
  }

  try {
    const text = String(await ctx.clone().text()).trim();
    if (text) return text;
  } catch {
    // ignore
  }

  return fallback || 'Failed to connect Instagram.';
}

export default function InstagramCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  useEffect(() => {
    const run = async () => {
      try {
        const oauthError =
          params.get('error_description') ||
          params.get('error_message') ||
          params.get('error') ||
          params.get('error_reason');

        if (oauthError) {
          throw new Error(decodeURIComponent(oauthError.replace(/\+/g, ' ')));
        }

        const code = params.get('code');
        if (!code) {
          throw new Error('Missing OAuth code. Please try connecting again.');
        }

        const decodedState = tryDecodeState(params.get('state'));
        const sessionWorkspaceId = sessionStorage.getItem('ig_connect_workspace_id') || undefined;

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('[InstagramCallback] getSession error:', sessionError);
        }
        const session = sessionData.session;
        if (!session) {
          throw new Error('You are not logged in. Please log in and try connecting again.');
        }

        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          throw new Error('Session expired. Please log in again and reconnect Instagram.');
        }

        let workspaceId = decodedState?.workspaceId || sessionWorkspaceId || null;

        if (!workspaceId) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('current_workspace_id')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('[InstagramCallback] profile error:', profileError);
          }
          workspaceId = profile?.current_workspace_id ?? null;
        }

        if (!workspaceId) {
          throw new Error('No workspace found. Open the app, create/select a workspace, then try again.');
        }

        const { data, error } = await supabase.functions.invoke('instagram-connect', {
          body: {
            action: 'exchange-code',
            workspaceId,
            code,
          },
        });

        if (error) {
          console.error('[InstagramCallback] exchange-code invoke error:', error);
          const detail = await extractInvokeErrorMessage(error);
          throw new Error(detail || 'Failed to connect Instagram.');
        }

        if (!data?.success) {
          throw new Error(data?.error || 'Failed to connect Instagram.');
        }

        setStatus('success');
        toast.success('Instagram connected!');
        sessionStorage.removeItem('ig_connect_workspace_id');
        navigate('/messages', { replace: true });
      } catch (err) {
        console.error('[InstagramCallback] Error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    };

    run();
  }, [navigate, params]);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-medium mb-2">Instagram Connection Failed</h1>
          <p className="text-muted-foreground mb-6">
            {errorMessage || 'Failed to connect your Instagram account. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/messages', { replace: true })}>
              Go to Inbox
            </Button>
            <Button onClick={() => navigate('/messages', { replace: true })}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-xl font-medium mb-2">
          {status === 'success' ? 'Connected!' : 'Connecting Instagram...'}
        </h1>
        <p className="text-muted-foreground">
          {status === 'success' ? 'Redirecting to your inbox...' : 'Please wait while we complete the connection.'}
        </p>
      </div>
    </div>
  );
}
