"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DollarSign, Music2, Star } from "lucide-react";
import type { LandingContent, Locale } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

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

function StatIcon({ statKey }: { statKey: string }) {
  if (statKey === "emails") {
    return (
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-white/75" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="2.5" y="4.5" width="15" height="11" rx="2.3" />
        <path d="M3.5 6.2 10 11l6.5-4.8" />
      </svg>
    );
  }
  if (statKey === "users") {
    return (
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-white/75" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="10" cy="7" r="3.1" />
        <path d="M4.3 16c1.2-2.4 3.2-3.6 5.7-3.6S14.5 13.6 15.7 16" />
      </svg>
    );
  }
  if (statKey === "tracks") {
    return <Music2 className="h-3.5 w-3.5 text-white/75" strokeWidth={1.9} />;
  }
  if (statKey === "money") {
    return <DollarSign className="h-3.5 w-3.5 text-white/75" strokeWidth={1.9} />;
  }
  if (statKey === "review") {
    return <Star className="h-3.5 w-3.5 text-white/75" strokeWidth={1.9} />;
  }
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-white/75" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="m10 3 2.1 4.2 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7L3.2 8l4.7-.7Z" />
    </svg>
  );
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
    <div className="hero-seq-item mt-56 mb-4 py-4 sm:py-6" style={{ animationDelay: "1480ms" }}>
        <div className="flex justify-center">
        <div className="grid w-full max-w-[980px] grid-cols-2 gap-x-8 gap-y-7 text-center sm:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.key} className="flex flex-col items-center justify-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/72">
                {card.label}
                <StatIcon statKey={card.key} />
              </span>
              <span className="mt-1 text-[1.7rem] font-black leading-none text-white sm:text-[2.15rem]">
                <RollingValue key={`${card.key}-${card.value}`} value={card.value} loaded={loaded} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroAppMock() {
  return (
    <div className="relative mt-14 sm:mt-16">
      <div
        className="pointer-events-none absolute left-[calc(50%-50vw)] top-[-142px] bottom-[-104px] z-0 w-screen overflow-hidden hero-seq-item"
        style={{ animationDelay: "760ms" }}
      >
        <div className="h-full w-full rounded-b-[18px] bg-[linear-gradient(to_bottom,rgba(160,169,179,0)_0%,rgba(160,169,179,0.012)_16%,rgba(159,168,178,0.05)_33%,rgba(157,166,176,0.14)_52%,rgba(153,162,172,0.27)_72%,rgba(149,159,169,0.40)_88%,rgba(145,155,166,0.50)_100%)]" />
      </div>
      <div
        className="pointer-events-none absolute left-[calc(50%-50vw)] bottom-[-34px] z-[1] w-screen hero-seq-item"
        style={{ animationDelay: "760ms" }}
      >
        <div className="mx-auto h-[clamp(72px,9vw,132px)] w-[clamp(360px,44vw,840px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.08)_42%,rgba(255,255,255,0)_78%)] blur-[10px]" />
      </div>

      <div
        className="relative z-10 -ml-[18px] w-[calc(100%+36px)] sm:-ml-[32px] sm:w-[calc(100%+64px)] lg:-ml-[72px] lg:w-[calc(100%+144px)] hero-seq-item"
        style={{ animationDelay: "1080ms" }}
      >
        <img
          src="/app%20show-off.png"
          alt="vvault app interface"
          className="block h-auto w-full max-w-none select-none"
          loading="eager"
          decoding="async"
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
        />
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
    <section className="pb-8 pt-44 sm:pb-12 sm:pt-52 lg:pb-16 lg:pt-58">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
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

        <HeroAppMock />

        <HeroLiveStats locale={locale} stats={stats} loaded={loaded} />
      </div>
      <MobileAppStoreBar locale={locale} />
    </section>
  );
}
