"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { DollarSign, Music2 } from "lucide-react";
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
const TRUSTED_SLOT_ROTATION_ORDER = [2, 0, 3, 1, 4] as const;
const HERO_TURN_WORDS = ["emails", "DMs", "messages"] as const;
const HERO_INTO_WORDS = ["sales", "placements"] as const;
const HERO_TRACK_WORDS = ["opens", "clicks", "plays"] as const;

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

  return Array.from(unique).slice(0, 120);
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

function RotatingWord({
  words,
  intervalMs,
  delayMs = 0,
  className,
}: {
  words: readonly string[];
  intervalMs: number;
  delayMs?: number;
  className?: string;
}) {
  const controls = useAnimationControls();
  const [index, setIndex] = useState(0);
  const [widthIndex, setWidthIndex] = useState(0);
  const [wordWidths, setWordWidths] = useState<number[]>([]);
  const measureRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const indexRef = useRef(0);
  const animatingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    controls.set({ opacity: 1, y: "0%", rotateX: 0, scale: 1 });
    return () => {
      mountedRef.current = false;
    };
  }, [controls]);

  useLayoutEffect(() => {
    const measure = () => {
      const widths = words.map((_, idx) => {
        const node = measureRefs.current[idx];
        if (!node) return 0;
        return Math.ceil(node.getBoundingClientRect().width);
      });
      setWordWidths(widths);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [words, className]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (words.length <= 1) return;

    const rotateOutMs = 330;
    const rotateInMs = 430;
    let intervalId: number | undefined;
    const runTransition = async () => {
      if (animatingRef.current || !mountedRef.current) return;

      const next = (indexRef.current + 1) % words.length;
      animatingRef.current = true;
      if (mountedRef.current) {
        setWidthIndex(next);
      }

      await controls.start({
        opacity: 0.22,
        y: "-20%",
        rotateX: -40,
        scale: 0.994,
        transition: { duration: rotateOutMs / 1000, ease: [0.35, 0, 1, 1] },
      });

      if (!mountedRef.current) {
        animatingRef.current = false;
        return;
      }

      indexRef.current = next;
      setIndex(next);
      controls.set({ opacity: 0.22, y: "20%", rotateX: 40, scale: 0.994 });

      await controls.start({
        opacity: 1,
        y: "0%",
        rotateX: 0,
        scale: 1,
        transition: { duration: rotateInMs / 1000, ease: [0.16, 1, 0.3, 1] },
      });

      animatingRef.current = false;
    };

    const timeoutId = window.setTimeout(() => {
      void runTransition();
      intervalId = window.setInterval(() => {
        void runTransition();
      }, intervalMs);
    }, delayMs + intervalMs);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      animatingRef.current = false;
    };
  }, [controls, delayMs, intervalMs, words.length]);

  const current = words[index] ?? words[0] ?? "";
  const targetWidth = wordWidths[widthIndex] ?? wordWidths[index];
  const tokenClass = className ?? "font-inherit text-inherit";

  return (
    <span className="relative inline-flex h-[1.24em] items-center align-baseline">
      <span className="pointer-events-none absolute -z-10 select-none opacity-0" aria-hidden="true">
        {words.map((word, idx) => (
          <span
            key={`measure-${word}-${idx}`}
            ref={(node) => {
              measureRefs.current[idx] = node;
            }}
            className={`absolute left-0 top-0 inline-block whitespace-nowrap ${tokenClass}`}
          >
            {word}
          </span>
        ))}
      </span>
      <motion.span
        className="relative inline-block overflow-visible align-baseline leading-[1.15]"
        animate={typeof targetWidth === "number" && targetWidth > 0 ? { width: targetWidth } : undefined}
        transition={{ type: "spring", stiffness: 170, damping: 30, mass: 1 }}
      >
        <span className={`invisible inline-block whitespace-nowrap ${tokenClass}`}>{current}</span>
        <motion.span
          animate={controls}
          initial={false}
          className={`absolute left-0 top-0 inline-block whitespace-nowrap ${tokenClass}`}
          style={{ transformPerspective: 640, transformOrigin: "50% 50%" }}
        >
          {current}
        </motion.span>
      </motion.span>
    </span>
  );
}

