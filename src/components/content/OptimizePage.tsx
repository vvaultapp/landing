import { useState, useMemo } from 'react';
import { Search, Plus, RefreshCw } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoCard } from './VideoCard';
import { ChannelCard } from './ChannelCard';
import { ConnectChannelDialog } from './ConnectChannelDialog';
import type { ConnectedChannel, YouTubeVideo, VideoOptimization } from '@/hooks/useContentData';
import youtubeLogoImg from '@/assets/youtube-logo.png';

interface OptimizePageProps {
  channels: ConnectedChannel[];
  videos: YouTubeVideo[];
  optimizations: VideoOptimization[];
  onConnectChannel: (input: string) => Promise<any>;
  onSyncChannel: (channelId: string) => Promise<boolean>;
  onDisconnectChannel: (channelId: string) => Promise<boolean>;
  onScoreVideo: (video: YouTubeVideo) => Promise<any>;
}

export function OptimizePage({
  channels,
  videos,
  optimizations,
  onConnectChannel,
  onSyncChannel,
  onDisconnectChannel,
  onScoreVideo,
}: OptimizePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'videos' | 'shorts'>('videos');
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [syncingChannelId, setSyncingChannelId] = useState<string | null>(null);

  const filteredVideos = useMemo(() => {
    let filtered = videos;
    
    // Filter by type
    if (activeTab === 'shorts') {
      filtered = filtered.filter(v => v.is_short);
    } else {
      filtered = filtered.filter(v => !v.is_short);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [videos, activeTab, searchQuery]);

  const getOptimization = (videoId: string) => {
    return optimizations.find(o => o.video_id === videoId) || null;
  };

  const handleSync = async (channelId: string): Promise<boolean> => {
    setSyncingChannelId(channelId);
    const result = await onSyncChannel(channelId);
    setSyncingChannelId(null);
    return result;
  };

  const videoCount = videos.filter(v => !v.is_short).length;
  const shortCount = videos.filter(v => v.is_short).length;

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-center mb-10 max-w-md">
          Generate video ideas, optimize titles, and track performance
        </p>

        <PremiumButton size="sm" onClick={() => setConnectDialogOpen(true)}>
          <img 
            src={youtubeLogoImg} 
            alt="YouTube" 
            className="w-5 h-5 object-contain"
          />
          Connect
        </PremiumButton>
        
        <ConnectChannelDialog
          open={connectDialogOpen}
          onOpenChange={setConnectDialogOpen}
          onConnect={onConnectChannel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connected Channels */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Connected Channels</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConnectDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Channel
          </Button>
        </div>
        
        <div className="grid gap-3">
          {channels.map(channel => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onSync={handleSync}
              onDisconnect={onDisconnectChannel}
              syncing={syncingChannelId === channel.id}
            />
          ))}
        </div>
      </div>

      {/* Videos Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'videos' | 'shorts')} className="flex-1">
            <TabsList className="bg-muted">
              <TabsTrigger value="videos">Videos ({videoCount})</TabsTrigger>
              <TabsTrigger value="shorts">Shorts ({shortCount})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 input-fade-border bg-transparent"
            />
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>No videos synced yet.</p>
            <p className="text-sm">Click the sync button on your channel to fetch videos.</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>No {activeTab} found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                optimization={getOptimization(video.id)}
                onScore={onScoreVideo}
              />
            ))}
          </div>
        )}
      </div>

      <ConnectChannelDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        onConnect={onConnectChannel}
      />
    </div>
  );
}
