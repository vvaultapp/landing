"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

const Plasma = dynamic(() => import("@/components/landing/Plasma"), {
  ssr: false,
});

/* ------------------------------------------------------------------ */
/*  Send / Mail icon                                                  */
/* ------------------------------------------------------------------ */
function SendIcon({
  className = "",
  gradId,
}: {
  className?: string;
  gradId?: string;
}) {
  const strokeColor = gradId ? `url(#${gradId})` : "currentColor";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M21.75 2.25 10.5 13.5"
      />
      <path
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M21.75 2.25l-6.75 19.5-3.75-8.25L3 9l18.75-6.75z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Emblem                                                            */
/* ------------------------------------------------------------------ */
function Emblem() {
  return (
    <div
      className="relative mx-auto flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-[26px] sm:h-[120px] sm:w-[120px] sm:rounded-[30px]"
      style={{
        background:
          "linear-gradient(160deg, rgba(30,30,35,0.6) 0%, rgba(8,8,10,0.95) 35%, rgba(0,0,0,1) 100%)",
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
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
      <div
        className="pointer-events-none absolute left-0 top-0 h-[60%] w-[70%]"
        style={{
          background:
            "radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.03) 0%, transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-[15%] top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)",
        }}
      />
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient
            id="chrome-campaign-hero"
            x1="0.5"
            y1="0"
            x2="0.5"
            y2="1"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="18%" stopColor="rgba(215,220,235,0.65)" />
            <stop offset="38%" stopColor="rgba(150,160,185,0.35)" />
            <stop offset="55%" stopColor="rgba(180,190,215,0.5)" />
            <stop offset="72%" stopColor="rgba(139,92,246,0.35)" />
            <stop offset="88%" stopColor="rgba(139,92,246,0.55)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.4)" />
          </linearGradient>
        </defs>
      </svg>
      <SendIcon
        className="relative z-10 h-14 w-14 sm:h-16 sm:w-16"
        gradId="chrome-campaign-hero"
      />
      {/* Bottom accent glow */}
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(139,92,246,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {/* Bottom edge accent line */}
      <div
        className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.25) 30%, rgba(139,92,246,0.4) 50%, rgba(139,92,246,0.25) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GlowCard                                                          */
/* ------------------------------------------------------------------ */
function GlowCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(8,8,10,0.98) 0%, rgba(4,4,5,1) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          border: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "none",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[inherit]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[120px] w-[400px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock Campaign Builder Card                                        */
/* ------------------------------------------------------------------ */
function MockCampaignBuilderCard() {
  const tracks = [
    { name: "Midnight Chase.wav", size: "4.2 MB" },
    { name: "Velvet Haze.wav", size: "3.8 MB" },
    { name: "Neon Drift.wav", size: "5.1 MB" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        {/* Campaign name */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.15)",
            }}
          >
            <SendIcon className="h-5 w-5 text-violet-400/80" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white/85">
              Pack 07 Release
            </p>
            <p className="text-[11px] text-white/35">Draft campaign</p>
          </div>
        </div>

        {/* Channel selector */}
        <div className="mt-6">
          <p className="text-[11px] font-medium text-white/25">CHANNEL</p>
          <div className="mt-2 flex gap-2">
            {[
              { label: "Email", active: true },
              { label: "Instagram", active: false },
              { label: "Messages", active: false },
            ].map((ch) => (
              <span
                key={ch.label}
                className="rounded-xl px-3 py-1.5 text-[12px] font-medium"
                style={{
                  background: ch.active
                    ? "rgba(139,92,246,0.12)"
                    : "rgba(255,255,255,0.03)",
                  border: ch.active
                    ? "1px solid rgba(139,92,246,0.25)"
                    : "1px solid rgba(255,255,255,0.06)",
                  color: ch.active
                    ? "rgba(167,139,250,0.9)"
                    : "rgba(255,255,255,0.35)",
                }}
              >
                {ch.label}
              </span>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <div className="mt-5 space-y-0">
          {[
            { label: "Campaign name", value: "Pack 07 Release" },
            { label: "Subject", value: "New Pack: Dark Melodies Vol.3" },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-white/[0.04] py-3"
            >
              <span className="text-[12px] text-white/35">{row.label}</span>
              <span className="text-[13px] font-medium text-white/70">
                {row.value}
              </span>
            </div>
          ))}

          {/* Recipients row with avatars */}
          <div className="flex items-center justify-between border-b border-white/[0.04] py-3">
            <span className="text-[12px] text-white/35">Recipients</span>
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-1.5">
                {["N", "M", "K", "A"].map((initial, i) => (
                  <span
                    key={i}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white/80 ring-1 ring-black"
                    style={{
                      background: [
                        "hsl(260,45%,25%)",
                        "hsl(200,45%,25%)",
                        "hsl(160,45%,25%)",
                        "hsl(25,50%,22%)",
                      ][i],
                    }}
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <span className="text-[13px] font-medium text-white/70">
                French Contacts (19)
              </span>
            </div>
          </div>
        </div>

        {/* Attached tracks */}
        <div className="mt-5">
          <p className="text-[11px] font-medium text-white/25">
            CONTENT
          </p>
          <div className="mt-2.5 space-y-1.5">
            {tracks.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5 text-violet-400/50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M13 2v9a2 2 0 1 1-2-2V4L6 5.5v7a2 2 0 1 1-2-2V3l9-1z" />
                  </svg>
                  <span className="text-[12px] font-medium text-white/60">
                    {t.name}
                  </span>
                </div>
                <span className="text-[11px] text-white/25">{t.size}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <span
            className="flex-1 rounded-xl py-2.5 text-center text-[13px] font-semibold"
            style={{
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "rgba(167,139,250,0.9)",
            }}
          >
            Send campaign
          </span>
          <span
            className="rounded-xl px-5 py-2.5 text-center text-[13px] font-medium text-white/40"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            Save draft
          </span>
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock Campaign Stats Card                                          */
/* ------------------------------------------------------------------ */
function MockCampaignStatsCard() {
  const stats = [
    { label: "Recipients", value: 19, max: 19, color: "rgba(139,92,246,0.5)" },
    { label: "Opens", value: 14, max: 19, color: "rgba(96,165,250,0.5)" },
    { label: "Clicks", value: 9, max: 19, color: "rgba(52,211,153,0.5)" },
    { label: "Plays", value: 23, max: 23, color: "rgba(251,191,36,0.5)" },
    {
      label: "Downloads",
      value: 6,
      max: 19,
      color: "rgba(244,114,182,0.5)",
    },
    {
      label: "Saves",
      value: 4,
      max: 19,
      color: "rgba(251,146,60,0.5)",
    },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-white/85">
              Pack 07 Release
            </p>
            <p className="text-[11px] text-white/35">Sent 2 days ago</p>
          </div>
          <span
            className="rounded-lg px-2.5 py-1 text-[10px] font-semibold"
            style={{
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.15)",
              color: "rgba(52,211,153,0.7)",
            }}
          >
            Sent
          </span>
        </div>

        {/* Stats row */}
        <div className="mt-6 flex justify-between gap-2">
          {stats.map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <p className="text-[18px] font-semibold tabular-nums text-white/80">
                {s.value}
              </p>
              <p className="mt-0.5 text-[10px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bars */}
        <div className="mt-6 space-y-3">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/35">{s.label}</span>
                <span className="text-[11px] tabular-nums text-white/25">
                  {s.value}/{s.max === 23 ? s.value : s.max}
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(s.value / (s.max === 23 ? s.value : s.max)) * 100}%`,
                    background: s.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock Timeline Card                                                */
/* ------------------------------------------------------------------ */
function MockTimelineCard() {
  const events = [
    {
      action: "Noah opened",
      time: "14:23",
      icon: (
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="3" width="12" height="10" rx="2" />
          <path d="M2 5l6 4 6-4" />
        </svg>
      ),
      color: "text-blue-400/70",
      dotColor: "bg-blue-400/70",
    },
    {
      action: "Noah played Midnight Chase (2:14)",
      time: "14:25",
      icon: (
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="currentColor"
        >
          <path d="M5 3l8 5-8 5V3z" />
        </svg>
      ),
      color: "text-violet-400/70",
      dotColor: "bg-violet-400/70",
    },
    {
      action: "Mila opened",
      time: "14:31",
      icon: (
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="3" width="12" height="10" rx="2" />
          <path d="M2 5l6 4 6-4" />
        </svg>
      ),
      color: "text-blue-400/70",
      dotColor: "bg-blue-400/70",
    },
    {
      action: "Mila downloaded full pack",
      time: "14:35",
      icon: (
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M8 2v8m0 0l-3-3m3 3l3-3" />
          <path d="M2 12v2h12v-2" />
        </svg>
      ),
      color: "text-emerald-400/70",
      dotColor: "bg-emerald-400/70",
    },
    {
      action: "Kai clicked link",
      time: "15:02",
      icon: (
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 8.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1" />
          <path d="M10 7.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" />
        </svg>
      ),
      color: "text-amber-400/70",
      dotColor: "bg-amber-400/70",
    },
    {
      action: "Mila saved to library",
      time: "15:10",
      icon: (
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="currentColor"
        >
          <path d="M8 1.5l2 4.5h5l-4 3 1.5 5L8 11.5 3.5 14 5 9 1 6h5z" />
        </svg>
      ),
      color: "text-pink-400/70",
      dotColor: "bg-pink-400/70",
    },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold text-white/25">
          Campaign activity
        </p>
        <div className="mt-5 space-y-0">
          {events.map((e, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.dotColor}`}
                />
                {i < events.length - 1 && (
                  <div className="h-full w-px bg-white/[0.06]" />
                )}
              </div>
              <div className="flex flex-1 items-center justify-between pb-6">
                <div className="flex items-center gap-2.5">
                  <span className={e.color}>{e.icon}</span>
                  <span className="text-[13px] font-medium text-white/70">
                    {e.action}
                  </span>
                </div>
                <span className="text-[11px] text-white/25">{e.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function FeatureCampaignsPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === "fr"
      ? "vvault | Campagnes email pour la musique"
      : "vvault | Email campaigns for music";
  }, [locale]);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      {/* Plasma hero background -- purple accent */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-screen"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.55]">
          <Plasma
            color="#8b5cf6"
            speed={0.3}
            direction="forward"
            scale={1.2}
            opacity={0.6}
            mouseInteractive={false}
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[680px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">
        {/* Hero */}
        <Reveal>
          <Emblem />

          <h1
            className="mt-8 text-center text-3xl font-medium leading-tight tracking-tight sm:text-[2.8rem]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {locale === "fr" ? "Envoie des campagnes qui arrivent" : "Send campaigns that land"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {locale === "fr"
              ? "Des campagnes email pro pensées pour les producteurs. Attache tes beats, suis les écoutes, et envoie depuis Gmail ou ton adresse vvault — direct en boîte principale. Une expérience fluide et soignée du premier clic à l'envoi."
              : "Professional email campaigns built for music producers. Attach beats, track plays, and send from Gmail or your vvault address — straight to the primary inbox. A smooth, polished experience from first click to send."}
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="https://vvault.app/signup"
              className="inline-flex items-center rounded-2xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
            >
              {locale === "fr" ? "Commencer" : "Get started"}
            </a>
          </div>
        </Reveal>

        {/* Section 1: Campaign builder */}
        <Reveal className="mt-40 sm:mt-52">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Crée ta campagne en quelques minutes" : "Build your campaign in minutes"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Choisis ton audience, attache tes tracks, écris ton objet, et envoie. Chaque email part de ta propre adresse Gmail via OAuth sécurisé — on ne stocke jamais ton mot de passe. Atterrit en boîte principale, pas dans les promotions ou le spam."
              : "Pick your audience, attach tracks, write your subject line, and hit send. Every email goes from your own Gmail address via secure OAuth — we never store your password. Lands in primary inboxes, not promotions or spam."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockCampaignBuilderCard />
          </div>
        </Reveal>

        {/* Section 2: Stats */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Sache exactement ce qui s'est passé" : "Know exactly what happened"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Des stats en temps réel pour chaque campagne. Vois qui a ouvert, qui a écouté tes beats, qui a téléchargé, et qui a cliqué. Pas de devinettes — juste des données sur lesquelles agir."
              : "Real-time stats for every campaign. See who opened, who played your beats, who downloaded, and who clicked through. No guesswork — just data you can act on."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockCampaignStatsCard />
          </div>
        </Reveal>

        {/* Section 3: Timeline */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Suis chaque interaction" : "Follow every interaction"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Un fil d'activité en direct te montre exactement ce que chaque destinataire a fait et quand. Sache à la seconde quand quelqu'un écoute ton beat ou télécharge ton pack pour relancer au bon moment."
              : "A live activity feed shows you exactly what each recipient did and when. Know the moment someone plays your beat or downloads your pack so you can follow up at the right time."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockTimelineCard />
          </div>
        </Reveal>

        {/* Section 4: Why it matters */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Pourquoi c'est important" : "Why it matters"}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: locale === "fr" ? "Intégration Gmail" : "Gmail integration",
                desc: locale === "fr"
                  ? "Envoie depuis ta propre adresse. Les destinataires voient ton nom, te répondent directement, et tes emails évitent l'onglet promotions."
                  : "Send from your own address. Recipients see your name, reply directly to you, and your emails avoid the promotions tab entirely.",
              },
              {
                title: locale === "fr" ? "Multi-canal" : "Multi-channel outreach",
                desc: locale === "fr"
                  ? "Envoie tes campagnes par email, Instagram ou messages. Atteins tes contacts sur le canal qu'ils consultent vraiment."
                  : "Send campaigns via email, Instagram, or messages. Reach contacts on the channel they actually check.",
              },
              {
                title: locale === "fr" ? "Suivi de liens intelligent" : "Smart link tracking",
                desc: locale === "fr"
                  ? "Chaque campagne génère des liens trackés. Vois exactement qui a ouvert, cliqué, écouté et téléchargé tes beats."
                  : "Every campaign generates tracked links. See exactly who opened, clicked, played, and downloaded your beats.",
              },
              {
                title: locale === "fr" ? "Pièces jointes" : "Pack attachments",
                desc: locale === "fr"
                  ? "Attache des packs, tracks ou dossiers directement à tes campagnes. Les destinataires reçoivent une expérience d'écoute propre et brandée."
                  : "Attach packs, tracks, or folders directly to your campaigns. Recipients get a clean, branded listening experience.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl px-5 py-5 transition-colors duration-200 hover:bg-white/[0.02]"
                style={{
                  border: "1px solid rgba(255,255,255,0.04)",
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                <p className="text-[14px] font-semibold text-white/80">
                  {item.title}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/35">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Final CTA */}
        <Reveal className="mt-28 sm:mt-36">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-white sm:text-3xl">
              {locale === "fr" ? "Commence à envoyer des campagnes" : "Start sending campaigns"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {locale === "fr"
                ? "Inscris-toi gratuitement et commence à toucher ton audience avec des campagnes qui sont vraiment ouvertes et écoutées."
                : "Sign up for free and start reaching your audience with campaigns that actually get opened and played."}
            </p>
            <div className="mt-6 flex justify-center">
              <a
                href="https://vvault.app/signup"
                className="inline-flex items-center rounded-2xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
              >
                {locale === "fr" ? "Commencer gratuitement" : "Start for free"}
              </a>
            </div>
          </div>
        </Reveal>
      </main>

      <LandingFooter
        locale={locale}
        content={content}
        showColumns={false}
        inlineLegalWithBrand
      />
    </div>
  );
}
