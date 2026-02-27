import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useGoogleCalendarOAuth() {
  const connectGoogleCalendar = useCallback(async () => {
    // Use dedicated callback route that bypasses onboarding redirects
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // CRITICAL: Redirect to dedicated callback page that handles the OAuth flow
        redirectTo: `${window.location.origin}/calendar-callback`,
        // Google Calendar API scopes
        scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: 'true',
        },
      },
    });
    
    return { error };
  }, []);

  return { connectGoogleCalendar };
}
