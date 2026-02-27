import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useYouTubeOAuth() {
  const connectYouTube = useCallback(async () => {
    // Use dedicated callback route that bypasses onboarding redirects
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // CRITICAL: Redirect to dedicated callback page that handles the OAuth flow
        // This route is excluded from onboarding/auth middleware
        redirectTo: `${window.location.origin}/youtube-callback`,
        // youtube.force-ssl allows reading AND editing video metadata (titles, descriptions)
        // yt-analytics.readonly for viewing channel analytics
        scopes: [
          'https://www.googleapis.com/auth/youtube.force-ssl',
          'https://www.googleapis.com/auth/youtube',
          'https://www.googleapis.com/auth/yt-analytics.readonly',
        ].join(' '),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: 'true',
        },
      },
    });
    
    return { error };
  }, []);

  return { connectYouTube };
}
