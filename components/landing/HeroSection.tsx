"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { LandingContent, Locale } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

const Beams = dynamic(() => import("@/components/landing/Beams"), { ssr: false });

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
const APP_STORE_URL = "https://apps.apple.com/us/app/vvault/id6759256796";

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
      parsed.searchParams.set("width", "48");
      parsed.searchParams.set("height", "48");
      parsed.searchParams.set("quality", "18");
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

function preloadAvatar(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      img.onload = null;
      img.onerror = null;
      clearTimeout(timeoutId);
      resolve();
    };
    const timeoutId = window.setTimeout(done, 4500);
    img.onload = done;
    img.onerror = done;
    img.src = url;
    if (img.complete) done();
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
    const intervalId = setInterval(() => {
      void loadStats();
    }, 6000);

    return () => {
      active = false;
      clearInterval(intervalId);
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
  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-US"), []);
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
  const placeholderTones = [
    "from-[#6ee7b7]/70 to-[#14b8a6]/60",
    "from-[#93c5fd]/70 to-[#3b82f6]/60",
    "from-[#fbcfe8]/70 to-[#f472b6]/60",
    "from-[#fcd34d]/70 to-[#f59e0b]/60",
    "from-[#d8b4fe]/70 to-[#a855f7]/60",
  ];
  const [slots, setSlots] = useState<Array<{ layerA: string; layerB: string; showA: boolean }>>(
    Array.from({ length: AVATAR_SLOT_COUNT }, () => ({ layerA: "", layerB: "", showA: true })),
  );
  const rafRef = useRef<number | null>(null);
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
    const preloadQueue = shuffleStrings(optimizedAvatarUrls);
    const preloadParallel = Math.min(
      preloadQueue.length,
      isSlow ? AVATAR_PRELOAD_PARALLEL_SLOW : AVATAR_PRELOAD_PARALLEL,
    );

    const workers = Array.from({ length: preloadParallel }, async () => {
      while (!cancelled) {
        const next = preloadQueue.pop();
        if (!next) break;
        await preloadAvatar(next);
      }
    });

    void Promise.allSettled(workers);

    return () => {
      cancelled = true;
    };
  }, [optimizedAvatarsKey, optimizedAvatarUrls, refillShuffledPool]);

  useEffect(() => {
    const initTimeoutId = window.setTimeout(() => {
      const pool = avatarPoolRef.current;
      const seeded =
        pool.length === 0
          ? Array.from({ length: AVATAR_SLOT_COUNT }, () => ({ layerA: "", layerB: "", showA: true }))
          : (() => {
              const seededUrls = new Set<string>();
              return Array.from({ length: AVATAR_SLOT_COUNT }, () => {
                const blocked = new Set(seededUrls);
                const url = pickNextAvatar(blocked);
                if (url) seededUrls.add(url);
                return { layerA: url, layerB: url, showA: true };
              });
            })();
      setSlots(seeded);
    }, 0);

    return () => clearTimeout(initTimeoutId);
  }, [optimizedAvatarsKey, pickNextAvatar]);

  useEffect(() => {
    if (avatarPoolRef.current.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setSlots((currentSlots) => {
        const pool = avatarPoolRef.current;
        if (pool.length <= 1) return currentSlots;

        const usedInFrame = new Set<string>();
        const prepped = currentSlots.map((currentSlot) => {
          const currentUrl = currentSlot.showA ? currentSlot.layerA : currentSlot.layerB;
          const blocked = new Set(usedInFrame);
          if (currentUrl) blocked.add(currentUrl);
          const nextUrl = pickNextAvatar(blocked);
          if (nextUrl) usedInFrame.add(nextUrl);

          if (!nextUrl || nextUrl === currentUrl) return currentSlot;
          return currentSlot.showA
            ? { ...currentSlot, layerB: nextUrl }
            : { ...currentSlot, layerA: nextUrl };
        });

        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = window.requestAnimationFrame(() => {
          setSlots((prevSlots) => {
            return prevSlots.map((slotState) => ({ ...slotState, showA: !slotState.showA }));
          });
        });

        return prepped;
      });
    }, 3500);

    return () => {
      clearInterval(intervalId);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [optimizedAvatarsKey, pickNextAvatar]);

  return (
    <div className="hero-seq-item mt-12 flex justify-center" style={{ animationDelay: "1360ms" }}>
      <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-3">
        <div className="flex items-center">
          {slots.map((slotState, idx) => {
            const tone = placeholderTones[idx % placeholderTones.length];
            const staggerDelayMs = idx * 58;

            return (
            <span
              key={`trusted-avatar-${idx}`}
              className={`${
                idx === 0 ? "ml-0" : "-ml-2.5"
              } relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transform-gpu transition-transform duration-[980ms] ease-[cubic-bezier(0.22,1.12,0.36,1)] ${
                slotState.showA ? "scale-[1.03]" : "scale-100"
              }`}
              style={{ transitionDelay: `${staggerDelayMs}ms` }}
            >
              {slotState.layerA ? (
                <span
                  className={`absolute inset-0 block bg-gradient-to-br ${tone} bg-cover bg-center transform-gpu will-change-[opacity,transform] transition-[opacity,transform] duration-[860ms] ease-[cubic-bezier(0.22,1.12,0.36,1)] ${
                    slotState.showA ? "opacity-100 scale-100" : "opacity-0 scale-[0.92]"
                  }`}
                  style={{ backgroundImage: `url("${slotState.layerA}")`, transitionDelay: `${staggerDelayMs}ms` }}
                />
              ) : (
                <span
                  className={`absolute inset-0 block bg-gradient-to-br ${tone} transform-gpu will-change-[opacity,transform] transition-[opacity,transform] duration-[860ms] ease-[cubic-bezier(0.22,1.12,0.36,1)] ${
                    slotState.showA ? "opacity-100 scale-100" : "opacity-0 scale-[0.92]"
                  }`}
                  style={{ transitionDelay: `${staggerDelayMs}ms` }}
                />
              )}
              {slotState.layerB ? (
                <span
                  className={`absolute inset-0 block bg-gradient-to-br ${tone} bg-cover bg-center transform-gpu will-change-[opacity,transform] transition-[opacity,transform] duration-[860ms] ease-[cubic-bezier(0.22,1.12,0.36,1)] ${
                    slotState.showA ? "opacity-0 scale-[0.92]" : "opacity-100 scale-100"
                  }`}
                  style={{ backgroundImage: `url("${slotState.layerB}")`, transitionDelay: `${staggerDelayMs}ms` }}
                />
              ) : (
                <span
                  className={`absolute inset-0 block bg-gradient-to-br ${tone} transform-gpu will-change-[opacity,transform] transition-[opacity,transform] duration-[860ms] ease-[cubic-bezier(0.22,1.12,0.36,1)] ${
                    slotState.showA ? "opacity-0 scale-[0.92]" : "opacity-100 scale-100"
                  }`}
                  style={{ transitionDelay: `${staggerDelayMs}ms` }}
                />
              )}
            </span>
            );
          })}
        </div>
        <p className="text-sm text-white/85 sm:text-base">
          Trusted by{" "}
          <span className="font-extrabold text-white">
            {loaded ? numberFormatter.format(usersTotal) : "…"}
          </span>{" "}
          <span className="sm:hidden">{locale === "fr" ? "users" : "users"}</span>
          <span className="hidden sm:inline">{locale === "fr" ? "artists & beatmakers" : "artists & beatmakers"}</span>
          <span className="ml-1 text-white/55">you probably know</span>
        </p>
      </div>
    </div>
  );
}

