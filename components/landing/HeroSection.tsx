"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LandingContent, Locale } from "@/components/landing/content";
import { LoopingVideo } from "@/components/landing/LoopingVideo";
import { MacBookFrame, IPhoneFrame } from "@/components/landing/DeviceFrames";
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
    <div className="flex justify-start">
      <div className="flex flex-row items-center gap-3 text-left">
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
      <div className="relative z-10 mx-auto w-full max-w-[min(92vw,1220px)] px-5 pb-36 pt-[150px] sm:px-8 sm:pb-44 sm:pt-[180px] lg:px-10 lg:pb-60 lg:pt-[200px]">
        {/* TOP ROW — headline left, description right (ElevenLabs structure).
            Stacks to one column on mobile. */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          {/* LEFT — headline, social proof, sign-up (tight stack). */}
          <div className="flex max-w-[640px] flex-col items-start text-left">
            <h1 className="font-display text-[clamp(1.65rem,7vw,2.9rem)] font-normal leading-[1.06] tracking-tight text-[rgb(var(--fg))]">
              <span className="block">{fr ? "Gère ta musique" : "Run your"}</span>
              <span className="block">{fr ? "comme un business" : "music like a business"}</span>
            </h1>

            {/* Description — on MOBILE it sits right under the headline; on desktop
                it lives in the right column (hidden here). */}
            <p className="mt-6 max-w-[460px] text-[15px] leading-relaxed text-[rgb(var(--fg))] lg:hidden">
              {fr
                ? "La seule plateforme pensée pour gérer tout ton business musical. Suis chaque ouverture, écoute et téléchargement en direct, transforme tes écoutes en ventes et garde ton catalogue à toi."
                : "The only platform built to run your entire music business. Track every open, play and download in real time, turn listens into sales, and keep your catalog provably yours."}
            </p>

            {/* "Used by N artists & producers" — gap to the headline is offset
                by ~12px (the headline's line-descent) so the visual space above
                and below this row reads equal. */}
            <div className="mt-7">
              <HeroTrustedBy
                locale={locale}
                usersTotal={stats.usersTotal}
                avatarUrls={stats.avatarUrls}
                initialAvatars={initialStats?.avatarDataUris ?? NO_AVATARS}
              />
            </div>

            {/* Sign-up — Google (filled) first, then Apple + Email as icon-only
                circles, all on ONE row (no wrap). */}
            <div className="mt-7 flex flex-nowrap items-center gap-2 sm:gap-2.5">
              {/* Continue with Google — filled pill */}
              <a
                href="https://vvault.app/auth/google"
                onClick={() => trackButtonClick({ buttonId: "hero.continue_google", surface: "landing.hero", locale, href: "https://vvault.app/auth/google" })}
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[rgb(var(--inv))] px-4 text-[13px] font-semibold text-[rgb(var(--inv-fg))] hover:bg-[color-mix(in_srgb,rgb(var(--inv)),rgb(var(--bg))_10%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ov)_/_0.4)] sm:h-[50px] sm:gap-2.5 sm:px-6 sm:text-[15px]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {fr ? "Continuer avec Google" : "Continue with Google"}
              </a>

              {/* Continue with Apple — icon-only circle on mobile; on desktop it
                  expands to the full label on hover. flex-nowrap row keeps the
                  expansion from wrapping (which is what caused the old flicker). */}
              <a
                href="https://vvault.app/signup"
                onClick={() => trackButtonClick({ buttonId: "hero.continue_apple", surface: "landing.hero", locale, href: "https://vvault.app/signup" })}
                aria-label={fr ? "Continuer avec Apple" : "Continue with Apple"}
                className="group inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgb(var(--ov)_/_0.2)] text-[rgb(var(--fg))] hover:border-[rgb(var(--ov)_/_0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ov)_/_0.3)] sm:h-[50px] sm:w-[50px] lg:w-auto lg:justify-start lg:px-3.5 lg:text-[15px] lg:font-semibold"
              >
                <svg viewBox="0 0 384 512" className="h-5 w-5 shrink-0 -translate-y-px" fill="currentColor" aria-hidden="true">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                <span className="hidden max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-300 ease-out lg:inline-block lg:group-hover:ml-2.5 lg:group-hover:max-w-[160px] lg:group-hover:opacity-100">
                  {fr ? "Continuer avec Apple" : "Continue with Apple"}
                </span>
              </a>

              {/* Continue with Email — icon-only circle on mobile; expands on
                  hover on desktop. */}
              <a
                href="https://vvault.app/signup"
                onClick={() => trackButtonClick({ buttonId: "hero.continue_email", surface: "landing.hero", locale, href: "https://vvault.app/signup" })}
                aria-label={fr ? "Continuer avec email" : "Continue with Email"}
                className="group inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgb(var(--ov)_/_0.2)] text-[rgb(var(--fg))] hover:border-[rgb(var(--ov)_/_0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ov)_/_0.3)] sm:h-[50px] sm:w-[50px] lg:w-auto lg:justify-start lg:px-3.5 lg:text-[15px] lg:font-semibold"
              >
                <svg viewBox="-8 -8 256 256" className="h-5 w-5 shrink-0 -translate-y-px" fill="none" stroke="currentColor" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 120c0 -37.7124 0 -56.5685 11.7157 -68.2843C43.4315 40 62.2876 40 100 40h40c37.712 0 56.569 0 68.284 11.7157C220 63.4315 220 82.2876 220 120c0 37.712 0 56.569 -11.716 68.284C196.569 200 177.712 200 140 200h-40c-37.7124 0 -56.5685 0 -68.2843 -11.716C20 176.569 20 157.712 20 120Z" />
                  <path d="m60 80 21.589 17.9908C99.9553 113.296 109.139 120.949 120 120.949s20.045 -7.653 38.411 -22.9582L180 80" />
                </svg>
                <span className="hidden max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-300 ease-out lg:inline-block lg:group-hover:ml-2.5 lg:group-hover:max-w-[160px] lg:group-hover:opacity-100">
                  {fr ? "Continuer avec email" : "Continue with Email"}
                </span>
              </a>
            </div>

            {/* Privacy line */}
            <p className="mt-5 text-[12px] leading-relaxed text-[rgb(var(--fg)_/_0.4)]">
              {fr ? "En continuant, tu acceptes la " : "By continuing, you acknowledge vvault's "}
              <a href="/privacy" className="text-[rgb(var(--fg)_/_0.55)] underline underline-offset-2 hover:no-underline">
                {fr ? "Politique de confidentialité" : "Privacy Policy"}
              </a>
              {fr ? " de vvault." : "."}
            </p>
          </div>

          {/* RIGHT — supporting description (ElevenLabs' top-right slot), desktop
              only; on mobile the copy sits under the headline instead. */}
          <div className="hidden lg:block lg:max-w-[580px] lg:shrink-0 lg:pt-2">
            <p className="text-[15px] leading-relaxed text-[rgb(var(--fg))]">
              {fr
                ? "La seule plateforme pensée pour gérer tout ton business musical. Suis chaque ouverture, écoute et téléchargement en direct, transforme tes écoutes en ventes et garde ton catalogue à toi."
                : "The only platform built to run your entire music business. Track every open, play and download in real time, turn listens into sales, and keep your whole catalog provably yours."}
            </p>
          </div>
        </div>

        {/* SHOWCASE — full-width product video with a Computer / iPhone switch.
            Only the active video loads; the other loads the first time it's
            picked. */}
        <HeroShowcase locale={locale} />

        {/* Live vvault stats — count up into view, re-poll for a "live" feel. */}
        <HeroStats locale={locale} />
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
    // Warm BOTH posters + (low-priority) the other device's clip so toggling
    // never shows a black box: the tiny poster paints instantly and the mp4 is
    // already cached by the time you switch. Done after load + idle, off the
    // critical path. <link> tags stay in the DOM so the fetch always completes.
    const warm = () => {
      const add = (rel: string, href: string, as?: string) => {
        if (document.querySelector(`link[href="${href}"]`)) return;
        const l = document.createElement("link");
        l.rel = rel;
        l.href = href;
        if (as) l.as = as;
        document.head.appendChild(l);
      };
      add("preload", "/landing/features/computer.webp", "image");
      add("preload", "/landing/features/phone.webp", "image");
      add("prefetch", isMobile ? "/landing/features/computer.mp4" : "/landing/features/phone.mp4");
    };
    if (document.readyState === "complete") setTimeout(warm, 600);
    else window.addEventListener("load", () => setTimeout(warm, 600), { once: true });
  }, []);

  const tabBtn = (active: boolean) =>
    `flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none ${
      active ? "bg-[rgb(var(--switch-active))]" : "hover:bg-[rgb(var(--switch-fg)_/_0.06)]"
    }`;
  // Icons contrast with the pill (black pill in dark, white in light). Solid
  // (full-opacity) colors so overlapping strokes never darken: active = full
  // switch-fg, inactive = muted.
  const iconColor = (active: boolean) =>
    active ? "rgb(var(--switch-fg))" : "rgb(var(--switch-fg-muted))";

  const laptopIcon = (
    <svg viewBox="-2 -2 64 64" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-[22px] w-[22px]">
      <path d="M49.11775 38.83925H10.88235m38.2354 0V20c0 -4.71405 0 -7.071075 -1.4645 -8.535525C46.18875 10 43.83175 10 39.11775 10H20.88235c-4.71405 0 -7.071075 0 -8.535525 1.464475C10.88235 12.928925 10.88235 15.28595 10.88235 20v18.83925m38.2354 0 4.36 4.50025c0.111 0.115 0.167 0.1725 0.219 0.2295 0.80275 0.8815 1.264 2.0205 1.30075 3.212 0.0025 0.07725 0.0025 0.15725 0.0025 0.31725 0 0.373 0 0.5595 -0.01 0.717 -0.15875 2.51325 -2.1615 4.516 -4.67475 4.67475 -0.1575 0.01 -0.344 0.01 -0.717 0.01H10.4017c-0.373 0 -0.5595 0 -0.717 -0.01 -2.513075 -0.15875 -4.515975 -2.1615 -4.67475 -4.67475C5 47.65775 5 47.47125 5 47.09825c0 -0.16 0 -0.24 0.0024 -0.31725 0.036825 -1.1915 0.49815 -2.3305 1.300775 -3.212 0.052025 -0.057 0.107775 -0.1145 0.219025 -0.2295l4.36015 -4.50025" />
      <path d="M23.75 46.25h12.5" />
      <path d="M31.875 16.875c0 1.035525 -0.8395 1.875 -1.875 1.875s-1.875 -0.839475 -1.875 -1.875S28.9645 15 30 15s1.875 0.839475 1.875 1.875Z" fill="currentColor" stroke="none" />
    </svg>
  );
  const iphoneIcon = (
    <svg viewBox="-2 -2 64 64" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-[22px] w-[22px]">
      <path d="M10 25c0 -9.4281 0 -14.142125 2.928925 -17.071075C15.857875 5 20.5719 5 30 5c9.428 0 14.14225 0 17.071 2.928925C50 10.857875 50 15.5719 50 25v10c0 9.428 0 14.14225 -2.929 17.071C44.14225 55 39.428 55 30 55c-9.4281 0 -14.142125 0 -17.071075 -2.929C10 49.14225 10 44.428 10 35v-10Z" />
      <path d="M37.5 47.5H22.5" />
      <path d="m41.8705 5.9436 -0.21025 0.315425c-1.89025 2.8352 -2.83525 4.252875 -4.21575 5.11065 -0.2745 0.17055 -0.55975 0.3232 -0.85375 0.456975 -1.4795 0.67275 -3.18325 0.67275 -6.59075 0.67275 -3.4075 0 -5.11135 0 -6.590775 -0.67275 -0.294175 -0.133775 -0.5794 -0.286425 -0.853875 -0.456975 -1.3804 -0.857775 -2.325475 -2.2754 -4.21565 -5.11065l-0.210275 -0.315425" />
    </svg>
  );

  return (
    <div className="relative mt-12 lg:mt-16">
      {/* Computer / iPhone switch — a horizontal pill centered above the stage on
          mobile; a vertical pill just OUTSIDE the video's left edge on desktop,
          vertically centered against it. */}
      <div className="mx-auto mb-6 flex w-fit flex-row gap-1.5 rounded-full bg-[rgb(var(--switch-pill))] p-1.5 lg:absolute lg:left-0 lg:top-1/2 lg:z-10 lg:mx-0 lg:mb-0 lg:w-auto lg:-translate-x-[calc(100%+14px)] lg:-translate-y-1/2 lg:flex-col">
        <button type="button" aria-label={fr ? "Ordinateur" : "Computer"} aria-pressed={device === "computer"} onClick={() => setDevice("computer")} className={tabBtn(device === "computer")} style={{ color: iconColor(device === "computer") }}>
          {laptopIcon}
        </button>
        <button type="button" aria-label="iPhone" aria-pressed={device === "iphone"} onClick={() => setDevice("iphone")} className={tabBtn(device === "iphone")} style={{ color: iconColor(device === "iphone") }}>
          {iphoneIcon}
        </button>
      </div>

      {/* Device stage. On desktop it's a fixed-aspect box so the MacBook fills it
          and the iPhone (centered, h-full) is the SAME height — no shift when
          toggling. On mobile each device sizes naturally (iPhone capped by
          width) so the phone never gets squished. Only the active clip is
          mounted; it remounts (from frame 0) on switch. */}
      <div className="relative w-full lg:aspect-[1724/1125]">
        {!mounted ? (
          <div className="lg:absolute lg:inset-0 lg:flex lg:items-center">
            <MacBookFrame>
              <img src="/landing/features/computer.webp" alt="" aria-hidden className="absolute inset-0 block h-full w-full object-cover" />
            </MacBookFrame>
          </div>
        ) : device === "computer" ? (
          <div className="lg:absolute lg:inset-0 lg:flex lg:items-center">
            <MacBookFrame>
              <LoopingVideo key="computer" src="/landing/features/computer" poster="/landing/features/computer.webp" mp4Only eager fadeIn={false} className="absolute inset-0 block h-full w-full object-cover" />
            </MacBookFrame>
          </div>
        ) : (
          <div className="flex justify-center lg:absolute lg:inset-0 lg:items-center">
            <IPhoneFrame className="w-[min(72vw,300px)] lg:h-full lg:w-auto">
              <LoopingVideo key="iphone" src="/landing/features/phone" poster="/landing/features/phone.webp" mp4Only eager fadeIn={false} className="absolute inset-0 block h-full w-full object-cover" />
            </IPhoneFrame>
          </div>
        )}
      </div>
    </div>
  );
}

