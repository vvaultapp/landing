"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LandingContent, LandingNavItem, Locale } from "@/components/landing/content";
import { NavDropdown } from "@/components/landing/LandingNav";
import { LoopingVideo } from "@/components/landing/LoopingVideo";
import { trackButtonClick } from "@/lib/analytics/client";

export type LandingStatsResponse = {
  emailsSentTotal: number;
  usersTotal: number;
  tracksTotal: number;
  moneyPaidTotalCents: number;
  appStoreReviewLabel: string;
  avatarUrls: string[];
};

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

const AVATAR_PRELOAD_PARALLEL = 10;
const AVATAR_PRELOAD_PARALLEL_SLOW = 4;

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

export function useLandingStats() {
  const [stats, setStats] = useState<LandingStatsResponse>(LANDING_STATS_FALLBACK);
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
        const res = await fetch("/api/landing-stats", { cache: "no-store" });
        if (!res.ok || !active) return;

        const payload = (await res.json()) as Partial<LandingStatsResponse>;
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

    void loadStats();

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
  loaded,
  avatarUrls,
}: {
  locale: Locale;
  usersTotal: number;
  loaded: boolean;
  avatarUrls: string[];
}) {
  const AVATAR_SLOT_COUNT = 5;
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
  const avatarPoolRef = useRef<string[]>(optimizedAvatarUrls);
  const shuffledPoolRef = useRef<string[]>([]);
  const shuffleCursorRef = useRef(0);
  const placeholderGradients = [
    "linear-gradient(to bottom right, rgba(110,231,183,0.7), rgba(20,184,166,0.6))",
    "linear-gradient(to bottom right, rgba(147,197,253,0.7), rgba(59,130,246,0.6))",
    "linear-gradient(to bottom right, rgba(251,207,232,0.7), rgba(244,114,182,0.6))",
    "linear-gradient(to bottom right, rgba(252,211,77,0.7), rgba(245,158,11,0.6))",
    "linear-gradient(to bottom right, rgba(216,180,254,0.7), rgba(168,85,247,0.6))",
  ];
  const [slots, setSlots] = useState<Array<{ layerA: string; layerB: string; showA: boolean }>>(
    Array.from({ length: AVATAR_SLOT_COUNT }, () => ({ layerA: "", layerB: "", showA: true })),
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

  useEffect(() => {
    let cancelled = false;
    avatarPoolRef.current = optimizedAvatarUrls;
    refillShuffledPool();

    if (optimizedAvatarUrls.length === 0) {
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
    // Preload only a small working set (the 5 visible slots + a few for the
    // first rotations), to keep the on-load request count tiny.
    const preloadQueue = shuffleStrings(optimizedAvatarUrls.slice(0, 8));
    const preloadParallel = Math.min(
      preloadQueue.length,
      isSlow ? AVATAR_PRELOAD_PARALLEL_SLOW : AVATAR_PRELOAD_PARALLEL,
    );

    const failedUrls = new Set<string>();
    const workers = Array.from({ length: preloadParallel }, async () => {
      while (!cancelled) {
        const next = preloadQueue.pop();
        if (!next) break;
        const ok = await preloadAvatar(next);
        if (!ok) failedUrls.add(next);
      }
    });

    void Promise.allSettled(workers).then(() => {
      if (cancelled || failedUrls.size === 0) return;
      const cleaned = avatarPoolRef.current.filter((u) => !failedUrls.has(u));
      if (cleaned.length > 0) {
        avatarPoolRef.current = cleaned;
        refillShuffledPool();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [optimizedAvatarsKey, optimizedAvatarUrls, refillShuffledPool]);

  useEffect(() => {
    const pool = avatarPoolRef.current;
    if (pool.length === 0) return;

    const seededUrls = new Set<string>();
    const seeded = Array.from({ length: AVATAR_SLOT_COUNT }, () => {
      const blocked = new Set(seededUrls);
      const url = pickNextAvatar(blocked);
      if (url) seededUrls.add(url);
      return { layerA: url, layerB: url, showA: true };
    });
    setSlots(seeded);
  }, [optimizedAvatarsKey, pickNextAvatar]);

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
  }, [optimizedAvatarsKey, pickNextAvatar]);

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
              style={{ background: placeholderGradients[idx % placeholderGradients.length] }}
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
        <p className="text-[15px] text-white sm:text-base lg:text-[15px] min-[2000px]:text-base">
          {locale === "fr" ? "Utilisé par" : "Used by"}{" "}
          <span>{loaded ? numberFormatter.format(usersTotal) : "…"}</span>{" "}
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
};

/* Bottom-right quick menu — a hamburger pill (same look as the
   "Learn more" pill). On hover it reveals the top-nav links as a
   glassmorphic popup; each link reuses <NavDropdown> so it keeps the
   exact dropdown panels, cards and hover behaviour from the old top
   nav. The hamburger itself does nothing on click — hover only. */
function HeroQuickMenu({ items }: { items: LandingNavItem[]; locale: Locale }) {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const menuCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (menuCloseRef.current) {
      clearTimeout(menuCloseRef.current);
      menuCloseRef.current = null;
    }
    setNavMenuOpen(true);
  };
  const closeMenu = () => {
    menuCloseRef.current = setTimeout(() => {
      setNavMenuOpen(false);
      setOpenIndex(null);
    }, 160);
  };
  const handleEnter = (i: number) => {
    if (itemCloseRef.current) {
      clearTimeout(itemCloseRef.current);
      itemCloseRef.current = null;
    }
    setOpenIndex(i);
  };
  const handleLeave = () => {
    itemCloseRef.current = setTimeout(() => setOpenIndex(null), 150);
  };

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      {/* Popup above the hamburger — glassmorphic grey, no outline. */}
      <div
        data-nav-dropdown
        className="absolute bottom-[calc(100%+12px)] right-0 rounded-2xl p-1.5 transition-[opacity,transform] duration-200"
        style={{
          background: "#18181b",
          border: "1px solid rgba(255,255,255,0.1)",
          opacity: navMenuOpen ? 1 : 0,
          transform: navMenuOpen ? "translateY(0)" : "translateY(8px)",
          transformOrigin: "bottom right",
          pointerEvents: navMenuOpen ? "auto" : "none",
        }}
      >
        <nav className="flex items-center gap-0.5" aria-label="Quick navigation">
          {items.map((item, i) => (
            <NavDropdown
              key={item.label}
              item={item}
              open={openIndex === i}
              onEnter={() => handleEnter(i)}
              onLeave={handleLeave}
              onClick={() => {}}
              placement="up"
            />
          ))}
        </nav>
      </div>
      {/* Hamburger — hover-only, no click action. */}
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={navMenuOpen}
        className="inline-flex h-12 items-center gap-2 rounded-full bg-white/[0.08] px-5 text-[15px] font-medium text-white/75 transition-colors duration-200 hover:bg-white/[0.12] hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M4 9h16" />
          <path d="M4 15h16" />
        </svg>
        Menu
      </button>
    </div>
  );
}

export function HeroSection({ content, locale = "en" }: HeroSectionProps) {
  const { stats, loaded } = useLandingStats();

  return (
    <section className="relative flex min-h-screen items-start overflow-hidden lg:items-center">
      <div className="relative z-10 mx-auto w-full max-w-[clamp(1320px,92vw,2400px)] px-4 pb-16 pt-[140px] sm:px-8 sm:pt-[152px] lg:px-10 lg:pb-24 lg:pt-48">
        {/* Two-column hero (claude.ai structure): all content on the
            left, an empty container on the right reserved for a video
            (to be added later). Stacks to a single column on mobile. */}
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-center lg:gap-[clamp(2.5rem,6vw,7rem)]">
          {/* LEFT — headline, trusted-by, sign-up card (centered). */}
          <div className="flex flex-col items-center text-center">
            <h1 className="font-display text-[2.4rem] font-normal leading-[1.05] tracking-tight text-white sm:text-[2.6rem] lg:text-[2.75rem] min-[2000px]:text-[3.1rem]">
              <span className="block">
                {locale === "fr" ? "Gère ta musique" : "Run your music"}
              </span>
              <span className="block">
                {locale === "fr" ? "comme un business" : "like a business"}
              </span>
            </h1>

            {/* "Used by N artists & producers" — sits directly below the
                headline (claude's subtitle slot). */}
            <HeroTrustedBy
              locale={locale}
              usersTotal={stats.usersTotal}
              loaded={loaded}
              avatarUrls={stats.avatarUrls}
            />

            {/* Sign-up — Email + Apple (outline) and Google (white),
                all pill-shaped. No surrounding card. */}
            <div className="mt-9 w-full max-w-[480px] lg:max-w-[420px]">
              <div>
                <div className="flex flex-col gap-3">
                  {/* Continue with Email — outline pill, top */}
                  <a
                    href="https://vvault.app/signup"
                    onClick={() => trackButtonClick({ buttonId: "hero.continue_email", surface: "landing.hero", locale, href: "https://vvault.app/signup" })}
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-white/20 px-6 py-4 text-[16px] lg:px-5 lg:py-3.5 lg:text-[15px] min-[2000px]:px-6 min-[2000px]:py-4 min-[2000px]:text-[16px] font-semibold text-white transition-colors duration-200 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    <svg viewBox="-8 -8 256 256" className="h-5 w-5 -translate-y-px" fill="none" stroke="currentColor" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 120c0 -37.7124 0 -56.5685 11.7157 -68.2843C43.4315 40 62.2876 40 100 40h40c37.712 0 56.569 0 68.284 11.7157C220 63.4315 220 82.2876 220 120c0 37.712 0 56.569 -11.716 68.284C196.569 200 177.712 200 140 200h-40c-37.7124 0 -56.5685 0 -68.2843 -11.716C20 176.569 20 157.712 20 120Z" />
                      <path d="m60 80 21.589 17.9908C99.9553 113.296 109.139 120.949 120 120.949s20.045 -7.653 38.411 -22.9582L180 80" />
                    </svg>
                    {locale === "fr" ? "Continuer avec email" : "Continue with Email"}
                  </a>
                  {/* Continue with Apple — outline pill, middle */}
                  <a
                    href="https://vvault.app/signup"
                    onClick={() => trackButtonClick({ buttonId: "hero.continue_apple", surface: "landing.hero", locale, href: "https://vvault.app/signup" })}
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-white/20 px-6 py-4 text-[16px] lg:px-5 lg:py-3.5 lg:text-[15px] min-[2000px]:px-6 min-[2000px]:py-4 min-[2000px]:text-[16px] font-semibold text-white transition-colors duration-200 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    <svg viewBox="0 0 384 512" className="h-5 w-5 -translate-y-0.5" fill="#ffffff" aria-hidden="true">
                      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                    </svg>
                    {locale === "fr" ? "Continuer avec Apple" : "Continue with Apple"}
                  </a>
                  {/* Continue with Google — white pill, bottom */}
                  <a
                    href="https://vvault.app/auth/google"
                    onClick={() => trackButtonClick({ buttonId: "hero.continue_google", surface: "landing.hero", locale, href: "https://vvault.app/auth/google" })}
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-6 py-4 text-[16px] lg:px-5 lg:py-3.5 lg:text-[15px] min-[2000px]:px-6 min-[2000px]:py-4 min-[2000px]:text-[16px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      style={{ transform: "translateY(-2px)", transition: "none" }}
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {locale === "fr" ? "Continuer avec Google" : "Continue with Google"}
                  </a>
                </div>

                {/* Privacy line — vvault's equivalent of claude's */}
                <p className="mt-4 text-center text-[12px] leading-relaxed text-white/40">
                  {locale === "fr" ? "En continuant, tu acceptes la " : "By continuing, you acknowledge vvault's "}
                  <a href="/privacy" className="text-white/55 underline underline-offset-2 hover:no-underline">
                    {locale === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
                  </a>
                  {locale === "fr" ? " de vvault." : "."}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — reserved video container. A product video will be
              dropped in here later; for now it's an empty framed slot
              that holds the layout. */}
          <div className="w-full max-w-[440px] lg:w-[min(40vw,560px)] lg:max-w-none lg:shrink-0">
            {/* Layered product shot — desktop window (back, bottom-left) with
                the phone floating up and to the right (untitled.stream style).
                Same rounded corners + low-opacity outline as the cards. */}
            <div className="relative aspect-[5/4] w-full">
              {/* Computer — back, vertically centered on the phone */}
              <div className="absolute left-0 top-1/2 w-[74%] hero-slide-left overflow-hidden rounded-[14px] [outline:2px_solid_rgba(255,255,255,0.16)]">
                <LoopingVideo
                  src="/landing/features/computer"
                  poster="/landing/features/computer.webp"
                  className="block w-full rounded-[14px]"
                  fadeIn={false}
                />
              </div>
              {/* Phone — front, up and to the right, taller, centered on the computer */}
              <div className="absolute right-[3%] top-1/2 z-10 w-[38%] hero-slide-right overflow-hidden rounded-[22px] [outline:2px_solid_rgba(255,255,255,0.16)]">
                <LoopingVideo
                  src="/landing/features/phone"
                  poster="/landing/features/phone.webp"
                  className="block w-full rounded-[22px]"
                  fadeIn={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick-nav hamburger — pinned to the screen (fixed), sitting at
          the content right margin (aligned with the nav's Enter App). */}
      <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[60] mx-auto hidden max-w-[clamp(1320px,92vw,2400px)] px-5 sm:px-8 lg:flex lg:justify-end lg:px-10">
        <div className="pointer-events-auto flex items-center gap-2.5">
          {/* iPhone — App Store download, same glassmorphic pill as the
              hamburger, Apple glyph left of the label. */}
          <a
            href="https://apps.apple.com/app/id6759256796"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackButtonClick({ buttonId: "hero.download_ios", surface: "landing.hero", locale, href: "https://apps.apple.com/app/id6759256796" })}
            aria-label={locale === "fr" ? "Télécharger sur l'App Store" : "Download on the App Store"}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white/[0.08] px-5 text-[15px] font-medium text-white/75 transition-colors duration-200 hover:bg-white/[0.12] hover:text-white"
          >
            <svg viewBox="0 0 384 512" className="h-[18px] w-[18px] -translate-y-px" fill="currentColor" aria-hidden="true">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            iPhone
          </a>
          <HeroQuickMenu items={content.nav} locale={locale} />
        </div>
      </div>
    </section>
  );
}
