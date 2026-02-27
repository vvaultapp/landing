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
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { youtubeVideoId, title, description, tags, workspaceId, dbVideoId, providerToken } = body;

    // Use provider token from request body (passed from client)
    if (!providerToken) {
      console.error('No provider token in request body');
      return new Response(JSON.stringify({ 
        error: 'YouTube access expired. Please reconnect your YouTube account.',
        requiresReauth: true 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!youtubeVideoId || !title) {
      return new Response(JSON.stringify({ error: 'Missing required fields: youtubeVideoId, title' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Updating YouTube video: ${youtubeVideoId} in workspace ${workspaceId}`);

    // First, get current video details to preserve categoryId and other required fields
    const getVideoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${youtubeVideoId}`;
    const getResponse = await fetch(getVideoUrl, {
      headers: {
        'Authorization': `Bearer ${providerToken}`,
      },
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error('Failed to fetch video details:', getResponse.status, errorText);
      
      if (getResponse.status === 401 || getResponse.status === 403) {
        return new Response(JSON.stringify({ 
          error: 'YouTube access denied. Please reconnect your YouTube account.',
          requiresReauth: true 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Failed to fetch video details from YouTube' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const getResult = await getResponse.json();
    const currentVideo = getResult.items?.[0];

    if (!currentVideo) {
      return new Response(JSON.stringify({ error: 'Video not found on YouTube' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare tags array - use new tags if provided, otherwise keep existing
    const videoTags = tags !== undefined 
      ? (Array.isArray(tags) ? tags : [])
      : (currentVideo.snippet.tags || []);

    // Update the video with new title, description, and tags
    const updateUrl = 'https://www.googleapis.com/youtube/v3/videos?part=snippet';
    const updatePayload = {
      id: youtubeVideoId,
      snippet: {
        categoryId: currentVideo.snippet.categoryId,
        title: title,
        description: description !== undefined ? description : (currentVideo.snippet.description || ''),
        tags: videoTags,
      },
    };

    console.log('Update payload:', JSON.stringify(updatePayload));

    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${providerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('YouTube API update error:', updateResponse.status, errorText);
      
      if (updateResponse.status === 401 || updateResponse.status === 403) {
        return new Response(JSON.stringify({ 
          error: 'YouTube access denied. You may need to reconnect or verify channel ownership.',
          requiresReauth: true 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: `YouTube API error: ${errorText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const updatedVideo = await updateResponse.json();
    console.log('Video updated successfully:', updatedVideo.id);

    // Update local database record
    if (dbVideoId && workspaceId) {
      const { error: dbError } = await supabase
        .from('youtube_videos')
        .update({
          title: title,
          description: description || null,
          tags: videoTags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dbVideoId)
        .eq('workspace_id', workspaceId);

      if (dbError) {
        console.error('Failed to update local DB:', dbError);
        // Don't fail the request - YouTube was already updated
      } else {
        console.log('Local DB updated for video:', dbVideoId);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      video: {
        id: updatedVideo.id,
        title: updatedVideo.snippet.title,
        description: updatedVideo.snippet.description,
        tags: updatedVideo.snippet.tags || [],
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Update video error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
