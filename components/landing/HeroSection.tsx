"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { LandingContent, Locale } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

const Beams = dynamic(() => import("@/components/landing/Beams"), { ssr: false });

/* Plain-text chip whose only visual marker is a prism-coloured dot
   that cycles through the five palette stops (see `.prism-dot` in
   globals.css). No background, no border, no halo — the dot alone
   carries the studio-page-esque accent. */
function HeroStudioBadge({
  href,
  newLabel,
  onyxLabel,
}: {
  href: string;
  newLabel: string;
  onyxLabel: string;
}) {
  return (
    <LandingCtaLink
      loggedInHref={href}
      loggedOutHref={href}
      className="group inline-flex items-center gap-2 px-1 py-0.5 text-xs sm:text-sm"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
      <span className="font-semibold text-white">{newLabel}</span>
      <span className="text-white/72">{onyxLabel}</span>
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4 fill-none stroke-current text-white/42 stroke-[1.8] transition-transform duration-300 ease-out group-hover:translate-x-1"
      >
        <path d="M4 10h11M11 6l4 4-4 4" />
      </svg>
    </LandingCtaLink>
  );
}

type LandingStatsResponse = {
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
const AVATAR_PRELOAD_PARALLEL = 10;
const AVATAR_PRELOAD_PARALLEL_SLOW = 4;

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

function toFastAvatarUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname;

    if (parsed.searchParams.has("token")) return rawUrl;

    if (path.includes("/storage/v1/object/public/")) {
      const renderPath = path.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/",
      );
      parsed.pathname = renderPath;
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

function RollingValue({ value, loaded }: { value: string; loaded: boolean }) {
  if (!loaded) {
    return <span className="animate-pulse text-white/70">…</span>;
  }

  return (
    <span className="inline-block tabular-nums motion-safe:[animation:hero-stat-roll_520ms_cubic-bezier(0.22,1,0.36,1)]">
      {value}
    </span>
  );
}

function useLandingStats() {
  const [stats, setStats] = useState<LandingStatsResponse>(LANDING_STATS_FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    let inFlight = false;

    const loadStats = async () => {
      if (inFlight) return;
      inFlight = true;

      try {
        const res = await fetch("/api/landing-stats", { cache: "no-store" });
        if (!res.ok || !active) return;

        const payload = (await res.json()) as Partial<LandingStatsResponse>;
        if (!active) return;

        setStats({
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
        });
      } catch {
        // Keep fallback values when stats API is unavailable.
      } finally {
        inFlight = false;
        if (active) setLoaded(true);
      }
    };

    void loadStats();

    return () => {
      active = false;
    };
  }, []);

  return { stats, loaded };
}


