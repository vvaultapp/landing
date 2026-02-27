import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface YouTubeChannelInfo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

export interface YouTubeAnalytics {
  views: number;
  estimatedMinutesWatched: number;
  averageViewDuration: number;
  subscribersGained: number;
  subscribersLost: number;
  likes: number;
  comments: number;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  views: number;
  publishedAt: string;
}

export interface YouTubeData {
  channelInfo?: YouTubeChannelInfo;
  analytics?: YouTubeAnalytics;
  recentVideos?: YouTubeVideo[];
}

export function useYouTubeAnalytics() {
  const { session } = useAuth();
  const [data, setData] = useState<YouTubeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresReauth, setRequiresReauth] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!session?.provider_token) {
      setError('No Google connection found. Please sign in with Google.');
      setRequiresReauth(true);
      return;
    }

    setLoading(true);
    setError(null);
    setRequiresReauth(false);

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke('youtube-analytics', {
        body: { provider_token: session.provider_token },
      });

      if (fnError) {
        console.error('Function error:', fnError);
        setError('Failed to fetch YouTube analytics');
        return;
      }

      if (response.error) {
        setError(response.error);
        if (response.requiresReauth) {
          setRequiresReauth(true);
        }
        return;
      }

      setData(response);
    } catch (err) {
      console.error('Error fetching YouTube analytics:', err);
      setError('Failed to connect to YouTube');
    } finally {
      setLoading(false);
    }
  }, [session?.provider_token]);

  // Check if user has Google connected
  const hasGoogleConnection = useCallback(() => {
    return !!session?.provider_token;
  }, [session?.provider_token]);

  return {
    data,
    loading,
    error,
    requiresReauth,
    fetchAnalytics,
    hasGoogleConnection,
  };
}
