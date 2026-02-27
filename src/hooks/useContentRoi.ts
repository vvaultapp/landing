import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';

export type RoiTimeRange = '7d' | '30d' | '90d' | 'all';

export type RoiCTA = {
  id: string;
  workspace_id: string;
  source_type: 'youtube_video';
  source_ref: string;
  tracked_link_id: string;
  created_at: string;
};

export type RoiTrackedLink = {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  destination_url: string;
  mode: string | null;
  archived: boolean | null;
  clicks_total: number | null;
  last_clicked_at: string | null;
  created_at: string;
};

export type RoiTrackedLinkEvent = {
  link_id: string;
  event_type: 'click' | 'conversion';
  event_at: string;
};

export type RoiYouTubeVideo = {
  id: string;
  workspace_id: string;
  video_id: string;
  title: string;
  description: string | null;
  published_at: string | null;
  thumbnails_json: any;
  tags: any;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  is_short: boolean | null;
};

export type RoiVideoRow = {
  video: RoiYouTubeVideo;
  cta: RoiCTA | null;
  link: RoiTrackedLink | null;
  short_url: string | null;
  clicks_range: number;
  clicks_all_time: number;
  last_clicked_at: string | null;
  ctr: number;
  cta_in_description: boolean;
};

function sourceKey(cta: Pick<RoiCTA, 'source_type' | 'source_ref'>) {
  return `${cta.source_type}:${cta.source_ref}`;
}