function HeroTrustedBy({
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
    const preloadQueue = shuffleStrings(optimizedAvatarUrls.slice(0, 20));
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
      // Remove broken URLs from the pool so they never appear
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

          // Load next image into the hidden layer, then flip
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
    <div className="hero-seq-item mt-12 flex justify-center" style={{ animationDelay: "380ms" }}>
      <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-3">
        <div className="flex items-center">
          {slots.map((slotState, idx) => {
            const gradient = placeholderGradients[idx % placeholderGradients.length];

            return (
            <span
              key={`trusted-avatar-${idx}`}
              className={`${
                idx === 0 ? "ml-0" : "-ml-2.5"
              } relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/30`}
              style={{ background: "rgba(30,30,35,1)" }}
            >
              {/* Layer A */}
              {slotState.layerA && (
                <span
                  className={`absolute inset-0 block bg-cover bg-center transform-gpu transition-opacity duration-700 ease-out ${
                    slotState.showA ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ backgroundImage: `url("${slotState.layerA}")` }}
                />
              )}
              {/* Layer B */}
              {slotState.layerB && (
                <span
                  className={`absolute inset-0 block bg-cover bg-center transform-gpu transition-opacity duration-700 ease-out ${
                    slotState.showA ? "opacity-0" : "opacity-100"
                  }`}
                  style={{ backgroundImage: `url("${slotState.layerB}")` }}
                />
              )}
            </span>
            );
          })}
        </div>
        <p className="text-sm text-white/85 sm:text-base">
          {locale === "fr" ? "Utilisé par" : "Used by"}{" "}
          <span className="font-bold text-white">
            {loaded ? numberFormatter.format(usersTotal) : "…"}
          </span>{" "}
          <span>{locale === "fr" ? "artistes & beatmakers" : "artists & producers"}</span>
          {/* Force a line break on mobile so the line reads:
              "Used by X artists & producers"
              "you probably know"
              On desktop the fragment stays inline. */}
          <br className="sm:hidden" />
          <span className="text-white/55 sm:ml-1">{locale === "fr" ? "que tu connais sûrement" : "you probably know"}</span>
        </p>
      </div>
    </div>
  );
}

function StatEmblemIcon({ statKey }: { statKey: string }) {
  const iconClass = "h-12 w-12";
  const gradId = `icon-grad-${statKey}`;

  const grad = (
    <defs>
      <linearGradient id={gradId} x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
        <stop offset="40%" stopColor="rgba(200,205,215,0.32)" />
        <stop offset="70%" stopColor="rgba(160,165,180,0.22)" />
        <stop offset="100%" stopColor="rgba(140,145,160,0.18)" />
      </linearGradient>
    </defs>
  );

  if (statKey === "emails") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={iconClass}>
        {grad}
        <path fill={`url(#${gradId})`} d="M0 4a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2H2a2 2 0 0 1 -2 -2zm2 -1a1 1 0 0 0 -1 1v0.217l7 4.2 7 -4.2V4a1 1 0 0 0 -1 -1zm13 2.383 -4.708 2.825L15 11.105zm-0.034 6.876 -5.64 -3.471L8 9.583l-1.326 -0.795 -5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 0.966 -0.741M1 11.105l4.708 -2.897L1 5.383z" />
      </svg>
    );
  }
  if (statKey === "tracks") {
    const maskId = `mask-${statKey}`;
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={iconClass}>
        <defs>
          <linearGradient id={gradId} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="40%" stopColor="rgba(200,205,215,0.32)" />
            <stop offset="70%" stopColor="rgba(160,165,180,0.22)" />
            <stop offset="100%" stopColor="rgba(140,145,160,0.18)" />
          </linearGradient>
          <mask id={maskId}>
            <path fill="white" d="M6 13c0 1.105 -1.12 2 -2.5 2S1 14.105 1 13s1.12 -2 2.5 -2 2.5 0.896 2.5 2m9 -2c0 1.105 -1.12 2 -2.5 2s-2.5 -0.895 -2.5 -2 1.12 -2 2.5 -2 2.5 0.895 2.5 2" />
            <path fill="white" fillRule="evenodd" d="M14 11V2h1v9zM6 3v10H5V3z" />
            <path fill="white" d="M5 2.905a1 1 0 0 1 0.9 -0.995l8 -0.8a1 1 0 0 1 1.1 0.995V3L5 4z" />
          </mask>
        </defs>
        <rect x="0" y="0" width="16" height="16" fill={`url(#${gradId})`} mask={`url(#${maskId})`} />
      </svg>
    );
  }
  if (statKey === "money") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={iconClass}>
        {grad}
        <path fill={`url(#${gradId})`} d="M4 10.781c0.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27 -0.179 3.678 -1.438 3.678 -3.3 0 -1.59 -0.947 -2.51 -2.956 -3.028l-0.722 -0.187V3.467c1.122 0.11 1.879 0.714 2.07 1.616h1.47c-0.166 -1.6 -1.54 -2.748 -3.54 -2.875V1H7.591v1.233c-1.939 0.23 -3.27 1.472 -3.27 3.156 0 1.454 0.966 2.483 2.661 2.917l0.61 0.162v4.031c-1.149 -0.17 -1.94 -0.8 -2.131 -1.718zm3.391 -3.836c-1.043 -0.263 -1.6 -0.825 -1.6 -1.616 0 -0.944 0.704 -1.641 1.8 -1.828v3.495l-0.2 -0.05zm1.591 1.872c1.287 0.323 1.852 0.859 1.852 1.769 0 1.097 -0.826 1.828 -2.2 1.939V8.73z" />
      </svg>
    );
  }
  if (statKey === "review") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={iconClass}>
        {grad}
        <path fill={`url(#${gradId})`} fillRule="evenodd" d="M10.58 1.87a1.25 1.25 0 1 0 -2.16 1.26l2.133 3.656 -4.354 7.464H2a1.25 1.25 0 1 0 0 2.5h4.884l0.063 0H13a1.25 1.25 0 1 0 0 -2.5H9.093l3.973 -6.811 0.026 -0.044L15.58 3.13a1.25 1.25 0 1 0 -2.16 -1.26L12 4.305 10.58 1.87Zm4.5 7.714 2.72 4.666H22a1.25 1.25 0 1 1 0 2.5h-2.74l1.82 3.12a1.25 1.25 0 1 1 -2.16 1.26l-2.887 -4.95a1.228 1.228 0 0 1 -0.06 -0.104l-3.053 -5.232a1.25 1.25 0 1 1 2.16 -1.26Zm-9 9.832a1.25 1.25 0 0 0 -2.16 -1.26l-1 1.714a1.25 1.25 0 0 0 2.16 1.26l1 -1.714Z" clipRule="evenodd" />
      </svg>
    );
  }
  return null;
}

function StatEmblem({ statKey }: { statKey: string }) {
  return (
    <div
      className="relative flex h-[110px] w-[110px] items-center justify-center overflow-hidden rounded-[26px]"
      style={{
        background: "linear-gradient(160deg, rgba(30,30,35,0.6) 0%, rgba(8,8,10,0.95) 35%, rgba(0,0,0,1) 100%)",
        boxShadow: [
          "inset 0 1px 0 0 rgba(255,255,255,0.07)",
          "inset 0 -1px 0 0 rgba(0,0,0,0.4)",
          "inset 1px 0 0 0 rgba(255,255,255,0.03)",
          "inset -1px 0 0 0 rgba(0,0,0,0.15)",
          "0 8px 32px -6px rgba(0,0,0,0.7)",
          "0 2px 8px 0 rgba(0,0,0,0.4)",
        ].join(", "),
        border: "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Noise/grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          borderRadius: "inherit",
        }}
      />
      {/* Top-left specular highlight */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[60%] w-[70%]"
        style={{
          background: "radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.03) 0%, transparent 60%)",
          borderRadius: "inherit",
        }}
      />
      {/* Top edge highlight line */}
      <div
        className="pointer-events-none absolute inset-x-[15%] top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)",
        }}
      />
      {/* Bottom glow — soft diffused spill */}
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(190,200,255,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {/* Bottom edge glow line — thin and smooth */}
      <div
        className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(190,200,255,0.1) 30%, rgba(190,200,255,0.16) 50%, rgba(190,200,255,0.1) 70%, transparent 100%)",
        }}
      />
      {/* Left edge subtle highlight */}
      <div
        className="pointer-events-none absolute inset-y-[15%] left-0 w-px"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(190,200,255,0.08) 80%, transparent 100%)",
        }}
      />
      {/* Icon with drop shadow for depth */}
      <div className="relative z-10">
        <StatEmblemIcon statKey={statKey} />
      </div>
    </div>
  );
}