/* Live vvault metrics shown below the hero video. Numbers count up the first
   time the strip scrolls into view, then re-poll /api/landing-stats every 30s
   and smoothly tick to the new totals — so a long-open tab keeps "counting". */
type LandingMetrics = {
  usersTotal: number;
  tracksTotal: number;
  downloadsTotal: number;
  emailsSentTotal: number;
};

function AnimatedStat({
  value,
  active,
  locale,
  suffix = "",
}: {
  value: number;
  active: boolean;
  locale: Locale;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const from = fromRef.current;
    const to = value;
    if (from === to) {
      setDisplay(to);
      return;
    }
    const duration = 1500;
    let startTs: number | null = null;
    const step = (ts: number) => {
      if (startTs === null) startTs = ts;
      const t = Math.min(1, (ts - startTs) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, active]);

  const formatted = useMemo(
    () => new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US").format(display),
    [display, locale],
  );

  return (
    <span className="tabular-nums">
      {formatted}
      {suffix}
    </span>
  );
}

function HeroStats({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";
  const [metrics, setMetrics] = useState<LandingMetrics | null>(null);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Count up only once the strip is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Fetch the live totals, then keep them fresh.
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/landing-stats", { cache: "no-store" });
        if (!res.ok || !active) return;
        const d = await res.json();
        if (!active) return;
        const n = (v: unknown) => Math.max(0, Math.floor(Number(v) || 0));
        setMetrics({
          usersTotal: n(d.usersTotal),
          tracksTotal: n(d.tracksTotal),
          downloadsTotal: n(d.downloadsTotal),
          emailsSentTotal: n(d.emailsSentTotal),
        });
      } catch {
        // leave whatever we have
      }
    };
    void load();
    const id = window.setInterval(load, 30000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  // Icons are the Streamline Solar set, inlined with currentColor.
  const items: { value: number; label: string; suffix?: string; icon: React.ReactNode }[] = [
    {
      value: metrics?.usersTotal ?? 0,
      label: fr ? "Producteurs & artistes" : "Producers & Artists",
      suffix: "+",
      icon: (
        <svg viewBox="-2 -2 64 64" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-6 w-6">
          <path d="M20 15a10 10 0 1 0 20 0 10 10 0 1 0 -20 0" />
          <path d="M45 22.5c4.14225 0 7.5 -2.79822 7.5 -6.25S49.14225 10 45 10" />
          <path d="M15 22.5C10.857875 22.5 7.5 19.701775 7.5 16.25S10.857875 10 15 10" />
          <path d="M15 42.5a15 10 0 1 0 30 0 15 10 0 1 0 -30 0" />
          <path d="M50 47.5c4.3855 -0.96175 7.5 -3.39725 7.5 -6.25s-3.1145 -5.28825 -7.5 -6.25" />
          <path d="M10 47.5c-4.385625 -0.96175 -7.5 -3.39725 -7.5 -6.25s3.114375 -5.28825 7.5 -6.25" />
        </svg>
      ),
    },
    {
      value: metrics?.tracksTotal ?? 0,
      label: fr ? "Sons hébergés" : "Tracks hosted",
      icon: (
        <svg viewBox="-2 -2 64 64" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-6 w-6">
          <path d="M5.958775 34.4825c-1.115075 -7.909 -1.6726 -11.863375 0.697025 -14.422925C9.025425 17.5 13.24395 17.5 21.680975 17.5h16.638025c8.437 0 12.6555 0 15.02525 2.559575 2.3695 2.55955 1.812 6.513925 0.697 14.422925l-1.0575 7.5c-0.8745 6.20225 -1.3115 9.30325 -3.5545 11.1605C47.18625 55 43.878 55 37.2615 55H22.7384c-6.616375 0 -9.924575 0 -12.16755 -1.857 -2.242975 -1.85725 -2.6802 -4.95825 -3.55465 -11.1605l-1.057425 -7.5Z" />
          <path d="M48.90475 17.5c0.5715 -3.261925 -1.9385 -6.25 -5.25 -6.25H16.34515C13.033525 11.25 10.5235 14.238075 11.095075 17.5" />
          <path d="M43.75 11.25c0.071 -0.6477 0.1065 -0.971625 0.107 -1.239125 0.0055 -2.559075 -1.922 -4.709275 -4.4665 -4.982325C39.1245 5 38.79875 5 38.147 5H21.852625c-0.6516 0 -0.977425 0 -1.243425 0.02855 -2.54445 0.27305 -4.472025 2.42325 -4.46645 4.9823 0.000575 0.267525 0.03605 0.5914 0.106975 1.23915" />
          <path d="M37.5 28.75a3.75 3.75 0 1 0 7.5 0 3.75 3.75 0 1 0 -7.5 0" />
          <path d="m50 50 -7.2105 -5.3715c-2.32525 -1.732 -5.788 -1.9045 -8.3475 -0.41575l-0.667 0.388c-1.77875 1.03475 -4.1985 0.86125 -5.73575 -0.41125l-9.5955 -7.94225c-1.9152 -1.58525 -4.987325 -1.67 -7.0257 -0.19375l-3.309825 2.39725" />
        </svg>
      ),
    },
    {
      value: metrics?.downloadsTotal ?? 0,
      label: fr ? "Fichiers téléchargés" : "Files downloaded",
      icon: (
        <svg viewBox="-2 -2 64 64" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-6 w-6">
          <path d="M7.5 37.5c0 7.071 0 10.6065 2.1967 12.80325C11.8934 52.5 15.428925 52.5 22.5 52.5h15c7.071 0 10.6065 0 12.80325 -2.19675C52.5 48.1065 52.5 44.571 52.5 37.5" />
          <path d="M30 7.5v32.5m0 0 10 -10.9375M30 40l-10 -10.9375" />
        </svg>
      ),
    },
    {
      value: metrics?.emailsSentTotal ?? 0,
      label: fr ? "Emails envoyés" : "Emails sent",
      icon: (
        <svg viewBox="-2 -2 64 64" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-6 w-6">
          <path d="M5 30c0 -9.4281 0 -14.142125 2.928925 -17.071075C10.857875 10 15.5719 10 25 10h10c9.428 0 14.14225 0 17.071 2.928925C55 15.857875 55 20.5719 55 30c0 9.428 0 14.14225 -2.929 17.071C49.14225 50 44.428 50 35 50h-10c-9.4281 0 -14.142125 0 -17.071075 -2.929C5 44.14225 5 39.428 5 30Z" />
          <path d="m15 20 5.39725 4.4977C24.988825 28.324 27.28475 30.23725 30 30.23725s5.01125 -1.91325 9.60275 -5.73955L45 20" />
        </svg>
      ),
    },
  ];

  const active = inView && metrics !== null;

  return (
    <div
      ref={ref}
      className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 border-t border-[rgb(var(--ov)_/_0.08)] pt-12 sm:grid-cols-4 lg:mt-20"
    >
      {items.map((it) => (
        <div key={it.label} className="flex flex-col items-center text-center">
          {/* Solid (full-opacity) muted color via color-mix so overlapping
              strokes don't darken where they cross (the low-opacity artifact). */}
          <div className="mb-3" style={{ color: "color-mix(in srgb, rgb(var(--fg)) 55%, rgb(var(--bg)))" }}>{it.icon}</div>
          <div className="font-display text-[2rem] leading-none text-[rgb(var(--fg))] sm:text-[2.6rem] lg:text-[3rem]">
            <AnimatedStat value={it.value} active={active} locale={locale} suffix={it.suffix} />
          </div>
          <div className="mt-2.5 text-[12.5px] font-medium text-[rgb(var(--fg)_/_0.5)] sm:text-[13.5px]">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}
