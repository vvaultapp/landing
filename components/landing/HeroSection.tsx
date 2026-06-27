"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LandingContent, Locale } from "@/components/landing/content";
import { LoopingVideo } from "@/components/landing/LoopingVideo";
import { trackButtonClick } from "@/lib/analytics/client";
import { fetchJsonCached } from "@/lib/fetchJsonCached";

export type LandingStatsResponse = {
  emailsSentTotal: number;
  usersTotal: number;
  tracksTotal: number;
  moneyPaidTotalCents: number;
  appStoreReviewLabel: string;
  avatarUrls: string[];
};

/* Server-seeded hero data passed down from the (server) page. Structurally
   identical to HeroStats in lib/landing/heroStats.ts — redeclared here so this
   client component never imports the server-only module. */
export type HeroInitialStats = {
  usersTotal: number;
  avatarDataUris: string[];
  avatarUrls: string[];
};

const NO_AVATARS: string[] = [];

const LANDING_STATS_FALLBACK: LandingStatsResponse = {
  emailsSentTotal: 0,
  usersTotal: 0,
  tracksTotal: 0,
  moneyPaidTotalCents: 0,
  appStoreReviewLabel: "4.9/5",
  avatarUrls: [],
};

function toPositiveNumber(value: unknown, fallback = 0): number {
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0) return fallback;
  return Math.floor(next);
}

function normalizeAvatarUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const unique = new Set<string>();
  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const cleaned = entry.trim();
    if (!cleaned) continue;
    unique.add(cleaned);
  }

  return Array.from(unique);
}

/* Rewrite Supabase-storage / Google / Gravatar avatar URLs to a tiny 48px
   render, so the 5 static hero avatars are only a few KB each. */
function toFastAvatarUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname;
    if (parsed.searchParams.has("token")) return rawUrl;
    if (path.includes("/storage/v1/object/public/")) {
      parsed.pathname = path.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/",
      );
      parsed.searchParams.set("width", "48");
      parsed.searchParams.set("height", "48");
      parsed.searchParams.set("quality", "60");
      parsed.searchParams.set("resize", "cover");
      return parsed.toString();
    }
    if (host.includes("googleusercontent.com")) {
      parsed.searchParams.set("sz", "48");
      return parsed.toString();
    }
    if (host.includes("gravatar.com")) {
      parsed.searchParams.set("s", "48");
      return parsed.toString();
    }
  } catch {
    return rawUrl;
  }
  return rawUrl;
}

const AVATAR_PRELOAD_PARALLEL = 4;
const AVATAR_PRELOAD_PARALLEL_SLOW = 2;

function shuffleStrings(values: string[]): string[] {
  const next = [...values];
  for (let idx = next.length - 1; idx > 0; idx -= 1) {
    const swapIdx = Math.floor(Math.random() * (idx + 1));
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
  }
  return next;
}

function preloadAvatar(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    let settled = false;
    const done = (success: boolean) => {
      if (settled) return;
      settled = true;
      img.onload = null;
      img.onerror = null;
      clearTimeout(timeoutId);
      resolve(success);
    };
    const timeoutId = window.setTimeout(() => done(false), 4500);
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = url;
    if (img.complete && img.naturalWidth > 0) done(true);
  });
}

const LANDING_STATS_CACHE_KEY = "vvault-landing-stats-v1";

function readStatsCache(): LandingStatsResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LANDING_STATS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LandingStatsResponse>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      emailsSentTotal: toPositiveNumber(parsed.emailsSentTotal, LANDING_STATS_FALLBACK.emailsSentTotal),
      usersTotal: toPositiveNumber(parsed.usersTotal, LANDING_STATS_FALLBACK.usersTotal),
      tracksTotal: toPositiveNumber(parsed.tracksTotal, LANDING_STATS_FALLBACK.tracksTotal),
      moneyPaidTotalCents: toPositiveNumber(
        parsed.moneyPaidTotalCents,
        LANDING_STATS_FALLBACK.moneyPaidTotalCents,
      ),
      appStoreReviewLabel:
        typeof parsed.appStoreReviewLabel === "string" && parsed.appStoreReviewLabel.trim()
          ? parsed.appStoreReviewLabel.trim()
          : LANDING_STATS_FALLBACK.appStoreReviewLabel,
      avatarUrls: normalizeAvatarUrls(parsed.avatarUrls),
    };
  } catch {
    return null;
  }
}