function HeroLiveStats({
  locale,
  stats,
  loaded,
}: {
  locale: Locale;
  stats: LandingStatsResponse;
  loaded: boolean;
}) {

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US"),
    [locale],
  );
  const moneyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const statCards: Array<{ key: string; label: string; value: string }> = [
    {
      key: "emails",
      label: locale === "fr" ? "Emails envoyés" : "Emails sent",
      value: numberFormatter.format(stats.emailsSentTotal),
    },
    {
      key: "tracks",
      label: locale === "fr" ? "Tracks" : "Tracks",
      value: numberFormatter.format(stats.tracksTotal),
    },
    {
      key: "money",
      label: locale === "fr" ? "Valeur des beats vendus" : "Value of beats sold",
      value: moneyFormatter.format(stats.moneyPaidTotalCents / 100),
    },
    {
      key: "review",
      label: locale === "fr" ? "Avis App Store" : "App Store review",
      value: stats.appStoreReviewLabel,
    },
  ];

  return (
    <div className="hero-seq-item pt-40 pb-16 sm:pt-48 sm:pb-20 lg:pt-56 lg:pb-24" style={{ animationDelay: "1480ms" }}>
      <div className="flex justify-center">
        <div className="grid w-full max-w-[980px] grid-cols-2 gap-x-4 gap-y-14 text-center sm:grid-cols-4 sm:gap-x-8 sm:gap-y-7">
          {statCards.map((card) => (
            <div key={card.key} className="flex flex-col items-center justify-center">
              <StatEmblem statKey={card.key} />
              <span className="mt-3.5 text-[10px] tracking-[0.08em] text-white/50 sm:text-[11px]">
                {card.label}
              </span>
              <div className="relative mt-1">
                <span className="block text-[2rem] font-semibold leading-none text-white sm:text-[2.6rem]">
                  <RollingValue key={`${card.key}-${card.value}`} value={card.value} loaded={loaded} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



type HeroSectionProps = {
  content: LandingContent;
  locale?: Locale;
  showOnyxUploader?: boolean;
};

const HERO_HEADLINES_EN = [
  "send your music.",
  "store your packs.",
  "sell your music.",
  "track your sends.",
  "get placements.",
];

const HERO_HEADLINES_FR = [
  "d'envoyer ta musique.",
  "de stocker tes packs.",
  "de vendre ta musique.",
  "de tracker tes envois.",
  "de décrocher des placements.",
];

function RotatingHeadline({ locale }: { locale: Locale }) {
  const headlines = locale === "fr" ? HERO_HEADLINES_FR : HERO_HEADLINES_EN;
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<"visible" | "exiting" | "entering">("visible");
  const timeout1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const tick = () => {
      setState("exiting");
      timeout1Ref.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % headlines.length);
        setState("entering");
        timeout2Ref.current = setTimeout(() => {
          setState("visible");
        }, 50);
      }, 400);
    };
    const start = () => {
      if (!intervalId) intervalId = setInterval(tick, 3000);
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
      if (timeout1Ref.current) clearTimeout(timeout1Ref.current);
      if (timeout2Ref.current) clearTimeout(timeout2Ref.current);
    };
  }, [headlines.length]);

  return (
    <span
      className="inline-block transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        opacity: state === "visible" ? 1 : 0,
        filter: state === "visible" ? "blur(0px)" : "blur(6px)",
        transform:
          state === "entering"
            ? "translateY(8px)"
            : state === "exiting"
              ? "translateY(-8px)"
              : "translateY(0)",
      }}
    >
      {headlines[index]}
    </span>
  );
}

