-- Create table for connected YouTube channels (workspace scoped)
CREATE TABLE public.connected_youtube_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  custom_url TEXT,
  thumbnail_url TEXT,
  subscriber_count BIGINT,
  video_count BIGINT,
  view_count BIGINT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, channel_id)
);

-- Create table for YouTube videos (workspace scoped)
CREATE TABLE public.youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.connected_youtube_channels(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  thumbnails_json JSONB DEFAULT '{}'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  duration TEXT,
  is_short BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, video_id)
);

-- Create table for video optimizations (AI-generated scores and suggestions)
CREATE TABLE public.video_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  why_json JSONB DEFAULT '[]'::jsonb,
  fixes_json JSONB DEFAULT '[]'::jsonb,
  titles_json JSONB DEFAULT '{}'::jsonb,
  thumbnail_ideas_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI chats (workspace scoped)
CREATE TABLE public.ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  context_type TEXT,
  context_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI messages
CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  chat_id UUID NOT NULL REFERENCES public.ai_chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.connected_youtube_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connected_youtube_channels
CREATE POLICY "Members can view workspace channels"
  ON public.connected_youtube_channels FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can connect channels"
  ON public.connected_youtube_channels FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Owners can update channels"
  ON public.connected_youtube_channels FOR UPDATE
  USING (is_workspace_owner(workspace_id));

CREATE POLICY "Owners can disconnect channels"
  ON public.connected_youtube_channels FOR DELETE
  USING (is_workspace_owner(workspace_id));

-- RLS Policies for youtube_videos
CREATE POLICY "Members can view workspace videos"
  ON public.youtube_videos FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can insert videos"
  ON public.youtube_videos FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Members can update videos"
  ON public.youtube_videos FOR UPDATE
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Owners can delete videos"
  ON public.youtube_videos FOR DELETE
  USING (is_workspace_owner(workspace_id));

-- RLS Policies for video_optimizations
CREATE POLICY "Members can view optimizations"
  ON public.video_optimizations FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create optimizations"
  ON public.video_optimizations FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Members can update optimizations"
  ON public.video_optimizations FOR UPDATE
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Owners can delete optimizations"
  ON public.video_optimizations FOR DELETE
  USING (is_workspace_owner(workspace_id));

-- RLS Policies for ai_chats
CREATE POLICY "Members can view workspace chats"
  ON public.ai_chats FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create chats"
  ON public.ai_chats FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id) AND created_by_user_id = auth.uid());

CREATE POLICY "Members can update their chats"
  ON public.ai_chats FOR UPDATE
  USING (is_workspace_member(workspace_id) AND created_by_user_id = auth.uid());

CREATE POLICY "Chat creators can delete"
  ON public.ai_chats FOR DELETE
  USING (created_by_user_id = auth.uid() OR is_workspace_owner(workspace_id));

-- RLS Policies for ai_messages
CREATE POLICY "Members can view workspace messages"
  ON public.ai_messages FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create messages"
  ON public.ai_messages FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "No message updates"
  ON public.ai_messages FOR UPDATE
  USING (false);

CREATE POLICY "Chat owners can delete messages"
  ON public.ai_messages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.ai_chats 
    WHERE id = ai_messages.chat_id 
    AND (created_by_user_id = auth.uid() OR is_workspace_owner(workspace_id))
  ));

-- Create indexes for performance
CREATE INDEX idx_youtube_channels_workspace ON public.connected_youtube_channels(workspace_id);
CREATE INDEX idx_youtube_videos_workspace ON public.youtube_videos(workspace_id);
CREATE INDEX idx_youtube_videos_channel ON public.youtube_videos(channel_id);
CREATE INDEX idx_youtube_videos_is_short ON public.youtube_videos(is_short);
CREATE INDEX idx_video_optimizations_video ON public.video_optimizations(video_id);
CREATE INDEX idx_ai_chats_workspace ON public.ai_chats(workspace_id);
CREATE INDEX idx_ai_chats_user ON public.ai_chats(created_by_user_id);
CREATE INDEX idx_ai_messages_chat ON public.ai_messages(chat_id);

-- Create updated_at triggers
CREATE TRIGGER update_connected_youtube_channels_updated_at
  BEFORE UPDATE ON public.connected_youtube_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_youtube_videos_updated_at
  BEFORE UPDATE ON public.youtube_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_optimizations_updated_at
  BEFORE UPDATE ON public.video_optimizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_chats_updated_at
  BEFORE UPDATE ON public.ai_chats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();