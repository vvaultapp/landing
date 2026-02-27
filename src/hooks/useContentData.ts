import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';

export interface ConnectedChannel {
  id: string;
  workspace_id: string;
  channel_id: string;
  title: string;
  description: string | null;
  custom_url: string | null;
  thumbnail_url: string | null;
  subscriber_count: number | null;
  video_count: number | null;
  view_count: number | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface YouTubeVideo {
  id: string;
  workspace_id: string;
  channel_id: string;
  video_id: string;
  title: string;
  description: string | null;
  published_at: string | null;
  thumbnails_json: any;
  tags: any;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  duration: string | null;
  is_short: boolean;
  last_synced_at: string | null;
}

export interface VideoOptimization {
  id: string;
  workspace_id: string;
  video_id: string;
  score: number | null;
  why_json: any;
  fixes_json: any;
  titles_json: any;
  thumbnail_ideas_json: any;
  created_at: string;
  updated_at: string;
}

export interface AIChat {
  id: string;
  workspace_id: string;
  created_by_user_id: string;
  title: string;
  context_type: string | null;
  context_data: any;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  workspace_id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export function useContentData() {
  const { workspace } = useWorkspace();
  const [channels, setChannels] = useState<ConnectedChannel[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [optimizations, setOptimizations] = useState<VideoOptimization[]>([]);
  const [chats, setChats] = useState<AIChat[]>([]);
  const [loading, setLoading] = useState(true);

  const toNumber = (value: unknown) => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const fetchChannels = async () => {
    if (!workspace?.id) return;
    
    const { data, error } = await supabase
      .from('connected_youtube_channels')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching channels:', error);
      return;
    }

    const parsedChannels = (data || []).map((channel) => ({
      ...channel,
      subscriber_count: toNumber(channel.subscriber_count),
      video_count: toNumber(channel.video_count),
      view_count: toNumber(channel.view_count),
    }));

    setChannels(parsedChannels);
  };

  const fetchVideos = async () => {
    if (!workspace?.id) return;

    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
      return;
    }

    // Parse tags from JSON if needed
    const parsedVideos = (data || []).map(video => ({
      ...video,
      tags: Array.isArray(video.tags) ? video.tags : [],
      view_count: toNumber(video.view_count),
      like_count: toNumber(video.like_count),
      comment_count: toNumber(video.comment_count),
      is_short: typeof video.is_short === 'boolean'
        ? video.is_short
        : String(video.is_short).toLowerCase() === 'true',
    }));

    setVideos(parsedVideos);
  };

  const fetchOptimizations = async () => {
    if (!workspace?.id) return;

    const { data, error } = await supabase
      .from('video_optimizations')
      .select('*')
      .eq('workspace_id', workspace.id);

    if (error) {
      console.error('Error fetching optimizations:', error);
      return;
    }

    // Parse JSON fields
    const parsedOptimizations = (data || []).map(opt => ({
      ...opt,
      why_json: Array.isArray(opt.why_json) ? opt.why_json : [],
      fixes_json: Array.isArray(opt.fixes_json) ? opt.fixes_json : [],
      titles_json: typeof opt.titles_json === 'object' ? opt.titles_json : {},
      thumbnail_ideas_json: Array.isArray(opt.thumbnail_ideas_json) ? opt.thumbnail_ideas_json : [],
    }));

    setOptimizations(parsedOptimizations);
  };

  const fetchChats = async () => {
    if (!workspace?.id) return;

    const { data, error } = await supabase
      .from('ai_chats')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      return;
    }

    setChats(data || []);
  };

  const connectChannel = async (channelInput: string) => {
    if (!workspace?.id) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-channel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'connect',
          channelInput,
          workspaceId: workspace.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to connect channel');
        return null;
      }