export function HeroSection({ content, locale = "en", showOnyxUploader = true }: HeroSectionProps) {
  const { stats, loaded } = useLandingStats();

  return (
    <>
      <section className="relative pb-8 pt-48 sm:pb-12 sm:pt-52 lg:pb-16 lg:pt-58">
        <div className="pointer-events-none absolute top-0 left-0 z-0 h-screen w-screen opacity-40">
          <Beams
            beamWidth={1.7}
            beamHeight={25}
            beamNumber={26}
            lightColor="#a6a6a6"
            speed={1.2}
            noiseIntensity={2.05}
            scale={0.2}
            rotation={30}
          />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[1280px] text-center">
            {showOnyxUploader ? (
              <div className="hero-seq-item mb-6 flex justify-center sm:mb-7" style={{ animationDelay: "1200ms" }}>
                {/* Prism-tinted pill (CSS-only — gradient border +
                    coloured outer halo). Carries the same palette as
                    the studio hero's shader so the chip reads as a
                    teaser for that page without spinning up another
                    WebGL context on the landing. */}
                <HeroStudioBadge
                  href="/features/studio"
                  newLabel={content.hero.newBadge}
                  onyxLabel={content.hero.onyxLabel}
                />
              </div>
            ) : null}

            <h1 className="font-display text-[2.25rem] font-normal leading-[0.95] tracking-tight text-white sm:text-[3.75rem] lg:text-[4.7rem]">
              <span className="hero-line-reveal" style={{ animationDelay: "60ms" }}>
                {content.hero.title[0]}
              </span>
              <span className="hero-line-reveal block" style={{ animationDelay: "120ms" }}>
                <RotatingHeadline locale={locale} />
              </span>
            </h1>

          </div>

          <HeroTrustedBy locale={locale} usersTotal={stats.usersTotal} loaded={loaded} avatarUrls={stats.avatarUrls} />

          <div className="hero-seq-item mt-7 flex flex-col items-center gap-3" style={{ animationDelay: "520ms" }}>
            <a
              href="https://vvault.app/auth/google"
              className="inline-flex items-center gap-2.5 rounded-2xl px-5 py-2 text-[14px] font-semibold text-[#0e0e0e] transition-[filter,box-shadow] duration-200 ease-out hover:brightness-[0.96] hover:shadow-[0_6px_28px_0_rgba(255,255,255,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:px-6 sm:py-2.5 sm:text-[15px]"
              style={{
                background: "linear-gradient(to bottom, #ffffff 0%, #d4d4d4 100%)",
                boxShadow: "0 4px 24px 0 rgba(255,255,255,0.10), 0 1px 4px 0 rgba(255,255,255,0.06)",
                transform: "translateZ(0)",
                willChange: "filter",
              }}
            >
              {/* Inline transform:none lock so the SVG can't inherit
                  a stray transition from `transition-all` ancestors
                  (the subtle wobble the G logo picked up on hover). */}
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                style={{ transform: "none", transition: "none" }}
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {locale === "fr" ? "Continuer avec Google" : "Continue with Google"}
            </a>
            <LandingCtaLink
              loggedInHref="https://vvault.app/signup"
              loggedOutHref="https://vvault.app/signup"
              className="inline-flex items-center text-sm font-medium text-white/50 transition-colors duration-200 hover:text-white/80 focus-visible:outline-none sm:text-base"
            >
              {locale === "fr" ? "Commencer gratuitement" : "Start for free"}
            </LandingCtaLink>
          </div>
        </div>
      </section>

      <HeroLiveStats locale={locale} stats={stats} loaded={loaded} />
    </>
  );
}
