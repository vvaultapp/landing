import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useYouTubeAnalytics } from '@/hooks/useYouTubeAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { Youtube, Users, Eye, PlayCircle, ThumbsUp, MessageCircle, TrendingUp, TrendingDown, RefreshCw, ExternalLink } from '@/components/ui/icons';
import { formatDistanceToNow } from 'date-fns';
import youtubeLogoImg from '@/assets/youtube-logo.png';

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function YouTubeAnalytics() {
  const { data, loading, error, requiresReauth, fetchAnalytics, hasGoogleConnection } = useYouTubeAnalytics();
  const { signInWithGoogle, signOut } = useAuth();

  useEffect(() => {
    if (hasGoogleConnection()) {
      fetchAnalytics();
    }
  }, [hasGoogleConnection, fetchAnalytics]);

  const handleReauth = async () => {
    await signOut();
    await signInWithGoogle();
  };

  if (!hasGoogleConnection()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-center mb-10 max-w-md">
          Generate video ideas, optimize titles, and track performance
        </p>

        <PremiumButton size="sm" onClick={() => signInWithGoogle()}>
          <img 
            src={youtubeLogoImg} 
            alt="YouTube" 
            className="w-5 h-5 object-contain"
          />
          Connect
        </PremiumButton>
      </div>
    );
  }

  if (loading) {
    return (
      <Card className="card-fade-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            YouTube Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-fade-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            YouTube Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            {requiresReauth ? (
              <Button onClick={handleReauth} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Reconnect YouTube
              </Button>
            ) : (
              <Button onClick={fetchAnalytics} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.channelInfo) {
    return null;
  }

  const { channelInfo, analytics, recentVideos } = data;

  return (
    <Card className="card-fade-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Youtube className="w-5 h-5 text-red-500" />
          YouTube Analytics
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={fetchAnalytics} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Info */}
        <div className="flex items-center gap-4">
          <img
            src={channelInfo.thumbnailUrl}
            alt={channelInfo.title}
            className="w-16 h-16 rounded-full"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{channelInfo.title}</h3>
            <p className="text-sm text-muted-foreground">
              {formatNumber(channelInfo.subscriberCount)} subscribers
            </p>
          </div>
          <a
            href={`https://youtube.com/channel/${channelInfo.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Channel Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{formatNumber(channelInfo.subscriberCount)}</div>
            <div className="text-xs text-muted-foreground">Subscribers</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <Eye className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{formatNumber(channelInfo.viewCount)}</div>
            <div className="text-xs text-muted-foreground">Total Views</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <PlayCircle className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{formatNumber(channelInfo.videoCount)}</div>
            <div className="text-xs text-muted-foreground">Videos</div>
          </div>
        </div>

        {/* Last 28 Days Analytics */}
        {analytics && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Last 28 Days</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">Views</span>
                </div>
                <div className="font-semibold">{formatNumber(analytics.views)}</div>
              </div>
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-xs">Likes</span>
                </div>
                <div className="font-semibold">{formatNumber(analytics.likes)}</div>
              </div>
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs">Comments</span>
                </div>
                <div className="font-semibold">{formatNumber(analytics.comments)}</div>
              </div>
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <PlayCircle className="w-4 h-4" />
                  <span className="text-xs">Avg. Duration</span>
                </div>
                <div className="font-semibold">{formatDuration(analytics.averageViewDuration)}</div>
              </div>
            </div>
            
            {/* Subscriber Change */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="w-4 h-4" />
                <span>+{formatNumber(analytics.subscribersGained)} gained</span>
              </div>
              <div className="flex items-center gap-1 text-red-500">
                <TrendingDown className="w-4 h-4" />
                <span>-{formatNumber(analytics.subscribersLost)} lost</span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Videos */}
        {recentVideos && recentVideos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Videos</h4>
            <div className="space-y-3">
              {recentVideos.map((video) => (
                <a
                  key={video.id}
                  href={`https://youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-24 h-14 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{video.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatNumber(video.views)} views</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
