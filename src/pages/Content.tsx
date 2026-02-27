import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Check, Download, Eye, Link2, LinkChain, MessageCircle, RefreshCw, Search, ThumbsUp, Trash2, Youtube } from '@/components/ui/icons';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useContentRoi, type RoiTimeRange, type RoiTrackedLink, type RoiVideoRow } from '@/hooks/useContentRoi';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const VIDEOS_PER_PAGE = 10;

function formatCompactNumber(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  } catch {
    return String(n);
  }
}

function formatRelative(iso: string | null) {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '—';
  const ms = Date.now() - t;
  if (ms < 60_000) return 'just now';
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function toPercent(n: number) {
  if (!Number.isFinite(n) || n <= 0) return '0%';
  return `${(n * 100).toFixed(n >= 0.1 ? 1 : 2)}%`;
}

function randomSlug(len = 8) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function isDuplicateSlugError(err: any) {
  const msg = `${String(err?.message || '')} ${String(err?.details || '')}`.toLowerCase();
  return msg.includes('duplicate') || msg.includes('unique') || msg.includes('slug');
}

function isUniqueConstraintError(err: any) {
  const msg = `${String(err?.message || '')} ${String(err?.details || '')} ${String(err?.code || '')}`.toLowerCase();
  return msg.includes('23505') || msg.includes('duplicate') || msg.includes('unique');
}

function pickYoutubeThumb(thumbnails: any): string | null {
  const t = thumbnails || {};
  return t?.maxres?.url || t?.standard?.url || t?.high?.url || t?.medium?.url || t?.default?.url || null;
}

export default function Content() {
  const { workspace } = useWorkspace();
  const {
    timeRange,
    setTimeRange,
    loading,
    refreshing,
    refresh,
    bookingUrl,
    youtubeChannels,
    youtubeHasAny,
    videoRows,
    chartMeta,
    chartData,
    kpis,
  } = useContentRoi();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'published' | 'views' | 'clicks'>('published');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const autoSyncRanRef = useRef(false);
  const syncingRef = useRef(false);

  const [bulkMode, setBulkMode] = useState<'create' | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; label: string } | null>(null);
  const [creatingCtaVideoId, setCreatingCtaVideoId] = useState<string | null>(null);
  const [ctaToDelete, setCtaToDelete] = useState<{ ctaId: string; title: string } | null>(null);
  const [copiedCtaVideoId, setCopiedCtaVideoId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const copyResetTimeoutRef = useRef<number | null>(null);

  const timePills: Array<{ key: RoiTimeRange; label: string }> = [
    { key: '7d', label: '7d' },
    { key: '30d', label: '30d' },
    { key: '90d', label: '90d' },
    { key: 'all', label: 'All' },
  ];

  const connectYouTube = useCallback(async () => {
    const oauthPayload = {
      provider: 'google' as const,
      options: {
        redirectTo: `${window.location.origin}/youtube-callback`,
        scopes: 'https://www.googleapis.com/auth/youtube.force-ssl',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: 'true',
        },
      },
    };

    try {
      const { error } = await supabase.auth.signInWithOAuth(oauthPayload);
      if (error) throw error;
      // Browser will redirect.
    } catch (e: any) {
      const raw = String(e?.message || '').toLowerCase();
      if (raw.includes('manual linking disabled')) {
        try {
          // Force a fresh OAuth sign-in flow when this project disallows identity-link mode.
          await supabase.auth.signOut();
          const { error: retryError } = await supabase.auth.signInWithOAuth(oauthPayload);
          if (retryError) throw retryError;
          return;
        } catch (retryErr: any) {
          toast.error(String(retryErr?.message || 'Failed to connect YouTube'));
          return;
        }
      }
      toast.error(String(e?.message || 'Failed to connect YouTube'));
    }
  }, []);

  const syncChannels = useCallback(
    async (opts?: { silent?: boolean; onlyChannelIds?: string[] }) => {
      const wsId = workspace?.id ? String(workspace.id) : '';
      if (!wsId) return;
      if (!youtubeHasAny) return;
      if (syncingRef.current) return;

      const silent = Boolean(opts?.silent);
      const channelIds = (opts?.onlyChannelIds || youtubeChannels.map((c) => String(c.id))).filter(Boolean);
      if (channelIds.length === 0) return;

      syncingRef.current = true;
      setSyncing(true);
      setSyncNote('Syncing…');
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token ? String(sessionData.session.access_token) : '';
        if (!token) throw new Error('Please sign in again');

        let okCount = 0;
        for (const channelDbId of channelIds) {
          let channelOk = false;
          for (let attempt = 0; attempt < 2; attempt += 1) {
            const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-channel`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ action: 'sync', channelDbId, workspaceId: wsId }),
            });
            const payload = await resp.json().catch(() => ({}));
            if (resp.ok) {
              channelOk = true;
              break;
            }
            console.warn('YouTube sync failed:', payload);
            if (attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 700));
            }
          }
          if (channelOk) okCount += 1;
        }

        localStorage.setItem(`acq_content_last_sync_${wsId}`, String(Date.now()));

        await refresh({ silent: true });

        if (!silent) {
          if (okCount > 0) toast.success('YouTube synced');
          else toast.error('Sync failed');
        }
        setSyncNote(okCount > 0 ? 'Synced just now' : 'Sync failed');
      } catch (e: any) {
        if (!silent) toast.error(String(e?.message || 'Failed to sync YouTube'));
        setSyncNote('Sync failed');
      } finally {
        syncingRef.current = false;
        setSyncing(false);
        // Keep the note visible; it will update next time we sync.
      }
    },
    [workspace?.id, youtubeHasAny, youtubeChannels, refresh],
  );

  useEffect(() => {
    autoSyncRanRef.current = false;
    setSyncNote(null);
  }, [workspace?.id]);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const wsId = workspace?.id ? String(workspace.id) : '';
    if (!wsId) return;
    if (!youtubeHasAny) return;
    if (youtubeChannels.length === 0) return;
    if (autoSyncRanRef.current) return;

    const lastLocal = Number(localStorage.getItem(`acq_content_last_sync_${wsId}`) || '0');
    if (lastLocal && Date.now() - lastLocal < 5 * 60_000) return;

    const thresholdMs = 60 * 60_000; // 60 minutes
    const needs = youtubeChannels.some((ch) => {
      const t = ch.last_synced_at ? Date.parse(ch.last_synced_at) : 0;
      if (!t || !Number.isFinite(t)) return true;
      return Date.now() - t > thresholdMs;
    });

    if (!needs) return;
    autoSyncRanRef.current = true;
    syncChannels({ silent: true }).catch(() => {});
  }, [workspace?.id, youtubeHasAny, youtubeChannels, syncChannels]);

  useEffect(() => {
    const wsId = workspace?.id ? String(workspace.id) : '';
    if (!wsId) return;

    const refreshSilently = () => refresh({ silent: true }).catch(() => {});

    const onFocus = () => {
      refreshSilently();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshSilently();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshSilently();
    }, 60_000);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(interval);
    };
  }, [workspace?.id, refresh]);

  useEffect(() => {
    const wsId = workspace?.id ? String(workspace.id) : '';
    if (!wsId) return;
    if (!youtubeHasAny) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      syncChannels({ silent: true }).catch(() => {});
    }, 15 * 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [workspace?.id, youtubeHasAny, syncChannels]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = q ? videoRows.filter((r) => String(r.video.title || '').toLowerCase().includes(q)) : videoRows;

    const dir = sortDir === 'asc' ? 1 : -1;
    const sorted = [...rows].sort((a, b) => {
      if (sortKey === 'views') return dir * (Number(a.video.view_count || 0) - Number(b.video.view_count || 0));
      if (sortKey === 'clicks') return dir * (Number(a.clicks_range || 0) - Number(b.clicks_range || 0));
      // published
      const ap = a.video.published_at ? Date.parse(a.video.published_at) : 0;
      const bp = b.video.published_at ? Date.parse(b.video.published_at) : 0;
      return dir * (ap - bp);
    });

    return sorted;
  }, [videoRows, search, sortKey, sortDir]);

  const missingCtas = useMemo(() => filteredRows.filter((r) => !r.cta), [filteredRows]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredRows.length / VIDEOS_PER_PAGE)), [filteredRows.length]);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * VIDEOS_PER_PAGE;
    return filteredRows.slice(start, start + VIDEOS_PER_PAGE);
  }, [filteredRows, currentPage]);
  const pageStart = useMemo(() => (filteredRows.length ? (currentPage - 1) * VIDEOS_PER_PAGE + 1 : 0), [filteredRows.length, currentPage]);
  const pageEnd = useMemo(() => Math.min(currentPage * VIDEOS_PER_PAGE, filteredRows.length), [currentPage, filteredRows.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, timeRange, sortKey, sortDir]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const toggleSort = useCallback((key: typeof sortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  }, [sortKey]);

  const exportCsv = useCallback(() => {
    if (filteredRows.length === 0) {
      toast.info('No rows to export');
      return;
    }

    const cols = [
      'video_id',
      'title',
      'published_at',
      'views',
      'likes',
      'comments',
      'cta_short_url',
      'cta_destination_url',
      'clicks_range',
      'clicks_all_time',
      'ctr',
      'cta_in_description',
    ];

    const escape = (v: any) => {
      const s = String(v ?? '');
      if (s.includes('"') || s.includes(',') || s.includes('\n')) return `"${s.replaceAll('"', '""')}"`;
      return s;
    };

    const lines = [
      cols.join(','),
      ...filteredRows.map((r) =>
        [
          r.video.video_id,
          r.video.title,
          r.video.published_at || '',
          Number(r.video.view_count || 0),
          Number(r.video.like_count || 0),
          Number(r.video.comment_count || 0),
          r.short_url || '',
          r.link?.destination_url || '',
          Number(r.clicks_range || 0),
          Number(r.clicks_all_time || 0),
          toPercent(Number(r.ctr || 0)),
          r.cta_in_description ? 'yes' : 'no',
        ].map(escape).join(','),
      ),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-youtube-roi-${timeRange}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  }, [filteredRows, timeRange]);

  const bulkCreateMissing = useCallback(async () => {
    const wsId = workspace?.id ? String(workspace.id) : '';
    if (!wsId) return;
    if (missingCtas.length === 0) return;

    const destDefault = String(bookingUrl || '').trim();
    if (!destDefault) {
      toast.error('Set your booking URL in Settings to bulk-create CTAs.');
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id ? String(sessionData.session.user.id) : '';
    if (!userId) {
      toast.error('Please sign in again');
      return;
    }

    setBulkMode('create');
    setBulkProgress({ current: 0, total: missingCtas.length, label: 'Creating CTAs…' });

    let created = 0;
    try {
      for (let i = 0; i < missingCtas.length; i += 1) {
        const r = missingCtas[i];
        setBulkProgress({ current: i, total: missingCtas.length, label: `Creating CTA ${i + 1}/${missingCtas.length}` });

        // Create tracked link
        let inserted: RoiTrackedLink | null = null;
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const slug = randomSlug(8);
          const { data, error } = await (supabase as any)
            .from('tracked_links')
            .insert({
              workspace_id: wsId,
              created_by: userId,
              name: String(r.video.title || '').trim().slice(0, 140) || 'CTA link',
              slug,
              destination_url: destDefault,
              mode: 'redirect',
              utm_params: { created_for: 'content_youtube', source_type: 'youtube_video', source_ref: r.video.video_id },
            })
            .select('id,workspace_id,name,slug,destination_url,mode,archived,clicks_total,last_clicked_at,created_at')
            .maybeSingle();

          if (!error && data?.id) {
            inserted = data as RoiTrackedLink;
            break;
          }
          if (!isDuplicateSlugError(error)) break;
        }

        if (!inserted) continue;

        // Map CTA
        const { error: mapError } = await (supabase as any).from('content_ctas').insert({
          workspace_id: wsId,
          source_type: 'youtube_video',
          source_ref: r.video.video_id,
          tracked_link_id: inserted.id,
        });
        if (mapError) {
          await (supabase as any).from('tracked_links').delete().eq('workspace_id', wsId).eq('id', inserted.id);
          if (isUniqueConstraintError(mapError)) {
            continue;
          }
          continue;
        }

        created += 1;
      }
    } finally {
      setBulkProgress(null);
      setBulkMode(null);
    }

    if (created > 0) {
      toast.success(`Created ${created} CTA${created === 1 ? '' : 's'}`);
      await refresh({ silent: true });
    } else {
      toast.error('No CTAs created');
    }
  }, [workspace?.id, bookingUrl, missingCtas, refresh]);

  const createCtaForVideo = useCallback(async (row: RoiVideoRow) => {
    if (row.cta) {
      toast.info('CTA already exists for this video.');
      return;
    }

    const wsId = workspace?.id ? String(workspace.id) : '';
    if (!wsId) return;

    const destination = String(bookingUrl || '').trim();
    if (!destination) {
      toast.error('Set your booking URL in Settings first.');
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id ? String(sessionData.session.user.id) : '';
    if (!userId) {
      toast.error('Please sign in again');
      return;
    }

    setCreatingCtaVideoId(row.video.video_id);
    try {
      let inserted: RoiTrackedLink | null = null;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const slug = randomSlug(8);
        const { data, error } = await (supabase as any)
          .from('tracked_links')
          .insert({
            workspace_id: wsId,
            created_by: userId,
            name: String(row.video.title || '').trim().slice(0, 140) || 'CTA link',
            slug,
            destination_url: destination,
            mode: 'redirect',
            utm_params: {
              created_for: 'content_youtube',
              source_type: 'youtube_video',
              source_ref: row.video.video_id,
            },
          })
          .select('id,workspace_id,name,slug,destination_url,mode,archived,clicks_total,last_clicked_at,created_at')
          .maybeSingle();

        if (!error && data?.id) {
          inserted = data as RoiTrackedLink;
          break;
        }
        if (!isDuplicateSlugError(error)) break;
      }

      if (!inserted) {
        toast.error('Failed to create CTA');
        return;
      }

      const { error: mapError } = await (supabase as any).from('content_ctas').insert({
        workspace_id: wsId,
        source_type: 'youtube_video',
        source_ref: row.video.video_id,
        tracked_link_id: inserted.id,
      });

      if (mapError) {
        await (supabase as any).from('tracked_links').delete().eq('workspace_id', wsId).eq('id', inserted.id);
        if (isUniqueConstraintError(mapError)) {
          toast.info('CTA already exists for this video.');
          await refresh({ silent: true });
          return;
        }
        throw mapError;
      }

      toast.success('CTA created');
      await refresh({ silent: true });
    } catch (e: any) {
      toast.error(String(e?.message || 'Failed to create CTA'));
    } finally {
      setCreatingCtaVideoId(null);
    }
  }, [workspace?.id, bookingUrl, refresh]);

  const copyCtaForVideo = useCallback(async (row: RoiVideoRow) => {
    if (!row.short_url) {
      toast.error('No CTA link found for this video.');
      return;
    }
    try {
      await navigator.clipboard.writeText(row.short_url);
      setCopiedCtaVideoId(row.video.video_id);
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
      copyResetTimeoutRef.current = window.setTimeout(() => {
        setCopiedCtaVideoId((prev) => (prev === row.video.video_id ? null : prev));
      }, 2000);
      toast.success('CTA link copied');
    } catch {
      toast.error('Failed to copy CTA link');
    }
  }, []);

  const deleteCtaMappingById = useCallback(async (ctaId: string) => {
    const wsId = workspace?.id ? String(workspace.id) : '';
    if (!wsId || !ctaId) return;
    try {
      const { error } = await (supabase as any)
        .from('content_ctas')
        .delete()
        .eq('workspace_id', wsId)
        .eq('id', ctaId);
      if (error) throw error;
      toast.success('CTA mapping deleted');
      await refresh({ silent: true });
    } catch (e: any) {
      toast.error(String(e?.message || 'Failed to delete CTA mapping'));
    }
  }, [workspace?.id, refresh]);

  const topCtrRow = useMemo(() => {
    const rows = videoRows.filter((r) => Number(r.video.view_count || 0) > 0 && Number(r.clicks_range || 0) > 0);
    rows.sort((a, b) => Number(b.ctr || 0) - Number(a.ctr || 0));
    return rows[0] || null;
  }, [videoRows]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="headline-domaine text-[36px] font-normal">Content</h1>
              <div className="mt-1 text-sm text-white/45">YouTube ROI + CTA control.</div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-3xl border border-white/10 bg-black p-6">
                <Skeleton className="h-4 w-24 bg-white/5" />
                <Skeleton className="mt-4 h-10 w-28 bg-white/5" />
                <Skeleton className="mt-3 h-3 w-32 bg-white/5" />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black p-6">
            <Skeleton className="h-5 w-44 bg-white/5" />
            <Skeleton className="mt-5 h-[260px] w-full bg-white/5" />
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black p-6">
            <Skeleton className="h-5 w-40 bg-white/5" />
            <Skeleton className="mt-4 h-[420px] w-full bg-white/5" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="headline-domaine text-[36px] font-normal">Content</h1>
            <div className="mt-1 text-sm text-white/45">YouTube ROI + CTA control.</div>
            <div className="mt-2 text-xs text-white/40">
              {syncNote ? syncNote : youtubeHasAny ? `Last synced: ${formatRelative(youtubeChannels[0]?.last_synced_at || null)}` : 'Connect YouTube to begin.'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={exportCsv}
              title="Export CSV"
              aria-label="Export CSV"
              className="mr-1 h-8 w-8 rounded-xl border-0 bg-white/8 text-white hover:bg-white/24 hover:text-white"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => syncChannels()}
              disabled={!youtubeHasAny || syncing}
              className="h-8 gap-2 rounded-xl border-0 bg-white px-3.5 text-black hover:bg-white/90"
            >
              <RefreshCw className="h-4 w-4" />
              Sync
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="-ml-2 flex items-center gap-2">
            {timePills.map((p) => (
              <Pill key={p.key} active={timeRange === p.key} onClick={() => setTimeRange(p.key)}>
                {p.label}
              </Pill>
            ))}
          </div>

          <div className="w-full sm:w-[360px] relative">
            <Search className="h-4 w-4 text-white/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos by title…"
              className="bg-transparent border-white/10 rounded-2xl h-10 pl-9"
            />
          </div>
        </div>

        {/* Booking URL hint */}
        {!bookingUrl ? (
          <div className="mt-4 rounded-3xl border border-white/10 bg-black/50 px-5 py-4 text-sm text-white/55">
            Set your <span className="text-white/80 font-semibold">booking URL</span> in Settings to speed up CTA creation (it becomes the default destination).
          </div>
        ) : null}

        {/* KPIs */}
        <div className="mt-7 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total clicks" value={formatCompactNumber(kpis.totalClicks)} meta={timeRange === 'all' ? 'All time' : chartMeta.label} />
          <StatCard title="Clicks / day" value={kpis.avgPerDay ? kpis.avgPerDay.toFixed(1) : '0'} meta={timeRange === 'all' ? 'Avg since first CTA' : chartMeta.label} />
          <StatCard
            title="CTA coverage"
            value={`${kpis.ctaCoverage.withCta}/${kpis.ctaCoverage.totalVideos}`}
            meta="Videos with a CTA"
          />
          <StatCard
            title="Top video (CTR)"
            value={topCtrRow ? toPercent(topCtrRow.ctr) : '—'}
            meta={topCtrRow ? topCtrRow.video.title : 'No data yet'}
          />
        </div>

        {/* Chart */}
        <Card className="mt-6 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white/85">Daily clicks</div>
              <div className="mt-1 text-xs text-white/45">{chartMeta.label}</div>
            </div>
          </div>
          <div className="mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="roiClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                  minTickGap={18}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} width={32} />
                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                  contentStyle={{
                    background: 'rgba(0,0,0,0.92)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 16,
                    boxShadow: '0 18px 55px rgba(0,0,0,0.5)',
                  }}
                  labelStyle={{ color: 'rgba(255,255,255,0.75)' }}
                  itemStyle={{ color: 'rgba(255,255,255,0.9)' }}
                  formatter={(value: any) => [value, 'Clicks']}
                />
                <Area type="monotone" dataKey="clicks" stroke="#60a5fa" strokeWidth={2} fill="url(#roiClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Videos */}
        <Card className="mt-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white/85">Videos</div>
              <div className="mt-1 text-xs text-white/45">
                {youtubeHasAny ? `${filteredRows.length} videos • ${missingCtas.length} missing CTA` : 'Connect YouTube to see videos.'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
                disabled={bulkMode !== null || missingCtas.length === 0}
                onClick={bulkCreateMissing}
              >
                <Link2 className="h-4 w-4" />
                Create CTAs for missing
              </Button>
            </div>
          </div>

          {bulkProgress ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/65">
              {bulkProgress.label}
              <span className="ml-2 text-white/45">
                ({bulkProgress.current}/{bulkProgress.total})
              </span>
            </div>
          ) : null}

          {!youtubeHasAny ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-black/50 p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl border border-white/10 bg-black flex items-center justify-center">
                  <Youtube className="h-5 w-5 text-white/70" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white/85">Connect YouTube</div>
                  <div className="mt-1 text-xs text-white/45">Connect your channel to import videos and manage CTAs.</div>
                  <div className="mt-4">
                    <Button onClick={connectYouTube} className="gap-2">
                      <Youtube className="h-4 w-4" />
                      Connect YouTube
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/50 px-4 py-4 text-sm text-white/55">
              No videos found.
            </div>
          ) : (
            <div className="mt-5">
              <div className="w-full">
                <div className="space-y-3">
                  {paginatedRows.map((row) => {
                    const v = row.video;
                    const thumb = pickYoutubeThumb(v.thumbnails_json);

                    return (
                      <div
                        key={v.video_id}
                        className="grid grid-cols-[minmax(0,2.45fr)_minmax(80px,0.55fr)_minmax(120px,0.7fr)_minmax(150px,0.8fr)_minmax(205px,0.95fr)] gap-4 rounded-2xl bg-black/40 px-4 py-4 items-center transition-colors hover:bg-white/[0.015]"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-[81px] w-[144px] rounded-xl bg-black/50 overflow-hidden shrink-0 flex items-center justify-center">
                            {thumb ? <img src={thumb} alt="" className="h-full w-full object-contain" /> : <Youtube className="h-4 w-4 text-white/60" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-white/85 truncate">{v.title}</div>
                            <div className="mt-1 text-xs text-white/45 flex items-center gap-2">
                              <span>{v.published_at ? new Date(v.published_at).toLocaleDateString() : '—'}</span>
                              {v.is_short ? (
                                <>
                                  <span className="text-white/25">•</span>
                                  <span className="text-white/55">Short</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-white/80 flex items-center justify-end gap-1.5 tabular-nums text-right">
                          <Eye className="h-3.5 w-3.5 text-white/45" />
                          {formatCompactNumber(Number(v.view_count || 0))}
                        </div>

                        <div className="text-xs text-white/55 flex items-center justify-end gap-3 tabular-nums text-right">
                          <span className="inline-flex items-center gap-1" title="Likes">
                            <ThumbsUp className="h-3.5 w-3.5 text-white/45" />
                            {formatCompactNumber(Number(v.like_count || 0))}
                          </span>
                          <span className="inline-flex items-center gap-1" title="Comments">
                            <MessageCircle className="h-3.5 w-3.5 text-white/45" />
                            {formatCompactNumber(Number(v.comment_count || 0))}
                          </span>
                        </div>

                        <div className="text-xs text-white/55 flex items-center justify-end gap-2 tabular-nums text-right">
                          <span className="text-white/80 font-semibold">{formatCompactNumber(Number(row.clicks_range || 0))}</span>
                          <span className="text-white/25">/</span>
                          <span className="text-white/45">{formatCompactNumber(Number(row.clicks_all_time || 0))}</span>
                          <span className="text-white/25">•</span>
                          <span className="text-white/45">{formatRelative(row.last_clicked_at)}</span>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          {row.cta ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyCtaForVideo(row)}
                                className="h-8 rounded-xl border-0 bg-white/8 px-2.5 text-[11px] text-white/90 hover:bg-white/24"
                                title="Copy CTA link"
                              >
                                <span className="relative mr-1.5 h-3.5 w-3.5">
                                  <LinkChain
                                    className={cn(
                                      'absolute inset-0 h-3.5 w-3.5 transition-all duration-200',
                                      copiedCtaVideoId === v.video_id ? 'scale-75 opacity-0' : 'scale-100 opacity-100',
                                    )}
                                  />
                                  <Check
                                    className={cn(
                                      'absolute inset-0 h-3.5 w-3.5 text-emerald-300 transition-all duration-200',
                                      copiedCtaVideoId === v.video_id ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
                                    )}
                                  />
                                </span>
                                {copiedCtaVideoId === v.video_id ? 'Copied' : 'Copy CTA'}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCtaToDelete({ ctaId: row.cta!.id, title: v.title })}
                                className="h-8 w-8 rounded-xl border-0 bg-white/8 text-white hover:bg-white/24 hover:text-white"
                                title="Delete CTA mapping"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={creatingCtaVideoId === v.video_id || bulkMode !== null}
                                onClick={() => createCtaForVideo(row)}
                                className="h-8 rounded-xl border-0 bg-white/8 px-2.5 text-[11px] text-white/90 hover:bg-white/12"
                              >
                                {creatingCtaVideoId === v.video_id ? 'Creating…' : 'Create CTA'}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                disabled
                                className="h-8 w-8 rounded-xl border-0 bg-white/8 text-white/35 opacity-60"
                                title="No CTA mapping to delete yet"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {filteredRows.length > VIDEOS_PER_PAGE ? (
            <div className="mt-4 flex items-center justify-between gap-3 px-1">
              <div className="text-xs text-white/45">
                Showing {pageStart}-{pageEnd} of {filteredRows.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 rounded-xl border-0 bg-white/8 px-3 text-[12px] text-white/80 hover:bg-white/14"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 rounded-xl border-0 bg-white/8 px-3 text-[12px] text-white/80 hover:bg-white/14"
                >
                  Next
                </Button>
                <span className="text-xs text-white/45 px-1">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <AlertDialog open={Boolean(ctaToDelete)} onOpenChange={(open) => (!open ? setCtaToDelete(null) : null)}>
        <AlertDialogContent className="rounded-3xl border border-white/10 bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete the CTA mapping for <span className="text-white/80">{ctaToDelete?.title || 'this video'}</span>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-0 bg-white/8 text-white/80 hover:bg-white/12">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!ctaToDelete?.ctaId) return;
                deleteCtaMappingById(ctaToDelete.ctaId);
                setCtaToDelete(null);
              }}
              className="rounded-xl border-0 bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-3xl border border-white/10 bg-black', className)}>{children}</div>;
}

function StatCard({ title, value, meta }: { title: string; value: string; meta: string }) {
  return (
    <Card className="p-6">
      <div className="text-[12px] text-white/45">{title}</div>
      <div className="mt-3 text-3xl font-semibold text-white/92">{value}</div>
      <div className="mt-1 text-xs text-white/35 truncate">{meta}</div>
    </Card>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 px-3.5 rounded-xl transition-colors text-[13px] font-semibold tracking-[0.02em]',
        active ? 'bg-[#1b1f21] text-white' : 'bg-transparent text-[#a1a4a5]',
      )}
    >
      {children}
    </button>
  );
}