function StatEmblemIcon({ statKey }: { statKey: string }) {
  const sw = "0.18";

  if (statKey === "emails") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.1 -0.1 3.2 3.2" className="h-9 w-9 sm:h-10 sm:w-10">
        <defs>
          <linearGradient id="icon-grad-emails" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="100%" stopColor="rgba(180,190,220,0.5)" />
          </linearGradient>
        </defs>
        <path d="M0.1875 0.545h2.625v1.90875h-2.625Z" fill="none" stroke="url(#icon-grad-emails)" strokeMiterlimit="10" strokeWidth={sw} />
        <path d="M0.1875 0.545 1.5 1.8575l1.3125-1.3125" fill="none" stroke="url(#icon-grad-emails)" strokeMiterlimit="10" strokeWidth={sw} />
      </svg>
    );
  }
  if (statKey === "tracks") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.1 -0.1 3.2 3.2" className="h-9 w-9 sm:h-10 sm:w-10">
        <defs>
          <linearGradient id="icon-grad-tracks" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="100%" stopColor="rgba(180,190,220,0.5)" />
          </linearGradient>
        </defs>
        <path d="m0.545 0.78375 0.35875 0" fill="none" stroke="url(#icon-grad-tracks)" strokeMiterlimit="10" strokeWidth={sw} />
        <path d="M1.5 0.4425V1.125a1.47625 1.47625 0 0 1-0.73375 0.25625 0.545 0.545 0 0 1-0.10125-0.00625v1.4375H0.1875V0.78375A0.5875 0.5875 0 0 1 0.76625 0.1875 1.47375 1.47375 0 0 1 1.5 0.4425Z" fill="none" stroke="url(#icon-grad-tracks)" strokeMiterlimit="10" strokeWidth={sw} />
        <path d="m2.455 2.21625-0.35875 0" fill="none" stroke="url(#icon-grad-tracks)" strokeMiterlimit="10" strokeWidth={sw} />
        <path d="M1.5 2.5575V1.875a1.47625 1.47625 0 0 1 0.73375-0.25 0.545 0.545 0 0 1 0.10125 0.01V0.1875h0.4775v2.02875a0.5875 0.5875 0 0 1-0.57875 0.59625A1.47375 1.47375 0 0 1 1.5 2.5575Z" fill="none" stroke="url(#icon-grad-tracks)" strokeMiterlimit="10" strokeWidth={sw} />
      </svg>
    );
  }
  if (statKey === "money") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.1 -0.1 3.2 3.2" className="h-9 w-9 sm:h-10 sm:w-10">
        <defs>
          <linearGradient id="icon-grad-money" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="100%" stopColor="rgba(180,190,220,0.5)" />
          </linearGradient>
        </defs>
        <path d="M1.125 2.1875h0.4375A0.1875 0.1875 0 0 0 1.75 2a0.1875 0.1875 0 0 0-0.1875-0.1875h-0.125A0.1875 0.1875 0 0 1 1.25 1.625a0.1875 0.1875 0 0 1 0.1875-0.1875H1.875" fill="none" stroke="url(#icon-grad-money)" strokeMiterlimit="10" strokeWidth={sw} />
        <path d="m1.5 1.1875 0 0.25" fill="none" stroke="url(#icon-grad-money)" strokeMiterlimit="10" strokeWidth={sw} />
        <path d="m1.5 2.1875 0 0.25" fill="none" stroke="url(#icon-grad-money)" strokeMiterlimit="10" strokeWidth={sw} />
        <path d="m2.625 1.3125-1.125-1.125-1.125 1.125 0.375 0 0 1.5 1.5 0 0-1.5 0.375 0z" fill="none" stroke="url(#icon-grad-money)" strokeMiterlimit="10" strokeWidth={sw} />
      </svg>
    );
  }
  if (statKey === "review") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-0.1 -0.1 3.2 3.2" className="h-9 w-9 sm:h-10 sm:w-10">
        <defs>
          <linearGradient id="icon-grad-review" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="100%" stopColor="rgba(180,190,220,0.5)" />
          </linearGradient>
        </defs>
        <path stroke="url(#icon-grad-review)" strokeLinecap="square" strokeMiterlimit="10" d="M2.3747125 1.5000125c-0.0015 0.200575-0.0724125 0.39445-0.2006625 0.548675-0.1282625 0.1542125-0.3059625 0.2592625-0.5029125 0.2973-0.19695 0.038025-0.4009875 0.0067-0.57744625-0.088675-0.17645875-0.0953875-0.31445-0.2489125-0.3905225-0.4345125-0.07607375-0.1856-0.085535-0.3918125-0.02677875-0.58360375 0.0587575-0.19178625 0.18210875-0.35731125 0.34909125-0.46844625 0.16698375-0.111135 0.36729375-0.16102375 0.56689375-0.1411875s0.3861875 0.1081725 0.528025 0.24999875c0.0811125 0.08161125 0.145325 0.17842375 0.1889625 0.28489125 0.0436375 0.1064725 0.06585 0.2204975 0.06535 0.33556Z" strokeWidth={sw} />
        <path stroke="url(#icon-grad-review)" strokeLinecap="square" strokeMiterlimit="10" d="M2.875 1.5c0 0.1178625-0.14405 0.2147625-0.1728625 0.3221375-0.0288 0.1073875 0.0458375 0.2684625-0.010475 0.3653625-0.0563 0.0969-0.2317875 0.1113125-0.3116625 0.1925-0.079875 0.0811875-0.092975 0.25405-0.1925 0.3103625-0.099525 0.0563-0.25405-0.0183375-0.3653625 0.011775C1.7108375 2.7322625 1.61655 2.875 1.5 2.875c-0.11655 0-0.21345-0.14405-0.3221425-0.1728625-0.10869125-0.0288-0.261905 0.0458375-0.3653575-0.011775-0.1034525-0.057625-0.11131-0.2304875-0.1925-0.3103625-0.08119-0.079875-0.2540475-0.0942875-0.31166625-0.1925-0.05762-0.0982125 0.0196425-0.2527375-0.01047625-0.3653625C0.2677375 1.709525 0.125 1.6178625 0.125 1.5c0-0.1178625 0.1440475-0.2147625 0.1728575-0.3221425 0.02880875-0.10738125-0.04583375-0.261905 0.01047625-0.3653575 0.05630875-0.1034525 0.23047625-0.11131 0.31166625-0.1925 0.08119-0.08119 0.09428625-0.2540475 0.1925-0.31166625 0.09821375-0.05762 0.25273875 0.0196425 0.3653575-0.01047625C1.290475 0.2677375 1.3821375 0.125 1.5 0.125c0.1178625 0 0.2147625 0.1440475 0.3221375 0.1728575 0.1073875 0.02880875 0.2619125-0.04583375 0.3653625 0.01047625 0.10345 0.05630875 0.1113125 0.23047625 0.1925 0.31166625 0.0811875 0.08119 0.25405 0.09428625 0.3116625 0.1925 0.057625 0.09821375-0.0196375 0.25273875 0.010475 0.3653575C2.7322625 1.290475 2.875 1.3821375 2.875 1.5Z" strokeWidth={sw} />
        <path fill="url(#icon-grad-review)" d="m1.5 0.96569875 0.1545125 0.32213875 0.345725 0.0523875-0.250125 0.251425 0.058925 0.3548875L1.5 1.7789125l-0.30905375 0.167625 0.05892875-0.3548875-0.25011875-0.251425 0.34571875-0.0523875L1.5 0.96569875Z" strokeWidth={sw} />
      </svg>
    );
  }
  return null;
}

