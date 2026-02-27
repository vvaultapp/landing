import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Use getClaims for JWT validation instead of getUser (which requires session)
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims?.sub) {
      console.error('Auth error:', claimsError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub as string;

    const body = await req.json();
    const { action, channelInput, workspaceId, channelDbId, providerToken } = body;
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!YOUTUBE_API_KEY) {
      console.error('YOUTUBE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'YouTube API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`YouTube channel action: ${action}, user: ${userId}, workspace: ${workspaceId}`);

    // Helper to resolve channel ID from various inputs
    async function resolveChannelId(input: string): Promise<{ channelId: string; channelData: any } | null> {
      let channelId = '';
      
      // Clean input
      input = input.trim();
      
      // Check if it's a full URL
      if (input.includes('youtube.com')) {
        const url = new URL(input);
        const pathParts = url.pathname.split('/').filter(Boolean);
        
        if (pathParts[0] === 'channel') {
          channelId = pathParts[1];
        } else if (pathParts[0] === 'c' || pathParts[0] === 'user' || pathParts[0]?.startsWith('@')) {
          // Need to search by username/handle
          const searchTerm = pathParts[0].startsWith('@') ? pathParts[0] : pathParts[1];
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(searchTerm)}&key=${YOUTUBE_API_KEY}`;
          const searchRes = await fetch(searchUrl);
          const searchData = await searchRes.json();
          
          if (searchData.items?.[0]) {
            channelId = searchData.items[0].snippet.channelId;
          }
        } else if (pathParts[0]?.startsWith('@')) {
          // Handle @username format
          const handle = pathParts[0];
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${YOUTUBE_API_KEY}`;
          const searchRes = await fetch(searchUrl);
          const searchData = await searchRes.json();
          
          if (searchData.items?.[0]) {
            channelId = searchData.items[0].snippet.channelId;
          }
        }
      } else if (input.startsWith('@')) {
        // Handle @username format directly
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(input)}&key=${YOUTUBE_API_KEY}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        if (searchData.items?.[0]) {
          channelId = searchData.items[0].snippet.channelId;
        }
      } else if (input.startsWith('UC')) {
        // Direct channel ID
        channelId = input;
      } else {
        // Try as username search
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(input)}&key=${YOUTUBE_API_KEY}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        if (searchData.items?.[0]) {
          channelId = searchData.items[0].snippet.channelId;
        }
      }

      if (!channelId) {
        return null;
      }

      // Get full channel details
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${YOUTUBE_API_KEY}`;
      const channelRes = await fetch(channelUrl);
      const channelData = await channelRes.json();

      if (!channelData.items?.[0]) {
        return null;
      }

      return { channelId, channelData: channelData.items[0] };
    }

    // Helper to fetch videos for a channel
    async function fetchChannelVideos(ytChannelId: string, maxResults = 50): Promise<any[]> {
      // Get recent uploads using search
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytChannelId}&order=date&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (!searchData.items?.length) {
        return [];
      }

      // Get video IDs
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

      // Get full video details
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
      const videosRes = await fetch(videosUrl);
      const videosData = await videosRes.json();

      return videosData.items || [];
    }

    // Helper to determine if video is a Short
    function isYouTubeShort(video: any): boolean {
      const duration = video.contentDetails?.duration || '';
      // Parse ISO 8601 duration (PT1M30S format)
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return false;
      
      const hours = parseInt(match[1] || '0');
      const minutes = parseInt(match[2] || '0');
      const seconds = parseInt(match[3] || '0');
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      
      // Shorts are typically under 60 seconds
      return totalSeconds <= 60;
    }

    switch (action) {
      case 'connect-oauth': {
        // OAuth-based connection - use provider token to get user's own channel
        if (!providerToken || !workspaceId) {
          return new Response(JSON.stringify({ error: 'Missing providerToken or workspaceId' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get the authenticated user's channel using OAuth token
        const myChannelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&mine=true`;
        const myChannelRes = await fetch(myChannelUrl, {
          headers: {
            'Authorization': `Bearer ${providerToken}`,
          },
        });

        if (!myChannelRes.ok) {
          const errorText = await myChannelRes.text();
          console.error('YouTube API error:', errorText);
          return new Response(JSON.stringify({ error: 'Failed to fetch your YouTube channel. Please reconnect.' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const myChannelData = await myChannelRes.json();
        
        if (!myChannelData.items?.[0]) {
          return new Response(JSON.stringify({ error: 'No YouTube channel found for this account' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const channelItem = myChannelData.items[0];
        const channelId = channelItem.id;
        const snippet = channelItem.snippet;
        const statistics = channelItem.statistics;

        // Check if already connected
        const { data: existing } = await supabase
          .from('connected_youtube_channels')
          .select('id')
          .eq('workspace_id', workspaceId)
          .eq('channel_id', channelId)
          .single();

        if (existing) {
          // Already connected - just return success
          return new Response(JSON.stringify({ success: true, channel: existing, alreadyConnected: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Insert channel
        const { data: channel, error: insertError } = await supabase
          .from('connected_youtube_channels')
          .insert({
            workspace_id: workspaceId,
            channel_id: channelId,
            title: snippet.title,
            description: snippet.description,
            custom_url: snippet.customUrl,
            thumbnail_url: snippet.thumbnails?.default?.url,
            subscriber_count: parseInt(statistics.subscriberCount || '0'),
            video_count: parseInt(statistics.videoCount || '0'),
            view_count: parseInt(statistics.viewCount || '0'),
            last_synced_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error('Insert channel error:', insertError);
          return new Response(JSON.stringify({ error: 'Failed to save channel' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`Connected OAuth channel: ${snippet.title} (${channelId})`);

        return new Response(JSON.stringify({ success: true, channel }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'connect': {
        if (!channelInput || !workspaceId) {
          return new Response(JSON.stringify({ error: 'Missing channelInput or workspaceId' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const resolved = await resolveChannelId(channelInput);
        if (!resolved) {
          return new Response(JSON.stringify({ error: 'Could not find YouTube channel' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { channelId, channelData } = resolved;
        const snippet = channelData.snippet;
        const statistics = channelData.statistics;

        // Check if already connected
        const { data: existing } = await supabase
          .from('connected_youtube_channels')
          .select('id')
          .eq('workspace_id', workspaceId)
          .eq('channel_id', channelId)
          .single();

        if (existing) {
          return new Response(JSON.stringify({ error: 'Channel already connected' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Insert channel
        const { data: channel, error: insertError } = await supabase
          .from('connected_youtube_channels')
          .insert({
            workspace_id: workspaceId,
            channel_id: channelId,
            title: snippet.title,
            description: snippet.description,
            custom_url: snippet.customUrl,
            thumbnail_url: snippet.thumbnails?.default?.url,
            subscriber_count: parseInt(statistics.subscriberCount || '0'),
            video_count: parseInt(statistics.videoCount || '0'),
            view_count: parseInt(statistics.viewCount || '0'),
            last_synced_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error('Insert channel error:', insertError);
          return new Response(JSON.stringify({ error: 'Failed to save channel' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`Connected channel: ${snippet.title} (${channelId})`);

        return new Response(JSON.stringify({ success: true, channel }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'sync': {
        if (!channelDbId || !workspaceId) {
          return new Response(JSON.stringify({ error: 'Missing channelDbId or workspaceId' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get channel from DB
        const { data: channel, error: channelError } = await supabase
          .from('connected_youtube_channels')
          .select('*')
          .eq('id', channelDbId)
          .eq('workspace_id', workspaceId)
          .single();

        if (channelError || !channel) {
          return new Response(JSON.stringify({ error: 'Channel not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Fetch videos from YouTube
        const videos = await fetchChannelVideos(channel.channel_id);
        console.log(`Fetched ${videos.length} videos for channel ${channel.title}`);

        // Upsert videos
        let insertedCount = 0;
        let updatedCount = 0;

        for (const video of videos) {
          const videoData = {
            workspace_id: workspaceId,
            channel_id: channelDbId,
            video_id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            published_at: video.snippet.publishedAt,
            thumbnails_json: video.snippet.thumbnails,
            tags: video.snippet.tags || [],
            view_count: parseInt(video.statistics?.viewCount || '0'),
            like_count: parseInt(video.statistics?.likeCount || '0'),
            comment_count: parseInt(video.statistics?.commentCount || '0'),
            duration: video.contentDetails?.duration,
            is_short: isYouTubeShort(video),
            last_synced_at: new Date().toISOString(),
          };

          // Check if video exists
          const { data: existing } = await supabase
            .from('youtube_videos')
            .select('id')
            .eq('workspace_id', workspaceId)
            .eq('video_id', video.id)
            .single();

          if (existing) {
            // Update
            await supabase
              .from('youtube_videos')
              .update(videoData)
              .eq('id', existing.id);
            updatedCount++;
          } else {
            // Insert
            await supabase
              .from('youtube_videos')
              .insert(videoData);
            insertedCount++;
          }
        }

        // Update channel last_synced_at
        await supabase
          .from('connected_youtube_channels')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', channelDbId);

        console.log(`Sync complete: ${insertedCount} inserted, ${updatedCount} updated`);

        return new Response(JSON.stringify({ 
          success: true, 
          inserted: insertedCount, 
          updated: updatedCount,
          total: videos.length 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'disconnect': {
        if (!channelDbId || !workspaceId) {
          return new Response(JSON.stringify({ error: 'Missing channelDbId or workspaceId' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error: deleteError } = await supabase
          .from('connected_youtube_channels')
          .delete()
          .eq('id', channelDbId)
          .eq('workspace_id', workspaceId);

        if (deleteError) {
          console.error('Delete channel error:', deleteError);
          return new Response(JSON.stringify({ error: 'Failed to disconnect channel' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('YouTube channel error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
