import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from '@/components/ui/icons';

function getOrCreateVisitorId(): string {
  const key = 'acq_vid';
  try {
    const existing = localStorage.getItem(key);
    if (existing && existing.length >= 8) return existing;
  } catch {
    // ignore
  }

  const id =
    typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function'
      ? (crypto as any).randomUUID()
      : `v-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    localStorage.setItem(key, id);
  } catch {
    // ignore
  }
  return id;
}

export default function LinkRedirect() {
  const { slug } = useParams();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  const utm = useMemo(() => {
    const params = new URLSearchParams(location.search || '');
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const out: Record<string, string> = {};
    for (const k of keys) {
      const v = params.get(k);
      if (v) out[k] = v;
    }
    return out;
  }, [location.search]);

  const attribution = useMemo(() => {
    const params = new URLSearchParams(location.search || '');
    const pick = (...keys: string[]) => {
      for (const k of keys) {
        const v = params.get(k);
        if (v) return v;
      }
      return null;
    };

    const youtubeVideoId = pick('vid', 'video', 'video_id', 'videoId', 'youtube_video_id', 'youtubeVideoId', 'v');
    return youtubeVideoId ? { youtubeVideoId } : null;
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const s = String(slug || '').trim();
      if (!s) {
        setError('Invalid link');
        return;
      }

      const visitorId = getOrCreateVisitorId();
      const referrer = typeof document !== 'undefined' ? document.referrer : '';

      const { data, error } = await supabase.functions.invoke('link-tracker', {
        body: {
          action: 'click',
          slug: s,
          visitorId,
          referrer,
          meta: {
            path: location.pathname,
            search: location.search,
            utm,
            attribution,
          },
        },
      });

      if (cancelled) return;

      if (error) {
        setError('Link is unavailable');
        return;
      }

      const destinationUrl = data?.destinationUrl ? String(data.destinationUrl) : '';
      if (!destinationUrl) {
        setError('Link is unavailable');
        return;
      }

      window.location.replace(destinationUrl);
    };

    run().catch((e) => {
      if (!cancelled) setError(e?.message || 'Link is unavailable');
    });

    return () => {
      cancelled = true;
    };
  }, [slug, location.pathname, location.search, utm, attribution]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      {error ? (
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-black p-6 text-center">
          <div className="text-lg font-medium">This link is unavailable</div>
          <div className="mt-2 text-sm text-white/55">{error}</div>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-white/70">
          <Loader2 className="w-5 h-5 animate-spin" />
          <div className="text-sm">Redirecting…</div>
        </div>
      )}
    </div>
  );
}
