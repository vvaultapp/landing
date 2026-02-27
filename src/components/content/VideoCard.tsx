import { useState } from 'react';
import { ExternalLink, Sparkles, Loader2, ChevronDown, ChevronUp } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { YouTubeVideo, VideoOptimization } from '@/hooks/useContentData';

interface VideoCardProps {
  video: YouTubeVideo;
  optimization?: VideoOptimization | null;
  onScore: (video: YouTubeVideo) => Promise<any>;
}

export function VideoCard({ video, optimization, onScore }: VideoCardProps) {
  const [isScoring, setIsScoring] = useState(false);
  const [showTitles, setShowTitles] = useState(false);

  const formatNumber = (num: number | null) => {
    if (num === null) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getThumbnail = () => {
    const thumbs = video.thumbnails_json as Record<string, any> | null;
    return thumbs?.medium?.url || thumbs?.default?.url || null;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-muted text-muted-foreground';
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-border';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (score >= 40) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-red-500/20 text-red-400 border-border';
  };

  const handleScore = async () => {
    setIsScoring(true);
    await onScore(video);
    setIsScoring(false);
  };

  const titlesJson = optimization?.titles_json as Record<string, string[]> | null;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {getThumbnail() ? (
          <img
            src={getThumbnail()!}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No thumbnail
          </div>
        )}
        {video.is_short && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            Short
          </Badge>
        )}
        {optimization?.score !== null && optimization?.score !== undefined && (
          <Badge className={`absolute top-2 right-2 ${getScoreColor(optimization.score)}`}>
            Score: {optimization.score}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="font-medium text-sm line-clamp-2" title={video.title}>
          {video.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatNumber(video.view_count)} views</span>
          <span>{formatNumber(video.like_count)} likes</span>
          {video.published_at && (
            <span>{formatDistanceToNow(new Date(video.published_at), { addSuffix: true })}</span>
          )}
        </div>

        {/* Score details */}
        {optimization && optimization.score !== null && (
          <div className="space-y-2 pt-2 border-t-[0.5px] border-border">
            {/* Why */}
            {Array.isArray(optimization.why_json) && optimization.why_json.length > 0 && (
              <div className="text-xs">
                <p className="text-muted-foreground mb-1">Why this score:</p>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground/80">
                  {(optimization.why_json as string[]).slice(0, 2).map((reason, i) => (
                    <li key={i} className="line-clamp-1">{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fixes */}
            {Array.isArray(optimization.fixes_json) && optimization.fixes_json.length > 0 && (
              <div className="text-xs">
                <p className="text-muted-foreground mb-1">Suggested fixes:</p>
                <ul className="list-disc list-inside space-y-0.5 text-green-400/80">
                  {(optimization.fixes_json as string[]).slice(0, 2).map((fix, i) => (
                    <li key={i} className="line-clamp-1">{fix}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Generated Titles */}
            {titlesJson && Object.keys(titlesJson).length > 0 && (
              <div className="text-xs">
                <button
                  onClick={() => setShowTitles(!showTitles)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showTitles ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showTitles ? 'Hide' : 'Show'} alternative titles
                </button>
                
                {showTitles && (
                  <div className="mt-2 space-y-2">
                    {Object.entries(titlesJson).map(([category, titles]) => (
                      <div key={category}>
                        <p className="text-muted-foreground capitalize mb-1">{category}:</p>
                        <ul className="space-y-0.5">
                          {(titles as string[]).slice(0, 3).map((title, i) => (
                            <li key={i} className="text-foreground/80 pl-2 border-l-[0.5px] border-border">
                              {title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleScore}
            disabled={isScoring}
            className="flex-1 text-xs"
          >
            {isScoring ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Scoring...
              </>
            ) : optimization?.score !== null ? (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                Re-score
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                Score Title
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(`https://youtube.com/watch?v=${video.video_id}`, '_blank')}
            className="text-xs"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