function writeStatsCache(next: LandingStatsResponse): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANDING_STATS_CACHE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function useLandingStats(initial?: { usersTotal?: number; avatarUrls?: string[] }) {
  /* Seed from the server-rendered values so the count + avatar pool are present
     on the very first client render (no "…", no empty pool) — the deferred
     fetch below only ever refreshes them, never starts from zero. */
  const [stats, setStats] = useState<LandingStatsResponse>(() => ({
    ...LANDING_STATS_FALLBACK,
    usersTotal:
      typeof initial?.usersTotal === "number" && initial.usersTotal > 0
        ? Math.floor(initial.usersTotal)
        : 0,
    avatarUrls: Array.isArray(initial?.avatarUrls) ? initial.avatarUrls : [],
  }));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    let inFlight = false;

    /* Hydrate from the localStorage cache before hitting the API.
       If Supabase is paused (or the project is down), the fetch will
       fail and React state would otherwise stay at the all-zeros
       fallback — meaning the hero would render "0 artists" and no
       avatars. Loading from cache first means we always show the
       last-known-good counts/avatars even during an outage. */
    const cached = readStatsCache();
    if (cached && active) {
      setStats(cached);
      setLoaded(true);
    }

    const loadStats = async () => {
      if (inFlight) return;
      inFlight = true;

      try {
        const payload = (await fetchJsonCached(
          "/api/landing-stats",
        )) as Partial<LandingStatsResponse>;
        if (!active) return;

        const next: LandingStatsResponse = {
          emailsSentTotal: toPositiveNumber(payload.emailsSentTotal, LANDING_STATS_FALLBACK.emailsSentTotal),
          usersTotal: toPositiveNumber(payload.usersTotal, LANDING_STATS_FALLBACK.usersTotal),
          tracksTotal: toPositiveNumber(payload.tracksTotal, LANDING_STATS_FALLBACK.tracksTotal),
          moneyPaidTotalCents: toPositiveNumber(
            payload.moneyPaidTotalCents,
            LANDING_STATS_FALLBACK.moneyPaidTotalCents,
          ),
          appStoreReviewLabel:
            typeof payload.appStoreReviewLabel === "string" && payload.appStoreReviewLabel.trim()
              ? payload.appStoreReviewLabel.trim()
              : LANDING_STATS_FALLBACK.appStoreReviewLabel,
          avatarUrls: normalizeAvatarUrls(payload.avatarUrls),
        };
        /* Only commit responses with a real user count — when the API
           returns an all-zero payload (e.g. Supabase paused, RPC threw,
           the query failed in some other way), keep whatever we already
           had in state (cache or previous fetch) rather than clobbering
           the on-screen numbers with zeros. */
        if (next.usersTotal > 0) {
          setStats(next);
          writeStatsCache(next);
        }
      } catch {
        // Keep current values (cache or fallback) when API is unavailable.
      } finally {
        inFlight = false;
        if (active) setLoaded(true);
      }
    };

    // Defer the first stats fetch (and therefore the avatar image loads) until
    // AFTER the page's load event + the browser is idle. This keeps them off
    // the critical path so they never delay the load event or keep the browser
    // loading bar spinning — the cached values (if any) already paint instantly.
    const startStats = () => {
      const ric = (window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
      }).requestIdleCallback;
      if (ric) ric(() => void loadStats(), { timeout: 1500 });
      else setTimeout(() => void loadStats(), 200);
    };
    if (document.readyState === "complete") startStats();
    else window.addEventListener("load", startStats, { once: true });

    /* Re-poll every 60s so a tab that stays open through new
       Supabase activity reflects fresh KPI numbers without a
       hard reload. Pauses while the tab is hidden. */
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (!intervalId) intervalId = setInterval(() => void loadStats(), 60_000);
    };
    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    start();
    const onVis = () => (document.hidden ? stop() : (void loadStats(), start()));
    document.addEventListener("visibilitychange", onVis);

    return () => {
      active = false;
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return { stats, loaded };
}


