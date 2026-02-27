import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

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

function isCalendlyUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.toLowerCase().includes('calendly.com');
  } catch {
    return false;
  }
}

function loadCalendlyWidgetScript(): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>('script[data-calendly-widget="1"]');
  if (existing) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.dataset.calendlyWidget = '1';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Calendly'));
    document.head.appendChild(script);
  });
}

export default function BookLink() {
  const { slug } = useParams();
  const location = useLocation();

  const [destinationUrl, setDestinationUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

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
        setLoading(false);
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
            mode: 'booking',
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
        setLoading(false);
        return;
      }

      const url = data?.destinationUrl ? String(data.destinationUrl) : '';
      if (!url) {
        setError('Link is unavailable');
        setLoading(false);
        return;
      }

      setDestinationUrl(url);
      setLoading(false);
    };

    run().catch((e) => {
      if (!cancelled) {
        setError(e?.message || 'Link is unavailable');
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug, location.pathname, location.search, utm, attribution]);

  useEffect(() => {
    if (!destinationUrl) return;
    if (!isCalendlyUrl(destinationUrl)) return;

    let cancelled = false;

    const onMessage = async (event: MessageEvent) => {
      const data = event?.data;
      const ev = typeof data?.event === 'string' ? data.event : '';
      if (!ev) return;
      if (ev !== 'calendly.event_scheduled') return;
      if (booked) return;

      setBooked(true);

      const s = String(slug || '').trim();
      const visitorId = getOrCreateVisitorId();
      const referrer = typeof document !== 'undefined' ? document.referrer : '';

      try {
        await supabase.functions.invoke('link-tracker', {
          body: {
            action: 'conversion',
            slug: s,
            visitorId,
            referrer,
            meta: {
              calendly: data,
              path: location.pathname,
              search: location.search,
              utm,
              attribution,
            },
          },
        });
      } catch {
        // ignore
      }
    };

    const run = async () => {
      await loadCalendlyWidgetScript();
      if (cancelled) return;
      window.addEventListener('message', onMessage);
    };

    run().catch(() => {
      // If Calendly script fails, we just don't track conversions.
    });

    return () => {
      cancelled = true;
      window.removeEventListener('message', onMessage);
    };
  }, [destinationUrl, slug, booked, utm, attribution, location.pathname, location.search]);

  const openExternal = () => {
    if (!destinationUrl) return;
    window.location.href = destinationUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="flex items-center gap-3 text-white/70">
          <Loader2 className="w-5 h-5 animate-spin" />
          <div className="text-sm">Loading booking page…</div>
        </div>
      </div>
    );
  }

  if (error || !destinationUrl) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-black p-6 text-center">
          <div className="text-lg font-medium">This link is unavailable</div>
          <div className="mt-2 text-sm text-white/55">{error || 'Link is unavailable'}</div>
        </div>
      </div>
    );
  }

  const calendly = isCalendlyUrl(destinationUrl);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold">Book a call</div>
            <div className="mt-2 text-sm text-white/55">
              {calendly
                ? 'Pick a time below. We’ll track the booking once it’s scheduled.'
                : 'This booking page supports Calendly embeds only. We’ll still count your click.'}
            </div>
          </div>

          <Button variant="outline" className="rounded-2xl border-white/15" onClick={openExternal}>
            Open in browser
          </Button>
        </div>

        {booked ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-black p-5 text-sm text-white/75">
            Booking captured. You can close this tab.
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl border border-white/10 overflow-hidden">
          {calendly ? (
            <div className="calendly-inline-widget" data-url={destinationUrl} style={{ minWidth: 320, height: 820 }} />
          ) : (
            <div className="p-6 text-sm text-white/65">
              <div className="font-medium text-white/85">Unsupported scheduler</div>
              <div className="mt-2">
                Use a Calendly link to track booked calls automatically, or open your link directly.
              </div>
              <div className="mt-4">
                <Button className="rounded-2xl" onClick={openExternal}>
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
