import { useState, useEffect } from 'react';
import { X, Plus, Sparkles } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { YouTubeVideo, VideoOptimization } from '@/hooks/useContentData';

interface VideoDetailDrawerProps {
  video: YouTubeVideo | null;
  optimization: VideoOptimization | null;
  onClose: () => void;
  onScore: (video: YouTubeVideo) => Promise<any>;
  onUpdate: (video: YouTubeVideo, title: string, description: string, tags?: string[]) => Promise<{ success: boolean; error?: string; requiresReauth?: boolean }>;
  onReconnect?: () => void;
}

interface TagScore {
  tag: string;
  score: number;
}

export function VideoDetailDrawer({ video, optimization, onClose, onScore, onUpdate, onReconnect }: VideoDetailDrawerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'title' | 'description' | 'tags' | 'recreate'>('title');
  const [requiresReauth, setRequiresReauth] = useState(false);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [isLoadingTitleSuggestions, setIsLoadingTitleSuggestions] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [hasOptimizedTitle, setHasOptimizedTitle] = useState(false);
  const [hasOptimizedDescription, setHasOptimizedDescription] = useState(false);
  const [hasOptimizedTags, setHasOptimizedTags] = useState(false);
  const [optimizedByVideo, setOptimizedByVideo] = useState<Record<string, {
    title: boolean;
    description: boolean;
    tags: boolean;
    editedTitle?: string;
    editedDescription?: string;
    editedTags?: string[];
    recommendedTags?: TagScore[];
    showTitleSuggestions?: boolean;
  }>>({});
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [tagScores, setTagScores] = useState<TagScore[]>([]);
  const [recommendedTags, setRecommendedTags] = useState<TagScore[]>([]);
  const [newTag, setNewTag] = useState('');
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'title' | 'description' | 'tags' | 'recreate');
  };

  const updateOptimizedState = (videoId: string, updates: Partial<{
    title: boolean;
    description: boolean;
    tags: boolean;
    editedTitle: string;
    editedDescription: string;
    editedTags: string[];
    recommendedTags: TagScore[];
    showTitleSuggestions: boolean;
  }>) => {
    setOptimizedByVideo((prev) => ({
      ...prev,
      [videoId]: {
        title: false,
        description: false,
        tags: false,
        ...(prev[videoId] || {}),
        ...updates,
      },
    }));
  };

  // Reset edited values when video changes
  useEffect(() => {
    if (video) {
      const cached = optimizedByVideo[video.id];
      const tags = Array.isArray(video.tags) ? video.tags : [];
      const nextTitle = cached?.editedTitle ?? video.title ?? '';
      const nextDescription = cached?.editedDescription ?? video.description ?? '';
      const nextTags = cached?.editedTags ?? tags;

      setEditedTitle(nextTitle);
      setEditedDescription(nextDescription);
      setEditedTags(nextTags);
      // Generate random scores for existing tags (in production, use AI scoring)
      setTagScores(nextTags.map(tag => ({ tag, score: Math.floor(Math.random() * 40) + 30 })));
      setRecommendedTags(cached?.recommendedTags ?? []);
      setRequiresReauth(false);
      setActiveTab('title');
      setHasOptimizedTitle(!!cached?.title);
      setHasOptimizedDescription(!!cached?.description);
      setHasOptimizedTags(!!cached?.tags);
      setShowTitleSuggestions(!!cached?.showTitleSuggestions);
    }
  }, [video?.id, optimizedByVideo]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const originalTags = Array.isArray(video.tags) ? video.tags : [];
  const hasChanges =
    editedTitle !== (video.title || '') ||
    editedDescription !== (video.description || '') ||
    JSON.stringify(editedTags) !== JSON.stringify(originalTags);

  const handleSave = async () => {
    if (!video) return;
    
    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    setIsSaving(true);
    const result = await onUpdate(video, editedTitle, editedDescription, editedTags);
    setIsSaving(false);

    if (result.success) {
      toast.success('Video updated on YouTube!');
      onClose();
    } else {
      if (result.error?.includes('UPDATE_TITLE_NOT_ALLOWED_DURING_TEST_AND_COMPARE')) {
        toast.error('YouTube has an active Test & Compare. End the test in YouTube Studio, then try again.');
        return;
      }
      if (result.requiresReauth) {
        setRequiresReauth(true);
      }
      toast.error(result.error || 'Failed to update video');
    }
  };

  const handleApplyTitle = (title: string) => {
    setEditedTitle(title);
    if (video) {
      updateOptimizedState(video.id, { editedTitle: title });
    }
    toast.success('Title applied!');
  };

  const generateWithAI = async (type: 'description' | 'tags') => {
    try {
      type === 'description' ? setIsGeneratingDescription(true) : setIsGeneratingTags(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type,
          title: editedTitle,
          description: editedDescription,
          tags: editedTags,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI request failed');
      }

      const result = data.result;
      if (type === 'description' && result?.description) {
        setEditedDescription(result.description);
        setHasOptimizedDescription(true);
        if (video) {
          updateOptimizedState(video.id, {
            description: true,
            editedDescription: result.description,
          });
        }
        toast.success('Description generated!');
      }
      if (type === 'tags' && Array.isArray(result?.tags)) {
        setRecommendedTags(result.tags);
        setHasOptimizedTags(true);
        if (video) {
          updateOptimizedState(video.id, {
            tags: true,
            recommendedTags: result.tags,
          });
        }
        toast.success('Tag suggestions ready!');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('AI generation failed. Check your Claude setup.');
    } finally {
      type === 'description' ? setIsGeneratingDescription(false) : setIsGeneratingTags(false);
    }
  };

  const addTag = (tag: string, score?: number) => {
    if (!tag.trim()) return;
    if (editedTags.includes(tag.trim())) {
      toast.info('Tag already exists');
      return;
    }
    const nextTags = [...editedTags, tag.trim()];
    setEditedTags(nextTags);
    setTagScores([...tagScores, { tag: tag.trim(), score: score || Math.floor(Math.random() * 40) + 30 }]);
    setNewTag('');
    // Remove from recommended if it was there
    setRecommendedTags(recommendedTags.filter(t => t.tag !== tag.trim()));
    if (video) {
      updateOptimizedState(video.id, { editedTags: nextTags });
    }
  };

  const removeTag = (tagToRemove: string) => {
    const nextTags = editedTags.filter(tag => tag !== tagToRemove);
    setEditedTags(nextTags);
    setTagScores(tagScores.filter(t => t.tag !== tagToRemove));
    if (video) {
      updateOptimizedState(video.id, { editedTags: nextTags });
    }
  };

  const titlesJson = optimization?.titles_json as Record<string, string[]> | null;
  const suggestedTitles = titlesJson
    ? Object.values(titlesJson).flat().filter(Boolean).slice(0, 3)
    : [];
  const thumbnails = (video.thumbnails_json as Record<string, any> | null) || null;
  const thumbUrl = thumbnails?.medium?.url || thumbnails?.default?.url || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div
        className="relative w-[860px] h-[640px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] overflow-hidden rounded-[32px] shadow-2xl flex flex-col no-headline-gradient bg-black border border-border"
        style={{ backgroundColor: '#0e0e0e', opacity: 1 }}
      >
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 bg-black">
          <div className="relative z-10 px-6 pt-6 bg-black">
            <div className="flex items-center justify-between">
              <TabsList className="bg-transparent rounded-xl p-0 flex-1 justify-start gap-2 h-auto">
                <TabsTrigger
                  value="title"
                  className="h-8 px-3.5 rounded-xl bg-transparent text-[#a1a4a5] text-[13px] font-semibold tracking-[0.02em] data-[state=active]:bg-[#1b1f21] data-[state=active]:text-white data-[state=active]:shadow-none transition-colors"
                >
                  Title
                </TabsTrigger>
                <TabsTrigger
                  value="description"
                  className="h-8 px-3.5 rounded-xl bg-transparent text-[#a1a4a5] text-[13px] font-semibold tracking-[0.02em] data-[state=active]:bg-[#1b1f21] data-[state=active]:text-white data-[state=active]:shadow-none transition-colors"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="tags"
                  className="h-8 px-3.5 rounded-xl bg-transparent text-[#a1a4a5] text-[13px] font-semibold tracking-[0.02em] data-[state=active]:bg-[#1b1f21] data-[state=active]:text-white data-[state=active]:shadow-none transition-colors"
                >
                  Tags
                </TabsTrigger>
                <TabsTrigger
                  value="recreate"
                  className="h-8 px-3.5 rounded-xl bg-transparent text-[#a1a4a5] text-[13px] font-semibold tracking-[0.02em] data-[state=active]:bg-[#1b1f21] data-[state=active]:text-white data-[state=active]:shadow-none transition-colors"
                >
                  Recreate
                </TabsTrigger>
              </TabsList>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative z-10 px-6 pb-6 pt-5 overflow-y-auto flex-1 space-y-6 bg-black">
            {requiresReauth && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between gap-4">
                <div className="text-sm text-amber-200">
                  Your YouTube permissions need to be refreshed to save changes.
                </div>
                  <Button
                    size="sm"
                    className="bg-white text-black hover:bg-white/90 hover:translate-y-0"
                    onClick={() => onReconnect?.()}
                  >
                    Reconnect YouTube
                  </Button>
                </div>
            )}

            <TabsContent value="title" className="mt-2 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-[0.01em] text-white">Title</h3>
              </div>

              <div className="relative">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-[#151618] border-border text-base focus:border-border pr-20"
                  placeholder="Enter video title..."
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {editedTitle.length} of 100
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold tracking-[0.01em] text-white/60">Suggested Titles</h4>
                  <Button
                    size="icon"
                    onClick={async () => {
                      if (!video || hasOptimizedTitle) return;
                      try {
                        setIsLoadingTitleSuggestions(true);
                        if (suggestedTitles.length === 0) {
                          await onScore(video);
                        }
                        setShowTitleSuggestions(true);
                        setHasOptimizedTitle(true);
                        updateOptimizedState(video.id, {
                          title: true,
                          showTitleSuggestions: true,
                        });
                      } catch (error) {
                        toast.error('Failed to generate title suggestions.');
                      } finally {
                        setIsLoadingTitleSuggestions(false);
                      }
                    }}
                    disabled={isLoadingTitleSuggestions || hasOptimizedTitle}
                    className="h-9 w-9 rounded-full bg-[#151618] text-white border border-border hover:bg-[#1b1f21] hover:translate-y-0 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label="Show title suggestions"
                    title={hasOptimizedTitle ? 'Title suggestions ready' : 'Show title suggestions'}
                  >
                    <Sparkles className={`w-4 h-4 ${isLoadingTitleSuggestions ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[0, 1, 2].map((idx) => {
                    const title = suggestedTitles[idx];
                    return (
                      <button
                        key={`suggested-${idx}`}
                        onClick={() => title && showTitleSuggestions && handleApplyTitle(title)}
                        className="group text-left space-y-3"
                      >
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-border">
                          {thumbUrl && (
                            <img
                              src={thumbUrl}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        {showTitleSuggestions && (
                          <p className="text-sm text-white/90 line-clamp-2 px-1">
                            {title || 'Suggested title'}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="description" className="mt-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-[0.01em] text-white">Description</h3>
                <Button
                  size="icon"
                  onClick={() => generateWithAI('description')}
                  disabled={isGeneratingDescription || hasOptimizedDescription}
                  className="h-9 w-9 rounded-full bg-[#151618] text-white border border-border hover:bg-[#1b1f21] hover:translate-y-0 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Optimize description"
                  title={hasOptimizedDescription ? 'Description optimized' : 'Optimize description'}
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingDescription ? 'animate-pulse' : ''}`} />
                </Button>
              </div>

              <div className="relative">
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="bg-[#151618] border-border h-[240px] max-h-[320px] resize-none overflow-y-auto text-sm focus:border-border"
                  placeholder="Enter video description..."
                />
                <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                  {editedDescription.length} of 5000
                </span>
              </div>
            </TabsContent>

            <TabsContent value="tags" className="mt-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-[0.01em] text-white">Tags</h3>
                <Button
                  size="icon"
                  onClick={() => generateWithAI('tags')}
                  disabled={isGeneratingTags || hasOptimizedTags}
                  className="h-9 w-9 rounded-full bg-[#151618] text-white border border-border hover:bg-[#1b1f21] hover:translate-y-0 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Optimize tags"
                  title={hasOptimizedTags ? 'Tags optimized' : 'Optimize tags'}
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingTags ? 'animate-pulse' : ''}`} />
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-[#151618] border border-border space-y-3">
                <div className="flex flex-wrap gap-2">
                  {tagScores.map(({ tag, score }) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151618] border border-border text-sm"
                    >
                      <span className={`text-xs font-medium ${getScoreColor(score)}`}>{score}</span>
                      <span className="text-white/90">{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {tagScores.length === 0 && (
                    <span className="text-sm text-muted-foreground">No tags yet</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag(newTag)}
                    className="bg-[#151618] border-border text-sm"
                    placeholder="Add a tag..."
                  />
                  <Button size="sm" variant="outline" onClick={() => addTag(newTag)} className="border-border">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {recommendedTags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold tracking-[0.01em] text-white/60">Recommended</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendedTags.map(({ tag, score }) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag, score)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151618] border border-border hover:border-border text-sm transition-colors"
                      >
                        <span className={`text-xs font-medium ${getScoreColor(score)}`}>{score}</span>
                        <span className="text-white/90">{tag}</span>
                        <Plus className="w-3 h-3 text-green-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recreate" className="mt-2">
              <div className="rounded-2xl border border-border bg-[#0f0f0f] p-6">
                <h3 className="text-base font-semibold tracking-[0.01em] text-white mb-2">Recreate</h3>
                <p className="text-sm text-white/60">
                  Coming soon. This will generate similar video ideas and titles using AI.
                </p>
              </div>
            </TabsContent>
          </div>

          <div className="relative z-10 px-6 pb-6 pt-4 flex justify-end bg-black">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="bg-white text-black border border-border hover:bg-white/90 hover:translate-y-0 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save to YouTube'}
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