export function HeroTrustedBy({
  locale,
  usersTotal,
  avatarUrls,
  initialAvatars = NO_AVATARS,
}: {
  locale: Locale;
  usersTotal: number;
  avatarUrls: string[];
  /** Avatars inlined by the server as base64 data URIs. When present they're
      painted into the 5 circles immediately (never grey); the live URLs below
      then just enrich the rotation pool. */
  initialAvatars?: string[];
}) {
  const AVATAR_SLOT_COUNT = 5;
  const hasInitialAvatars = initialAvatars.length > 0;
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US"),
    [locale],
  );
  const optimizedAvatarUrls = useMemo(() => {
    const unique = new Set<string>();
    for (const source of avatarUrls) {
      const cleaned = source.trim();
      if (!cleaned) continue;
      unique.add(toFastAvatarUrl(cleaned));
    }
    return Array.from(unique).sort((left, right) => left.localeCompare(right));
  }, [avatarUrls]);
  const optimizedAvatarsKey = useMemo(() => optimizedAvatarUrls.join("|"), [optimizedAvatarUrls]);
  const avatarPoolRef = useRef<string[]>(
    hasInitialAvatars ? initialAvatars.slice() : optimizedAvatarUrls,
  );
  const shuffledPoolRef = useRef<string[]>([]);
  const shuffleCursorRef = useRef(0);
  /* Solid dark-grey avatar placeholder shown ONLY in the rare case where the
     server inlined no avatars AND the client fetch hasn't returned yet. With
     server-inlined data URIs (the normal path) the circles are never grey. */
  const placeholderColor = "#3f3f46";
  const [slots, setSlots] = useState<Array<{ layerA: string; layerB: string; showA: boolean }>>(
    () =>
      Array.from({ length: AVATAR_SLOT_COUNT }, (_, idx) => {
        // Cycle the inlined avatars to fill all 5 circles even if fewer than 5
        // downloaded server-side — so a circle shows a real face, never grey.
        // Only layerA is seeded (layerB is filled on the first rotation), so
        // each inlined avatar appears once in the HTML, not twice.
        const uri = hasInitialAvatars ? initialAvatars[idx % initialAvatars.length] : "";
        return { layerA: uri, layerB: "", showA: true };
      }),
  );
  const refillShuffledPool = useCallback(() => {
    shuffledPoolRef.current = shuffleStrings(avatarPoolRef.current);
    shuffleCursorRef.current = 0;
  }, []);

  const pickNextAvatar = useCallback(
    (blocked: Set<string>) => {
      const pool = avatarPoolRef.current;
      if (pool.length === 0) return "";
      if (pool.length === 1) return pool[0] ?? "";

      const maxAttempts = pool.length * 2;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        if (shuffleCursorRef.current >= shuffledPoolRef.current.length) {
          refillShuffledPool();
        }

        const candidate = shuffledPoolRef.current[shuffleCursorRef.current] ?? "";
        shuffleCursorRef.current += 1;
        if (!candidate) continue;
        if (blocked.has(candidate) && attempt < maxAttempts - 1) continue;
        return candidate;
      }

      for (const candidate of pool) {
        if (!blocked.has(candidate)) return candidate;
      }

      return pool[Math.floor(Math.random() * pool.length)] ?? "";
    },
    [refillShuffledPool],
  );

  /* Preload + verify the live avatar URLs in the background. With server-inlined
     avatars the 5 circles are ALREADY painted (data URIs), so verified live URLs
     only feed the rotation pool and the rotation effect crossfades them in
     gradually — a circle never flashes grey. Without inlined avatars (rare
     fallback) we seed the visible slots from ONLY the URLs that actually load,
     so a broken/404'd avatar can't leave a circle grey either. `poolReady`
     bumps whenever the pool changes, to (re)start the rotation effect below. */
  const [poolReady, setPoolReady] = useState(0);
  useEffect(() => {
    let cancelled = false;

    // No live URLs to verify yet (stats still loading / unavailable).
    if (optimizedAvatarUrls.length === 0) {
      if (hasInitialAvatars) {
        // Keep the inlined avatars visible; rotate among them.
        avatarPoolRef.current = initialAvatars.slice();
        refillShuffledPool();
        setPoolReady((v) => v + 1);
      } else {
        avatarPoolRef.current = [];
        setSlots(
          Array.from({ length: AVATAR_SLOT_COUNT }, () => ({ layerA: "", layerB: "", showA: true })),
        );
      }
      return () => {
        cancelled = true;
      };
    }

    const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } })
      .connection;
    const isSlow =
      Boolean(connection?.saveData) ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g";
    const parallel = isSlow ? AVATAR_PRELOAD_PARALLEL_SLOW : AVATAR_PRELOAD_PARALLEL;

    // Verify a handful of live URLs (5 + a few spares) — keeps the hero to ~6
    // image requests, not ~30.
    const target = Math.min(optimizedAvatarUrls.length, AVATAR_SLOT_COUNT + 1);
    const queue = shuffleStrings(optimizedAvatarUrls).slice(0, target + 3);
    const verified: string[] = [];
    let seeded = false;

    const seedOnce = () => {
      if (cancelled || seeded || verified.length === 0) return;
      seeded = true;
      // Only paint the slots directly when there were NO inlined avatars —
      // otherwise the inlined faces stay put and the rotation swaps live ones
      // in, so there's never a grey flash or an abrupt full-row swap.
      if (!hasInitialAvatars) {
        const used = new Set<string>();
        setSlots(
          Array.from({ length: AVATAR_SLOT_COUNT }, () => {
            const url = pickNextAvatar(used);
            if (url) used.add(url);
            return { layerA: url, layerB: url, showA: true };
          }),
        );
      }
      setPoolReady((v) => v + 1);
    };

    const workers = Array.from({ length: Math.min(parallel, queue.length) }, async () => {
      while (!cancelled && verified.length < target) {
        const url = queue.shift();
        if (!url) break;
        const ok = await preloadAvatar(url);
        if (!ok || cancelled) continue;
        verified.push(url);
        avatarPoolRef.current = verified.slice();
        refillShuffledPool();
        // Start the rotation as soon as we have a full set of live faces.
        if (verified.length >= AVATAR_SLOT_COUNT) seedOnce();
      }
    });

    void Promise.allSettled(workers).then(() => {
      if (cancelled) return;
      if (verified.length === 0) {
        // Every live URL failed. Keep the inlined avatars if we have them;
        // otherwise fall back to the raw list so the row is never empty/grey.
        if (hasInitialAvatars) {
          avatarPoolRef.current = initialAvatars.slice();
          refillShuffledPool();
          setPoolReady((v) => v + 1);
        } else {
          avatarPoolRef.current = optimizedAvatarUrls.slice();
          refillShuffledPool();
          const used = new Set<string>();
          setSlots(
            Array.from({ length: AVATAR_SLOT_COUNT }, () => {
              const url = pickNextAvatar(used);
              if (url) used.add(url);
              return { layerA: url, layerB: url, showA: true };
            }),
          );
          setPoolReady((v) => v + 1);
        }
      } else {
        seedOnce();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    optimizedAvatarsKey,
    optimizedAvatarUrls,
    refillShuffledPool,
    pickNextAvatar,
    hasInitialAvatars,
    initialAvatars,
  ]);

  useEffect(() => {
    if (avatarPoolRef.current.length <= 1) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const rotate = () => {
      setSlots((currentSlots) => {
        const pool = avatarPoolRef.current;
        if (pool.length <= 1) return currentSlots;

        const usedInFrame = new Set<string>();
        return currentSlots.map((currentSlot) => {
          const currentUrl = currentSlot.showA ? currentSlot.layerA : currentSlot.layerB;
          const blocked = new Set(usedInFrame);
          if (currentUrl) blocked.add(currentUrl);
          const nextUrl = pickNextAvatar(blocked);
          if (nextUrl) usedInFrame.add(nextUrl);

          if (!nextUrl || nextUrl === currentUrl) {
            return { ...currentSlot, showA: !currentSlot.showA };
          }

          const updated = currentSlot.showA
            ? { layerA: currentSlot.layerA, layerB: nextUrl, showA: false }
            : { layerA: nextUrl, layerB: currentSlot.layerB, showA: true };
          return updated;
        });
      });
    };
    const start = () => {
      if (!intervalId) intervalId = setInterval(rotate, 3000);
    };
    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    start();
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [poolReady, pickNextAvatar]);

  return (
    <div className="mt-9 flex justify-center">
      <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center">
          {slots.map((slotState, idx) => (
            <span
              key={`trusted-avatar-${idx}`}
              className={`${
                idx === 0 ? "ml-0" : "-ml-2.5"
              } relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/30 sm:h-9 sm:w-9 lg:h-8 lg:w-8 min-[2000px]:h-9 min-[2000px]:w-9`}
              style={{ background: placeholderColor }}
            >
              {slotState.layerA && (
                <span
                  className={`absolute inset-0 block bg-cover bg-center transform-gpu transition-opacity duration-700 ease-out ${
                    slotState.showA ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ backgroundImage: `url("${slotState.layerA}")` }}
                />
              )}
              {slotState.layerB && (
                <span
                  className={`absolute inset-0 block bg-cover bg-center transform-gpu transition-opacity duration-700 ease-out ${
                    slotState.showA ? "opacity-0" : "opacity-100"
                  }`}
                  style={{ backgroundImage: `url("${slotState.layerB}")` }}
                />
              )}
            </span>
          ))}
        </div>
        <p className="text-[15px] text-[rgb(var(--fg))] sm:text-base lg:text-[15px] min-[2000px]:text-base">
          {locale === "fr" ? "Utilisé par" : "Used by"}{" "}
          {/* Never render a bare "0" — until a real (positive) count
              resolves we show an ellipsis, so a slow/failed stats fetch
              degrades to "…" instead of the misleading "0 artists". */}
          {/* Reserve a stable width for the count so the row (and therefore the
              avatars + sign-up buttons that size with it) never changes width
              when "…" is replaced by the real number on load — no layout jump. */}
          <span className="inline-block min-w-[2.7em] text-center tabular-nums">
            {usersTotal > 0 ? numberFormatter.format(usersTotal) : "…"}
          </span>{" "}
          <span>{locale === "fr" ? "artistes & beatmakers" : "artists & producers"}</span>
        </p>
      </div>
    </div>
  );
}

/* StatCardIcon + HeroLiveStats moved to components/landing/HeroLiveStats.tsx
   (used only by the legacy landing) so this module — imported by the live
   homepage — no longer bundles them. */



type HeroSectionProps = {
  content: LandingContent;
  locale?: Locale;
  showOnyxUploader?: boolean;
  initialStats?: HeroInitialStats;
};

/* Hero product devices (desktop window + phone). Rendered CLIENT-SIDE only —
   the ~1 MB of video is kept entirely out of the server HTML, so the first
   paint and the browser's loading/progress bar finish instantly on every
   device. After hydration the right variant mounts:

   - Desktop: in the hero, eager, sliding in on mount (the CSS hero-slide-*).
   - Mobile: parked off-screen (computer far left, phone far right) and pushed
     well below the fold. The <LoopingVideo>s are only mounted — and therefore
     only loaded — once the container scrolls into view, at which point the
     devices slide in (computer → right, phone → left). Nothing video-related
     downloads on the initial mobile visit. */
function HeroDevices() {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    setMounted(true);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Warm the two device posters (tiny webps, ~42 KB) right AFTER the page's
  // load event — off the critical path, but cached before the user scrolls
  // down to the devices on mobile, so they show the frame instantly (never
  // grey) the moment they slide in.
  useEffect(() => {
    const warm = () => {
      for (const src of ["/landing/features/computer.webp", "/landing/features/phone.webp"]) {
        const img = new window.Image();
        img.decoding = "async";
        img.src = src;
      }
    };
    const schedule = () => {
      const ric = (window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
      }).requestIdleCallback;
      if (ric) ric(warm, { timeout: 2000 });
      else setTimeout(warm, 300);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
  }, []);

  const mobileRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!mounted || isDesktop) return;
    const el = mobileRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRevealed(true);
            io.disconnect();
            break;
          }
        }
      },
      // Fire when ~15% of the devices scroll into view — they then mount
      // (start loading) and slide in. No rootMargin, so nothing loads while
      // they're still parked below the fold.
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted, isDesktop]);

  // SSR + first paint: reserved, empty box — no video resources requested.
  if (!mounted) {
    return <div className="relative aspect-[5/4] w-full" aria-hidden />;
  }

  if (isDesktop) {
    return (
      <div className="relative aspect-[5/4] w-full">
        {/* Computer — back, vertically centered on the phone. The wrapper
            reserves the clip's exact 660×414 aspect ratio so its height is
            fixed from first paint — no resize/“jump” once the video loads. */}
        <div className="absolute left-0 top-1/2 aspect-[660/414] w-[74%] hero-slide-left overflow-hidden rounded-[14px] bg-[rgb(var(--ov)_/_0.04)] [outline:2px_solid_rgb(var(--ov)_/_0.16)]">
          <LoopingVideo
            src="/landing/features/computer"
            poster="/landing/features/computer.webp"
            mp4Only
            className="absolute inset-0 block h-full w-full object-cover rounded-[14px]"
            eager
          />
        </div>
        {/* Phone — front, up and to the right. Reserves the 420×856 ratio. */}
        <div className="absolute right-[3%] top-1/2 z-10 aspect-[420/856] w-[38%] hero-slide-right overflow-hidden rounded-[22px] bg-[rgb(var(--ov)_/_0.04)] [outline:2px_solid_rgb(var(--ov)_/_0.16)]">
          <LoopingVideo
            src="/landing/features/phone"
            poster="/landing/features/phone.webp"
            mp4Only
            className="absolute inset-0 block h-full w-full object-cover rounded-[22px]"
            eager
          />
        </div>
      </div>
    );
  }

  // Mobile — off-screen until scrolled into view, then slide in + load.
  return (
    <div ref={mobileRef} className="relative aspect-[5/4] w-full">
      <div
        className="absolute left-0 top-1/2 aspect-[660/414] w-[74%] overflow-hidden rounded-[14px] bg-[rgb(var(--ov)_/_0.04)] [outline:2px_solid_rgb(var(--ov)_/_0.16)] will-change-transform"
        style={{ transform: revealed ? "translate(0, -50%)" : "translate(-145%, -50%)", transition: "transform 1800ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        {revealed && (
          <LoopingVideo
            src="/landing/features/computer"
            poster="/landing/features/computer.webp"
            mp4Only
            className="absolute inset-0 block h-full w-full object-cover rounded-[14px]"
          />
        )}
      </div>
      <div
        className="absolute right-[3%] top-1/2 z-10 aspect-[420/856] w-[38%] overflow-hidden rounded-[22px] bg-[rgb(var(--ov)_/_0.04)] [outline:2px_solid_rgb(var(--ov)_/_0.16)] will-change-transform"
        style={{ transform: revealed ? "translate(0, -50%)" : "translate(145%, -50%)", transition: "transform 1800ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        {revealed && (
          <LoopingVideo
            src="/landing/features/phone"
            poster="/landing/features/phone.webp"
            mp4Only
            className="absolute inset-0 block h-full w-full object-cover rounded-[22px]"
          />
        )}
      </div>
    </div>
  );
}

export function HeroSection({ locale = "en", initialStats }: HeroSectionProps) {
  const { stats } = useLandingStats(initialStats);
  const fr = locale === "fr";

  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto w-full max-w-[min(92vw,1200px)] px-5 pb-16 pt-[150px] sm:px-8 sm:pt-[180px] lg:px-10 lg:pb-20 lg:pt-[200px]">
        {/* TOP ROW — headline + proof + sign-up on the left, description on the
            right (ElevenLabs structure). Stacks to one column on mobile. */}
        {/* Headline + description — vertically centered with each other
            (ElevenLabs' top row). */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <h1 className="font-display max-w-[680px] text-[2.4rem] font-normal leading-[1.04] tracking-tight text-[rgb(var(--fg))] sm:text-[2.6rem] lg:text-[2.9rem]">
            <span className="block">{fr ? "Gère ta" : "Run your"}</span>
            <span className="block">{fr ? "musique comme un business" : "music like a business"}</span>
          </h1>
          {/* Description — center-aligned with the headline */}
          <div className="lg:max-w-[460px] lg:shrink-0">
            <p className="text-[16px] leading-relaxed text-[rgb(var(--fg)_/_0.6)] lg:text-[17px]">
              {fr
                ? "Envoie tes emails pour obtenir des téléchargements. Suis les ouvertures, écoutes et plus, le tout depuis un espace soigné et sécurisé pensé pour rester fluide."
                : "Send your emails to get downloads. Track opens, plays and more, all from a beautifully crafted, secure workspace designed to feel effortless."}
            </p>
          </div>
        </div>

        {/* Trusted-by + sign-up — left-aligned, close under the headline. */}
        <div className="mt-6 flex flex-col items-start text-left">

            {/* "Used by N artists & producers" — sits directly below the
                headline (claude's subtitle slot). */}
            <HeroTrustedBy
              locale={locale}
              usersTotal={stats.usersTotal}
              avatarUrls={stats.avatarUrls}
              initialAvatars={initialStats?.avatarDataUris ?? NO_AVATARS}
            />

            {/* Sign-up — Google (filled) first, then Apple + Email as icon
                buttons that smoothly expand to their full label on hover. */}
            <div className="mt-9 flex flex-wrap items-center gap-2.5">
              {/* Continue with Google — filled pill */}
              <a
                href="https://vvault.app/auth/google"
                onClick={() => trackButtonClick({ buttonId: "hero.continue_google", surface: "landing.hero", locale, href: "https://vvault.app/auth/google" })}
                className="inline-flex items-center gap-2.5 rounded-full bg-[rgb(var(--inv))] px-6 py-3.5 text-[15px] font-semibold text-[rgb(var(--inv-fg))] hover:bg-[rgb(var(--ov)_/_0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ov)_/_0.4)]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {fr ? "Continuer avec Google" : "Continue with Google"}
              </a>

              {/* Continue with Apple — icon only; expands to full label on hover */}
              <a
                href="https://vvault.app/signup"
                onClick={() => trackButtonClick({ buttonId: "hero.continue_apple", surface: "landing.hero", locale, href: "https://vvault.app/signup" })}
                aria-label={fr ? "Continuer avec Apple" : "Continue with Apple"}
                className="group inline-flex items-center overflow-hidden rounded-full border border-[rgb(var(--ov)_/_0.2)] px-3.5 py-3.5 text-[15px] font-semibold text-[rgb(var(--fg))] hover:border-[rgb(var(--ov)_/_0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ov)_/_0.3)]"
              >
                <svg viewBox="0 0 384 512" className="h-5 w-5 shrink-0 -translate-y-px" fill="currentColor" aria-hidden="true">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-hover:ml-2.5 group-hover:max-w-[170px] group-hover:opacity-100">
                  {fr ? "Continuer avec Apple" : "Continue with Apple"}
                </span>
              </a>

              {/* Continue with Email — icon only; expands to full label on hover */}
              <a
                href="https://vvault.app/signup"
                onClick={() => trackButtonClick({ buttonId: "hero.continue_email", surface: "landing.hero", locale, href: "https://vvault.app/signup" })}
                aria-label={fr ? "Continuer avec email" : "Continue with Email"}
                className="group inline-flex items-center overflow-hidden rounded-full border border-[rgb(var(--ov)_/_0.2)] px-3.5 py-3.5 text-[15px] font-semibold text-[rgb(var(--fg))] hover:border-[rgb(var(--ov)_/_0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ov)_/_0.3)]"
              >
                <svg viewBox="-8 -8 256 256" className="h-5 w-5 shrink-0 -translate-y-px" fill="none" stroke="currentColor" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 120c0 -37.7124 0 -56.5685 11.7157 -68.2843C43.4315 40 62.2876 40 100 40h40c37.712 0 56.569 0 68.284 11.7157C220 63.4315 220 82.2876 220 120c0 37.712 0 56.569 -11.716 68.284C196.569 200 177.712 200 140 200h-40c-37.7124 0 -56.5685 0 -68.2843 -11.716C20 176.569 20 157.712 20 120Z" />
                  <path d="m60 80 21.589 17.9908C99.9553 113.296 109.139 120.949 120 120.949s20.045 -7.653 38.411 -22.9582L180 80" />
                </svg>
                <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-hover:ml-2.5 group-hover:max-w-[170px] group-hover:opacity-100">
                  {fr ? "Continuer avec email" : "Continue with Email"}
                </span>
              </a>
            </div>

            {/* Privacy line */}
            <p className="mt-4 text-[12px] leading-relaxed text-[rgb(var(--fg)_/_0.4)]">
              {fr ? "En continuant, tu acceptes la " : "By continuing, you acknowledge vvault's "}
              <a href="/privacy" className="text-[rgb(var(--fg)_/_0.55)] underline underline-offset-2 hover:no-underline">
                {fr ? "Politique de confidentialité" : "Privacy Policy"}
              </a>
              {fr ? " de vvault." : "."}
            </p>
        </div>

        {/* SHOWCASE — full-width product video with a Computer / iPhone switch.
            Only the active video loads; the other loads the first time it's
            picked. */}
        <HeroShowcase locale={locale} />
      </div>
    </section>
  );
}

/* Switchable product showcase — one full-length video at a time. The visible
   device's clip is the only one that loads on first paint (mobile → iPhone,
   desktop → Computer); the other only mounts (and starts loading) the first
   time its tab is selected. */
function HeroShowcase({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";
  const [mounted, setMounted] = useState(false);
  const [device, setDevice] = useState<"computer" | "iphone">("computer");

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    setDevice(isMobile ? "iphone" : "computer");
    setMounted(true);
  }, []);

  const tab = (active: boolean) =>
    `rounded-full px-5 py-2 text-[14px] font-medium focus-visible:outline-none ${
      active
        ? "bg-[rgb(var(--ov)_/_0.1)] text-[rgb(var(--fg))]"
        : "text-[rgb(var(--fg)_/_0.55)] hover:text-[rgb(var(--fg))]"
    }`;

  return (
    <div className="mt-12 lg:mt-16">
      {/* Computer / iPhone switch — centered, no outline, grey active pill */}
      <div className="mb-7 flex justify-center">
        <div className="inline-flex rounded-full p-1">
          <button type="button" onClick={() => setDevice("computer")} className={tab(device === "computer")}>
            {fr ? "Ordinateur" : "Computer"}
          </button>
          <button type="button" onClick={() => setDevice("iphone")} className={tab(device === "iphone")}>
            iPhone
          </button>
        </div>
      </div>

      {/* Just the clip at its NATIVE aspect — rounded corners + a hairline
          outline, no surrounding container. Computer spans the full width (edge
          to edge with the nav); iPhone is centered. Only the ACTIVE clip is
          mounted, so switching tabs unmounts the old <video> and mounts a fresh
          one that reloads from the very beginning (minimal memory + network). */}
      {!mounted ? (
        <div className="relative aspect-[1724/1080] w-full overflow-hidden rounded-[18px] [outline:1px_solid_rgb(var(--ov)_/_0.12)]">
          <img src="/landing/features/computer.webp" alt="" aria-hidden className="absolute inset-0 block h-full w-full object-cover" />
        </div>
      ) : device === "computer" ? (
        <div className="relative aspect-[1724/1080] w-full overflow-hidden rounded-[18px] [outline:1px_solid_rgb(var(--ov)_/_0.12)]">
          <LoopingVideo key="computer" src="/landing/features/computer" poster="/landing/features/computer.webp" mp4Only eager className="absolute inset-0 block h-full w-full object-cover" />
        </div>
      ) : (
        <div className="relative mx-auto aspect-[1206/2460] w-full max-w-[300px] overflow-hidden rounded-[30px] [outline:1px_solid_rgb(var(--ov)_/_0.12)]">
          <LoopingVideo key="iphone" src="/landing/features/phone" poster="/landing/features/phone.webp" mp4Only eager className="absolute inset-0 block h-full w-full object-cover" />
        </div>
      )}
    </div>
  );
}