function HeroAnimatedDescription({ locale, fallbackDescription }: { locale: Locale; fallbackDescription: string }) {
  if (locale !== "en") {
    return <span className="hero-line-reveal">{fallbackDescription}</span>;
  }

  return (
    <motion.span
      layout
      transition={{ layout: { type: "spring", stiffness: 220, damping: 28, mass: 0.82 } }}
      className="hero-line-reveal inline text-white/38 sm:whitespace-nowrap"
    >
      <span>Turn </span>
      <RotatingWord
        words={HERO_TURN_WORDS}
        intervalMs={2600}
      />
      <span> into </span>
      <RotatingWord
        words={HERO_INTO_WORDS}
        intervalMs={3200}
        delayMs={220}
      />
      <span>. Track </span>
      <RotatingWord
        words={HERO_TRACK_WORDS}
        intervalMs={2300}
        delayMs={420}
      />
      <span>, downloads and more.</span>
    </motion.span>
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
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-white/75" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="m10 3 2.1 4.2 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7L3.2 8l4.7-.7Z" />
    </svg>
  );
}

function HeroTrustedBy({
  usersTotal,
  loaded,
  avatarUrls,
}: {
  usersTotal: number;
  loaded: boolean;
  avatarUrls: string[];
}) {
  const AVATAR_SLOT_COUNT = 5;
  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-US"), []);
  const avatarsKey = useMemo(() => avatarUrls.join("|"), [avatarUrls]);
  const avatarPoolRef = useRef<string[]>(avatarUrls);
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
  const slotCursorRef = useRef(0);
  const avatarCursorRef = useRef(AVATAR_SLOT_COUNT);

  useEffect(() => {
    avatarPoolRef.current = avatarUrls;
  }, [avatarUrls]);

  useEffect(() => {
    const initTimeoutId = window.setTimeout(() => {
      const pool = avatarPoolRef.current;
      const seeded =
        pool.length === 0
          ? Array.from({ length: AVATAR_SLOT_COUNT }, () => ({ layerA: "", layerB: "", showA: true }))
          : Array.from({ length: AVATAR_SLOT_COUNT }, (_, idx) => {
              const url = pool[idx % pool.length] || "";
              return { layerA: url, layerB: url, showA: true };
            });
      setSlots(seeded);
      slotCursorRef.current = 0;
      avatarCursorRef.current = AVATAR_SLOT_COUNT;
    }, 0);

    return () => clearTimeout(initTimeoutId);
  }, [avatarsKey]);

  useEffect(() => {
    if (avatarPoolRef.current.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setSlots((currentSlots) => {
        const pool = avatarPoolRef.current;
        if (pool.length <= 1) return currentSlots;

        const slot =
          TRUSTED_SLOT_ROTATION_ORDER[slotCursorRef.current % TRUSTED_SLOT_ROTATION_ORDER.length];
        slotCursorRef.current += 1;
        const currentSlot = currentSlots[slot];
        const currentUrl = currentSlot.showA ? currentSlot.layerA : currentSlot.layerB;

        let nextUrl = pool[avatarCursorRef.current % pool.length] || "";
        avatarCursorRef.current += 1;
        let guard = 0;
        while (nextUrl === currentUrl && guard < 6) {
          nextUrl = pool[avatarCursorRef.current % pool.length] || "";
          avatarCursorRef.current += 1;
          guard += 1;
        }

        if (!nextUrl || nextUrl === currentUrl) return currentSlots;

        const prepped = [...currentSlots];
        prepped[slot] = currentSlot.showA
          ? { ...currentSlot, layerB: nextUrl }
          : { ...currentSlot, layerA: nextUrl };

        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = window.requestAnimationFrame(() => {
          setSlots((prevSlots) => {
            const next = [...prevSlots];
            next[slot] = { ...next[slot], showA: !next[slot].showA };
            return next;
          });
        });

        return prepped;
      });
    }, 1800);

    return () => {
      clearInterval(intervalId);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [avatarsKey]);

  return (
    <div className="hero-seq-item mt-10 flex justify-center" style={{ animationDelay: "1360ms" }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          {slots.map((slotState, idx) => {
            const tone = placeholderTones[idx % placeholderTones.length];

            return (
            <span
              key={`trusted-avatar-${idx}`}
              className={`${
                idx === 0 ? "ml-0" : "-ml-2.5"
              } relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]`}
            >
              {slotState.layerA ? (
                <span
                  className={`absolute inset-0 block bg-cover bg-center transition-opacity duration-700 ease-in-out ${
                    slotState.showA ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ backgroundImage: `url("${slotState.layerA}")` }}
                />
              ) : (
                <span
                  className={`absolute inset-0 block bg-gradient-to-br ${tone} transition-opacity duration-700 ease-in-out ${
                    slotState.showA ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}
              {slotState.layerB ? (
                <span
                  className={`absolute inset-0 block bg-cover bg-center transition-opacity duration-700 ease-in-out ${
                    slotState.showA ? "opacity-0" : "opacity-100"
                  }`}
                  style={{ backgroundImage: `url("${slotState.layerB}")` }}
                />
              ) : (
                <span
                  className={`absolute inset-0 block bg-gradient-to-br ${tone} transition-opacity duration-700 ease-in-out ${
                    slotState.showA ? "opacity-0" : "opacity-100"
                  }`}
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
          artists & beatmakers
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

  const statCards = [
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
  ];

  return (
    <div className="hero-seq-item mt-4 mb-16 py-4 sm:py-6" style={{ animationDelay: "1480ms" }}>
        <div className="flex justify-center">
        <div className="grid w-full max-w-[980px] grid-cols-2 gap-x-8 gap-y-7 text-center sm:grid-cols-3">
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

function HeroAppMock({ content }: { content: LandingContent }) {
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

      <div className="absolute inset-x-0 top-[112%] z-20 flex justify-center sm:top-[116%] lg:top-[100%]">
        <div className="flex items-center gap-4">
          <LandingCtaLink
            loggedInHref="https://vvault.app/signup"
            loggedOutHref="https://vvault.app/signup"
            className="hero-seq-item inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:px-5 sm:py-2.5"
            style={{ animationDelay: "980ms" }}
          >
            {content.hero.primaryCtaLabel}
          </LandingCtaLink>
          <span className="hero-seq-item hidden text-sm font-medium text-white/82 lg:inline" style={{ animationDelay: "1040ms" }}>
            {content.hero.primaryCtaHint}
          </span>
        </div>
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

type HeroSectionProps = {
  content: LandingContent;
  locale?: Locale;
  showOnyxUploader?: boolean;
};

export function HeroSection({ content, locale = "en", showOnyxUploader = true }: HeroSectionProps) {
  const secondaryTitle = content.hero.title[1]?.trim();
  const { stats, loaded } = useLandingStats();

  return (
    <section className="pb-20 pt-44 sm:pb-28 sm:pt-52 lg:pb-36 lg:pt-58">
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

          <div className="mt-7 flex flex-col items-center gap-4">
            <p className="max-w-[980px] text-sm leading-6 text-white/30 sm:text-base sm:leading-7">
              <HeroAnimatedDescription locale={locale} fallbackDescription={content.hero.description} />
            </p>
          </div>
        </div>

        <HeroTrustedBy usersTotal={stats.usersTotal} loaded={loaded} avatarUrls={stats.avatarUrls} />

        <HeroLiveStats locale={locale} stats={stats} loaded={loaded} />

        <HeroAppMock content={content} />
      </div>
    </section>
  );
}
