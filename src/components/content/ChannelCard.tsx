import { RefreshCw, Trash2, ExternalLink, Loader2 } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { ConnectedChannel } from '@/hooks/useContentData';

interface ChannelCardProps {
  channel: ConnectedChannel;
  onSync: (channelId: string) => Promise<boolean>;
  onDisconnect: (channelId: string) => Promise<boolean>;
  syncing: boolean;
  compact?: boolean;
}

export function ChannelCard({ channel, onSync, onDisconnect, syncing, compact }: ChannelCardProps) {
  const formatNumber = (num: number | null) => {
    if (num === null) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Compact view for header display
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-full border border-border">
        {channel.thumbnail_url ? (
          <img
            src={channel.thumbnail_url}
            alt={channel.title}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-bold">{channel.title[0]}</span>
          </div>
        )}
        <span className="text-sm font-medium truncate max-w-[120px]">{channel.title}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onSync(channel.id);
          }}
          disabled={syncing}
          className="h-6 w-6"
          title="Sync videos"
        >
          {syncing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start gap-3">
        {channel.thumbnail_url ? (
          <img
            src={channel.thumbnail_url}
            alt={channel.title}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <span className="text-lg font-bold">{channel.title[0]}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{channel.title}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {channel.custom_url || channel.channel_id}
          </p>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>{formatNumber(channel.subscriber_count)} subs</span>
            <span>{formatNumber(channel.video_count)} videos</span>
            <span>{formatNumber(channel.view_count)} views</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSync(channel.id)}
            disabled={syncing}
            className="h-8 w-8"
            title="Sync videos"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(`https://youtube.com/${channel.custom_url || `channel/${channel.channel_id}`}`, '_blank')}
            className="h-8 w-8"
            title="Open on YouTube"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDisconnect(channel.id)}
            className="h-8 w-8 text-destructive hover:text-destructive"
            title="Disconnect channel"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {channel.last_synced_at && (
        <p className="text-xs text-muted-foreground mt-3 border-t-[0.5px] border-border pt-3">
          Last synced {formatDistanceToNow(new Date(channel.last_synced_at), { addSuffix: true })}
        </p>
      )}
    </div>
  );
}