function StatEmblem({ statKey }: { statKey: string }) {
  return (
    <div
      className="relative flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-[22px] sm:h-[100px] sm:w-[100px] sm:rounded-[24px]"
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
          background: "radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.06) 0%, transparent 60%)",
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
        className="pointer-events-none absolute bottom-[-4px] left-1/2 -translate-x-1/2 h-[28%] w-[50%]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(190,200,255,0.12) 0%, transparent 70%)",
          filter: "blur(10px)",
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
      <div className="relative z-10" style={{ filter: "drop-shadow(0 0 6px rgba(200,210,255,0.15))" }}>
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
      label: locale === "fr" ? "Total payé" : "Money paid",
      value: moneyFormatter.format(stats.moneyPaidTotalCents / 100),
    },
    {
      key: "review",
      label: locale === "fr" ? "Avis App Store" : "App Store review",
      value: stats.appStoreReviewLabel,
    },
  ];

  return (
    <div className="hero-seq-item pt-52 pb-16 sm:pt-64 sm:pb-20 lg:pt-80 lg:pb-24" style={{ animationDelay: "1480ms" }}>
      <div className="flex justify-center">
        <div className="grid w-full max-w-[980px] grid-cols-2 gap-x-8 gap-y-14 text-center sm:grid-cols-4 sm:gap-y-7">
          {statCards.map((card) => (
            <div key={card.key} className="flex flex-col items-center justify-center">
              <StatEmblem statKey={card.key} />
              <span className="mt-3.5 text-[10px] tracking-[0.08em] text-white/50 sm:text-[11px]">
                {card.label}
              </span>
              <div
                className="relative mt-1"
                style={{
                  maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
                }}
              >
                <span className="block text-[1.5rem] font-semibold leading-none text-white sm:text-[1.9rem]">
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


function MobileAppStoreBar({ locale }: { locale: Locale }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-white/10 bg-[#0b0b0b]/95 backdrop-blur-md sm:hidden">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-3 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
        <p className="text-[11px] font-medium leading-4 text-white/82">
          {locale === "fr" ? "Télécharge l’app sur l’App Store" : "Download the app on the App Store"}
        </p>
        <a
          href={APP_STORE_URL}
          className="inline-flex shrink-0 items-center rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[#0d0d0d] transition-colors duration-200 hover:bg-white/92"
        >
          Download on the App Store
        </a>
      </div>
    </div>
  );
}

type HeroSectionProps = {
  content: LandingContent;
  locale?: Locale;
  showOnyxUploader?: boolean;
};

export function HeroSection({ content, locale = "en", showOnyxUploader = true }: HeroSectionProps) {
  const secondaryTitle = content.hero.title[1]?.trim();
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
              <div className="hero-seq-item mb-6 flex justify-center sm:mb-7" style={{ animationDelay: "60ms" }}>
                <LandingCtaLink
                  loggedInHref="https://onyx.vvault.app"
                  loggedOutHref="https://onyx.vvault.app"
                  className="group inline-flex items-center gap-2 text-xs sm:text-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span className="font-semibold text-white">{content.hero.newBadge}</span>
                  <span className="text-white/72">{content.hero.onyxLabel}</span>
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4 fill-none stroke-current text-white/42 stroke-[1.8] transition-transform duration-300 ease-out group-hover:translate-x-1"
                  >
                    <path d="M4 10h11M11 6l4 4-4 4" />
                  </svg>
                </LandingCtaLink>
              </div>
            ) : null}

            <h1 className="font-display text-[2.55rem] font-normal leading-[0.95] tracking-tight text-white sm:text-[3.75rem] lg:text-[4.7rem]">
              <span className="hero-line-reveal" style={{ animationDelay: "80ms" }}>
                {content.hero.title[0]}
              </span>
              {secondaryTitle ? (
                <span className="hero-line-reveal" style={{ animationDelay: "280ms" }}>
                  {secondaryTitle}
                </span>
              ) : null}
            </h1>

          </div>

          <HeroTrustedBy locale={locale} usersTotal={stats.usersTotal} loaded={loaded} avatarUrls={stats.avatarUrls} />

          <div className="hero-seq-item mt-7 flex justify-center" style={{ animationDelay: "1480ms" }}>
            <LandingCtaLink
              loggedInHref="https://vvault.app/signup"
              loggedOutHref="https://vvault.app/signup"
              className="inline-flex items-center rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:px-6 sm:text-base"
            >
              Start for free
            </LandingCtaLink>
          </div>
        </div>
        <MobileAppStoreBar locale={locale} />
      </section>

      <HeroLiveStats locale={locale} stats={stats} loaded={loaded} />
    </>
  );
}
