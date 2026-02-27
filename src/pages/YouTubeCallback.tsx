import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

/**
 * Dedicated YouTube OAuth callback page.
 * This page MUST be excluded from all onboarding/auth redirects.
 * It handles the OAuth callback, connects the YouTube channel,
 * then redirects to the appropriate destination.
 */
export default function YouTubeCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[YouTubeCallback] Processing OAuth callback...');
        const params = new URLSearchParams(window.location.search);
        const oauthError = params.get('error_description') || params.get('error');
        if (oauthError) {
          throw new Error(decodeURIComponent(oauthError.replace(/\+/g, ' ')));
        }
        
        // Get the current session - this should have the provider_token from OAuth
        let { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[YouTubeCallback] Session error:', sessionError);
          throw new Error('Failed to get session');
        }

        // If we don't have a provider token yet, try to exchange the OAuth code
        if (!session?.provider_token) {
          const code = params.get('code');
          if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.error('[YouTubeCallback] Exchange code error:', error);
            } else if (data?.session) {
              session = data.session;
            }
          }
        }

        if (!session) {
          console.error('[YouTubeCallback] No session found');
          throw new Error('No session found. Please try again.');
        }

        console.log('[YouTubeCallback] Session found:', {
          userId: session.user.id,
          hasProviderToken: !!session.provider_token,
          provider: session.user.app_metadata?.provider,
        });

        // Check if we have a provider token (from Google OAuth)
        if (!session.provider_token) {
          console.error('[YouTubeCallback] No provider token in session');
          throw new Error('No YouTube access token received. Please try connecting again.');
        }

        // Get or create workspace - fetch user's profile for current_workspace_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('current_workspace_id')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('[YouTubeCallback] Profile error:', profileError);
          throw new Error('Failed to load user profile');
        }

        let workspaceId = profile?.current_workspace_id ?? null;

        // If no workspace, create one automatically using SECURITY DEFINER RPC
        if (!workspaceId) {
          const defaultName = session.user.email?.split('@')[0] || 'Workspace';
          const preferredDisplayName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null;
          const { data: newWorkspaceId, error: rpcError } = await supabase
            .rpc('create_workspace_for_user', {
              p_workspace_name: defaultName,
              p_user_id: session.user.id,
            });

          if (!rpcError && newWorkspaceId) {
            workspaceId = newWorkspaceId;
          } else {
            console.error('[YouTubeCallback] Workspace RPC error:', rpcError);

            // Fallback to direct insert + explicit owner membership.
            const fallbackWorkspaceId = crypto.randomUUID();
            const { data: wsData, error: wsInsertError } = await supabase
              .from('workspaces')
              .insert({ id: fallbackWorkspaceId, name: defaultName })
              .select()
              .single();

            if (wsInsertError) {
              console.error('[YouTubeCallback] Workspace fallback insert error:', wsInsertError);
            } else if (wsData?.id) {
              const { error: memberInsertError } = await supabase.from('workspace_members').insert({
                id: crypto.randomUUID(),
                workspace_id: fallbackWorkspaceId,
                user_id: session.user.id,
                role: 'owner',
                display_name: preferredDisplayName,
              });

              if (memberInsertError && String((memberInsertError as any)?.code || '') !== '23505') {
                console.error('[YouTubeCallback] Workspace fallback owner insert error:', memberInsertError);
              } else {
                workspaceId = fallbackWorkspaceId;
                const { error: onboardingInsertError } = await supabase.from('onboarding_responses').insert({
                  id: crypto.randomUUID(),
                  workspace_id: fallbackWorkspaceId,
                  business_name: defaultName,
                });
                if (onboardingInsertError && String((onboardingInsertError as any)?.code || '') !== '23505') {
                  console.warn('[YouTubeCallback] Workspace fallback onboarding seed warning:', onboardingInsertError);
                }
                await supabase
                  .from('profiles')
                  .update({ current_workspace_id: fallbackWorkspaceId, onboarding_completed: true })
                  .eq('id', session.user.id);
              }
            }
          }
        }

        if (workspaceId) {
          const { data: membershipRow, error: membershipError } = await supabase
            .from('workspace_members')
            .select('workspace_id')
            .eq('workspace_id', workspaceId)
            .eq('user_id', session.user.id)
            .limit(1)
            .maybeSingle();
          if (membershipError) {
            console.warn('[YouTubeCallback] Membership validation warning:', membershipError);
          }
          if (!membershipRow?.workspace_id) {
            workspaceId = null;
          }
        }

        if (!workspaceId) {
          throw new Error('Could not bootstrap a valid workspace for this account. Please try again.');
        }

        // Connect the YouTube channel via edge function
        console.log('[YouTubeCallback] Connecting YouTube channel to workspace:', workspaceId);
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-channel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'connect-oauth',
            providerToken: session.provider_token,
            workspaceId: workspaceId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('[YouTubeCallback] Channel connect error:', result);
          throw new Error(result.error || 'Failed to connect YouTube channel');
        }

        console.log('[YouTubeCallback] Channel connected successfully:', result);
        setStatus('success');

        if (result.alreadyConnected) {
          toast.info('YouTube channel already connected!');
        } else {
          toast.success('YouTube channel connected successfully!');
        }

        // Always redirect to content
        navigate('/content', { replace: true });

      } catch (error) {
        console.error('[YouTubeCallback] Error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
    };

    handleCallback();
  }, [navigate]);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-medium mb-2">Connection Failed</h1>
          <p className="text-muted-foreground mb-6">
            {errorMessage || 'Failed to connect your YouTube channel. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/content', { replace: true })}
            >
              Go to Content
            </Button>
            <Button 
              onClick={() => {
                // Retry - go back to content and click connect again
                navigate('/content', { replace: true });
              }}
            >
              Try Again
            </Button>
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
          {status === 'success' ? 'Connected!' : 'Connecting YouTube...'}
        </h1>
        <p className="text-muted-foreground">
          {status === 'success' 
            ? 'Redirecting to your dashboard...' 
            : 'Please wait while we connect your channel.'}
        </p>
      </div>
    </div>
  );
}