function toNumber(value: any): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseMs(iso: string | null) {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function rangeFromIso(range: RoiTimeRange, now = Date.now()): string | null {
  if (range === '7d') return new Date(now - 7 * 86400_000).toISOString();
  if (range === '30d') return new Date(now - 30 * 86400_000).toISOString();
  if (range === '90d') return new Date(now - 90 * 86400_000).toISOString();
  return null;
}

function chartFromIso(range: RoiTimeRange, now = Date.now()): string {
  // All-time can be huge; keep chart bounded while still honest in UI.
  return rangeFromIso(range === 'all' ? '90d' : range, now) as string;
}

async function fetchAllTrackedLinkEvents(opts: {
  workspaceId: string;
  linkIds: string[];
  fromIso: string;
  pageSize?: number;
  maxRows?: number;
}) {
  const { workspaceId, linkIds, fromIso, pageSize = 1000, maxRows = 25_000 } = opts;
  const out: RoiTrackedLinkEvent[] = [];

  let from = 0;
  while (out.length < maxRows) {
    const to = from + pageSize - 1;
    const { data, error } = await (supabase as any)
      .from('tracked_link_events')
      .select('link_id,event_type,event_at')
      .eq('workspace_id', workspaceId)
      .in('link_id', linkIds)
      .eq('event_type', 'click')
      .gte('event_at', fromIso)
      .order('event_at', { ascending: true })
      .range(from, to);

    if (error) throw error;
    const rows = Array.isArray(data) ? (data as RoiTrackedLinkEvent[]) : [];
    out.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return out;
}

export function useContentRoi() {
  const { workspace } = useWorkspace();

  const [timeRange, setTimeRange] = useState<RoiTimeRange>('30d');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [bookingUrl, setBookingUrl] = useState<string>('');
  const [youtubeChannels, setYoutubeChannels] = useState<Array<{ id: string; title: string | null; last_synced_at: string | null }>>([]);

  const [ctas, setCtas] = useState<RoiCTA[]>([]);
  const [links, setLinks] = useState<RoiTrackedLink[]>([]);
  const [events, setEvents] = useState<RoiTrackedLinkEvent[]>([]);

  const [youtubeVideos, setYoutubeVideos] = useState<RoiYouTubeVideo[]>([]);

  const lastWorkspaceIdRef = useRef<string | null>(null);

  const refresh = useCallback(
    async (opts?: { silent?: boolean; range?: RoiTimeRange }) => {
      const wsId = workspace?.id ? String(workspace.id) : '';
      if (!wsId) return;

      const silent = Boolean(opts?.silent);
      const effectiveRange: RoiTimeRange = (opts?.range as RoiTimeRange) || timeRange;
      if (!silent) setRefreshing(true);

      try {
        // Booking URL (useful as CTA destination default)
        try {
          const { data } = await supabase.from('workspaces').select('booking_url').eq('id', wsId).maybeSingle();
          const url = data?.booking_url ? String((data as any).booking_url).trim() : '';
          setBookingUrl(url);
        } catch {
          setBookingUrl('');
        }

        // YouTube channels
        try {
          const { data } = await (supabase as any)
            .from('connected_youtube_channels')
            .select('id,title,last_synced_at')
            .eq('workspace_id', wsId)
            .order('created_at', { ascending: false })
            .limit(20);
          setYoutubeChannels(Array.isArray(data) ? data : []);
        } catch {
          setYoutubeChannels([]);
        }

        // CTAs
        let nextCtas: RoiCTA[] = [];
        try {
          const { data, error } = await (supabase as any)
            .from('content_ctas')
            .select('id,workspace_id,source_type,source_ref,tracked_link_id,created_at')
            .eq('workspace_id', wsId)
            .eq('source_type', 'youtube_video')
            .order('created_at', { ascending: false })
            .limit(2000);
          if (error) throw error;
          nextCtas = Array.isArray(data) ? (data as RoiCTA[]) : [];
          setCtas(nextCtas);
        } catch {
          nextCtas = [];
          setCtas([]);
        }

        const linkIds = Array.from(new Set(nextCtas.map((c) => String(c.tracked_link_id)).filter(Boolean)));

        // Links
        try {
          if (linkIds.length === 0) {
            setLinks([]);
          } else {
            const { data } = await (supabase as any)
              .from('tracked_links')
              .select('id,workspace_id,name,slug,destination_url,mode,archived,clicks_total,last_clicked_at,created_at')
              .eq('workspace_id', wsId)
              .in('id', linkIds)
              .order('created_at', { ascending: false });
            setLinks(Array.isArray(data) ? data : []);
          }
        } catch {
          setLinks([]);
        }

        // Events (range-bound; used for chart + range counts)
        const fromIso = chartFromIso(effectiveRange);
        try {
          if (linkIds.length === 0) {
            setEvents([]);
          } else {
            const rows = await fetchAllTrackedLinkEvents({ workspaceId: wsId, linkIds, fromIso });
            setEvents(rows);
          }
        } catch {
          setEvents([]);
        }

        // YouTube videos (latest + CTA-referenced)
        try {
          const wanted = Array.from(
            new Set(nextCtas.map((c) => String(c.source_ref)).filter(Boolean)),
          );

          const [latestRes, wantedRes] = await Promise.all([
            (supabase as any)
              .from('youtube_videos')
              .select('id,workspace_id,video_id,title,description,published_at,thumbnails_json,tags,view_count,like_count,comment_count,is_short')
              .eq('workspace_id', wsId)
              .order('published_at', { ascending: false })
              .limit(200),
            wanted.length
              ? (supabase as any)
                  .from('youtube_videos')
                  .select('id,workspace_id,video_id,title,description,published_at,thumbnails_json,tags,view_count,like_count,comment_count,is_short')
                  .eq('workspace_id', wsId)
                  .in('video_id', wanted)
              : Promise.resolve({ data: [] }),
          ]);

          const merged = new Map<string, RoiYouTubeVideo>();
          for (const row of [...(wantedRes.data || []), ...(latestRes.data || [])]) {
            if (row?.video_id) merged.set(String(row.video_id), row as RoiYouTubeVideo);
          }
          setYoutubeVideos(Array.from(merged.values()));
        } catch {
          setYoutubeVideos([]);
        }
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [workspace?.id, timeRange],
  );

  useEffect(() => {
    const wsId = workspace?.id ? String(workspace.id) : '';
    if (!wsId) {
      lastWorkspaceIdRef.current = null;
      setLoading(false);
      setRefreshing(false);
      setBookingUrl('');
      setYoutubeChannels([]);
      setCtas([]);
      setLinks([]);
      setEvents([]);
      setYoutubeVideos([]);
      return;
    }

    let cancelled = false;
    const firstForWorkspace = lastWorkspaceIdRef.current !== wsId;
    lastWorkspaceIdRef.current = wsId;

    if (firstForWorkspace) setLoading(true);

    refresh({ silent: true, range: timeRange })
      .catch(() => {})
      .finally(() => {
        if (!cancelled && firstForWorkspace) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspace?.id, timeRange, refresh]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const linkById = useMemo(() => {
    const m = new Map<string, RoiTrackedLink>();
    for (const l of links) m.set(String(l.id), l);
    return m;
  }, [links]);

  const ytByVideoId = useMemo(() => {
    const m = new Map<string, RoiYouTubeVideo>();
    for (const v of youtubeVideos) m.set(String(v.video_id), v);
    return m;
  }, [youtubeVideos]);

  const rangeStartIso = useMemo(() => chartFromIso(timeRange), [timeRange]);
  const rangeStartMs = useMemo(() => parseMs(rangeStartIso), [rangeStartIso]);

  const rangeClicksByLinkId = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) {
      const id = String(e.link_id);
      m.set(id, (m.get(id) || 0) + 1);
    }
    return m;
  }, [events]);

  const rangeLastClickedAtByLinkId = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of events) {
      const id = String(e.link_id);
      const prev = m.get(id);
      if (!prev || parseMs(e.event_at) > parseMs(prev)) m.set(id, e.event_at);
    }
    return m;
  }, [events]);

  const longFormVideoIds = useMemo(() => {
    const ids = new Set<string>();
    for (const video of youtubeVideos) {
      if (video.is_short === true) continue;
      ids.add(String(video.video_id));
    }
    return ids;
  }, [youtubeVideos]);

  const longFormLinkIds = useMemo(() => {
    const ids = new Set<string>();
    for (const cta of ctas) {
      if (!longFormVideoIds.has(String(cta.source_ref))) continue;
      const link = linkById.get(String(cta.tracked_link_id));
      if (link?.id) ids.add(String(link.id));
    }
    return ids;
  }, [ctas, longFormVideoIds, linkById]);

  const chartData = useMemo(() => {
    // Build dense daily series between rangeStart and now.
    const start = new Date(rangeStartMs);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(0, 0, 0, 0);

    const dayKey = (d: Date) => d.toISOString().slice(0, 10);
    const counts = new Map<string, number>();
    for (const e of events) {
      if (!longFormLinkIds.has(String(e.link_id))) continue;
      const k = String(e.event_at || '').slice(0, 10);
      if (!k) continue;
      counts.set(k, (counts.get(k) || 0) + 1);
    }

    const out: Array<{ day: string; clicks: number }> = [];
    for (let t = start.getTime(); t <= end.getTime(); t += 86400_000) {
      const d = new Date(t);
      const k = dayKey(d);
      out.push({ day: k, clicks: counts.get(k) || 0 });
    }
    return out;
  }, [events, rangeStartMs, longFormLinkIds]);

  const videoRows = useMemo(() => {
    const out: RoiVideoRow[] = [];
    const ctaByVideoId = new Map<string, RoiCTA>();
    for (const c of ctas) ctaByVideoId.set(String(c.source_ref), c);

    const sortedVideos = [...youtubeVideos]
      .filter((video) => video.is_short !== true)
      .sort((a, b) => parseMs(b.published_at) - parseMs(a.published_at));

    for (const video of sortedVideos) {
      const cta = ctaByVideoId.get(String(video.video_id)) || null;
      const link = cta ? linkById.get(String(cta.tracked_link_id)) || null : null;

      const clicksRange = link
        ? (timeRange === 'all' ? toNumber(link.clicks_total) : toNumber(rangeClicksByLinkId.get(String(link.id)) || 0))
        : 0;
      const clicksAll = link ? toNumber(link.clicks_total) : 0;
      const lastClickedAt = link
        ? (timeRange === 'all' ? link.last_clicked_at : (rangeLastClickedAtByLinkId.get(String(link.id)) || null))
        : null;

      const views = toNumber((video as any).view_count);
      const ctr = views > 0 ? clicksRange / views : 0;

      const shortUrl = link ? `${origin}/l/${link.slug}` : null;
      const desc = String((video as any).description || '');
      const ctaInDescription = link ? desc.includes(`/l/${link.slug}`) : false;

      out.push({
        video,
        cta,
        link,
        short_url: shortUrl,
        clicks_range: clicksRange,
        clicks_all_time: clicksAll,
        last_clicked_at: lastClickedAt,
        ctr,
        cta_in_description: ctaInDescription,
      });
    }

    return out;
  }, [ctas, youtubeVideos, linkById, origin, timeRange, rangeClicksByLinkId, rangeLastClickedAtByLinkId]);

  const kpis = useMemo(() => {
    const uniqueLinkIds = new Set<string>();
    for (const linkId of longFormLinkIds) uniqueLinkIds.add(linkId);

    let totalClicks = 0;
    let minCreatedMs = 0;
    for (const id of uniqueLinkIds) {
      const l = linkById.get(id);
      if (!l) continue;
      totalClicks += timeRange === 'all' ? toNumber(l.clicks_total) : toNumber(rangeClicksByLinkId.get(id) || 0);
      const createdMs = parseMs(l.created_at);
      if (!minCreatedMs || createdMs < minCreatedMs) minCreatedMs = createdMs;
    }

    const daysSinceMin = minCreatedMs ? Math.max(1, Math.ceil((Date.now() - minCreatedMs) / 86400_000)) : 1;
    const daysForAvg =
      timeRange === 'all'
        ? daysSinceMin
        : Math.max(1, Math.ceil((Date.now() - rangeStartMs) / 86400_000));

    const avgPerDay = totalClicks / daysForAvg;
    const topCtrVideo = [...videoRows].sort((a, b) => b.ctr - a.ctr)[0] || null;

    const totalVideos = videoRows.length;
    const withCta = videoRows.filter((r) => Boolean(r.cta)).length;

    return {
      totalClicks,
      avgPerDay,
      ctaCoverage: { withCta, totalVideos },
      topCtrVideoTitle: topCtrVideo?.video?.title || null,
      activeCtas: withCta,
    };
  }, [longFormLinkIds, linkById, timeRange, rangeClicksByLinkId, rangeStartMs, videoRows]);

  const youtubeHasAny = youtubeChannels.length > 0;

  const chartMeta = useMemo(() => {
    const label = timeRange === 'all' ? 'Last 90 days' : timeRange;
    return { label, fromIso: rangeStartIso };
  }, [timeRange, rangeStartIso]);

  return {
    timeRange,
    setTimeRange,
    loading,
    refreshing,
    refresh,
    bookingUrl,
    youtubeChannels,
    youtubeHasAny,
    youtubeVideos,
    ctas,
    links,
    events,
    chartMeta,
    chartData,
    kpis,
    videoRows,
  };
}