      toast.success('Channel connected successfully!');
      await fetchChannels();
      return result.channel;
    } catch (error) {
      console.error('Connect channel error:', error);
      toast.error('Failed to connect channel');
      return null;
    }
  };

  // Connect channel using OAuth token (for when user returns from Google OAuth)
  const connectChannelWithOAuth = async () => {
    if (!workspace?.id) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.provider_token) {
        console.log('No provider token available');
        return null;
      }
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-channel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'connect-oauth',
          providerToken: session.provider_token,
          workspaceId: workspace.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('OAuth connect error:', result.error);
        toast.error(result.error || 'Failed to connect YouTube channel');
        return null;
      }

      if (result.alreadyConnected) {
        toast.info('YouTube channel already connected!');
      } else {
        toast.success('YouTube channel connected!');
      }
      
      await fetchChannels();
      return result.channel;
    } catch (error) {
      console.error('OAuth connect channel error:', error);
      toast.error('Failed to connect YouTube channel');
      return null;
    }
  };

  const syncChannel = async (channelDbId: string) => {
    if (!workspace?.id) return false;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-channel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'sync',
          channelDbId,
          workspaceId: workspace.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to sync videos');
        return false;
      }

      toast.success(`Synced ${result.total} videos!`);
      await fetchVideos();
      await fetchChannels();
      return true;
    } catch (error) {
      console.error('Sync channel error:', error);
      toast.error('Failed to sync videos');
      return false;
    }
  };

  const disconnectChannel = async (channelDbId: string) => {
    if (!workspace?.id) return false;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-channel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'disconnect',
          channelDbId,
          workspaceId: workspace.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to disconnect channel');
        return false;
      }

      toast.success('Channel disconnected');
      await fetchChannels();
      await fetchVideos();
      return true;
    } catch (error) {
      console.error('Disconnect channel error:', error);
      toast.error('Failed to disconnect channel');
      return false;
    }
  };

  const scoreVideo = async (video: YouTubeVideo) => {
    if (!workspace?.id) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const channel = channels.find(c => c.id === video.channel_id);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/score-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          videoId: video.id,
          workspaceId: workspace.id,
          title: video.title,
          description: video.description,
          tags: video.tags,
          channelContext: channel,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to score video');
        return null;
      }

      if (result.cached) {
        toast.info('Using cached score');
      } else {
        toast.success('Video scored!');
      }

      await fetchOptimizations();
      return result.optimization;
    } catch (error) {
      console.error('Score video error:', error);
      toast.error('Failed to score video');
      return null;
    }
  };

  const updateVideo = async (video: YouTubeVideo, newTitle: string, newDescription: string, newTags?: string[]) => {
    if (!workspace?.id) return { success: false, error: 'No workspace' };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.provider_token) {
        return { 
          success: false, 
          error: 'YouTube access expired. Please reconnect your account.',
          requiresReauth: true 
        };
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-youtube-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          youtubeVideoId: video.video_id,
          dbVideoId: video.id,
          workspaceId: workspace.id,
          title: newTitle,
          description: newDescription,
          tags: newTags,
          providerToken: session.provider_token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorText = typeof result?.error === 'string' ? result.error : '';
        if (errorText.includes('UPDATE_TITLE_NOT_ALLOWED_DURING_TEST_AND_COMPARE')) {
          return {
            success: false,
            error: 'YouTube has an active Test & Compare on this video. End the test in YouTube Studio, then try again.',
          };
        }
        if (result.requiresReauth) {
          return { success: false, error: result.error, requiresReauth: true };
        }
        return { success: false, error: result.error || 'Failed to update video' };
      }

      await fetchVideos();
      return { success: true, video: result.video };
    } catch (error) {
      console.error('Update video error:', error);
      return { success: false, error: 'Failed to update video' };
    }
  };

  const createChat = async (title: string = 'New Chat', contextType?: string) => {
    if (!workspace?.id) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('ai_chats')
      .insert({
        workspace_id: workspace.id,
        created_by_user_id: user.id,
        title,
        context_type: contextType,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
      return null;
    }

    await fetchChats();
    return data;
  };

  const deleteChat = async (chatId: string) => {
    const { error } = await supabase
      .from('ai_chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
      return false;
    }

    await fetchChats();
    return true;
  };

  const updateChatTitle = async (chatId: string, title: string) => {
    const { error } = await supabase
      .from('ai_chats')
      .update({ title })
      .eq('id', chatId);

    if (error) {
      console.error('Error updating chat:', error);
      return false;
    }

    await fetchChats();
    return true;
  };

  useEffect(() => {
    if (!workspace?.id) {
      setChannels([]);
      setVideos([]);
      setOptimizations([]);
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      fetchChannels(),
      fetchVideos(),
      fetchOptimizations(),
      fetchChats(),
    ]).finally(() => setLoading(false));
  }, [workspace?.id]);

  return {
    channels,
    videos,
    optimizations,
    chats,
    loading,
    connectChannel,
    connectChannelWithOAuth,
    syncChannel,
    disconnectChannel,
    scoreVideo,
    updateVideo,
    createChat,
    deleteChat,
    updateChatTitle,
    refetchChannels: fetchChannels,
    refetchVideos: fetchVideos,
    refetchOptimizations: fetchOptimizations,
    refetchChats: fetchChats,
  };
}
