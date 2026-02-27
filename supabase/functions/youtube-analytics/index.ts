import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeAnalyticsResponse {
  channelInfo?: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
  };
  analytics?: {
    views: number;
    estimatedMinutesWatched: number;
    averageViewDuration: number;
    subscribersGained: number;
    subscribersLost: number;
    likes: number;
    comments: number;
  };
  recentVideos?: Array<{
    id: string;
    title: string;
    thumbnailUrl: string;
    views: number;
    publishedAt: string;
  }>;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Get the user's Google OAuth identity
    const googleIdentity = user.identities?.find(i => i.provider === 'google');
    if (!googleIdentity) {
      console.error('No Google identity found for user');
      return new Response(
        JSON.stringify({ error: 'No Google account connected. Please sign in with Google.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the provider token from the session
    // We need to use the admin API to get the session with provider tokens
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.getUserById(user.id);
    
    if (sessionError) {
      console.error('Error getting user session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to get session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // The provider_token is stored in the identity_data
    // We need the client to pass the provider_token since it's available in the session
    const body = await req.json().catch(() => ({}));
    const providerToken = body.provider_token;

    if (!providerToken) {
      console.error('No provider token provided');
      return new Response(
        JSON.stringify({ 
          error: 'No access token available. Please sign out and sign in with Google again.',
          requiresReauth: true 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Got provider token, fetching YouTube data...');

    // Fetch channel info from YouTube Data API
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      {
        headers: {
          'Authorization': `Bearer ${providerToken}`,
        },
      }
    );

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error('YouTube API error:', channelResponse.status, errorText);
      
      if (channelResponse.status === 401 || channelResponse.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: 'YouTube access expired. Please sign out and sign in with Google again.',
            requiresReauth: true 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `YouTube API error: ${channelResponse.status}` }),
        { status: channelResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const channelData = await channelResponse.json();
    console.log('Channel data received:', channelData.items?.length || 0, 'channels');

    if (!channelData.items || channelData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No YouTube channel found for this account' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const channel = channelData.items[0];
    const channelId = channel.id;

    // Fetch analytics data (last 28 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let analytics = null;
    try {
      const analyticsResponse = await fetch(
        `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes,comments&dimensions=`,
        {
          headers: {
            'Authorization': `Bearer ${providerToken}`,
          },
        }
      );

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        console.log('Analytics data received');
        
        if (analyticsData.rows && analyticsData.rows.length > 0) {
          const row = analyticsData.rows[0];
          analytics = {
            views: row[0] || 0,
            estimatedMinutesWatched: row[1] || 0,
            averageViewDuration: row[2] || 0,
            subscribersGained: row[3] || 0,
            subscribersLost: row[4] || 0,
            likes: row[5] || 0,
            comments: row[6] || 0,
          };
        }
      } else {
        console.log('Analytics API returned non-OK status:', analyticsResponse.status);
      }
    } catch (analyticsError) {
      console.log('Could not fetch analytics (might not be enabled):', analyticsError);
    }

    // Fetch recent videos
    let recentVideos: YouTubeAnalyticsResponse['recentVideos'] = [];
    try {
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=5`,
        {
          headers: {
            'Authorization': `Bearer ${providerToken}`,
          },
        }
      );

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        
        if (videosData.items && videosData.items.length > 0) {
          // Get video statistics
          const videoIds = videosData.items.map((v: any) => v.id.videoId).join(',');
          const statsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}`,
            {
              headers: {
                'Authorization': `Bearer ${providerToken}`,
              },
            }
          );

          const statsData = statsResponse.ok ? await statsResponse.json() : { items: [] };
          const statsMap = new Map(statsData.items?.map((s: any) => [s.id, s.statistics]) || []);

          recentVideos = videosData.items.map((video: any) => ({
            id: video.id.videoId,
            title: video.snippet.title,
            thumbnailUrl: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
            views: parseInt((statsMap.get(video.id.videoId) as any)?.viewCount || '0'),
            publishedAt: video.snippet.publishedAt,
          }));
        }
      }
    } catch (videosError) {
      console.log('Could not fetch recent videos:', videosError);
    }

    const response: YouTubeAnalyticsResponse = {
      channelInfo: {
        id: channelId,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnailUrl: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
        subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
        videoCount: parseInt(channel.statistics.videoCount || '0'),
        viewCount: parseInt(channel.statistics.viewCount || '0'),
      },
      analytics: analytics ?? undefined,
      recentVideos,
    };

    console.log('Returning YouTube analytics data');
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in youtube-analytics function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
