"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

const ColorBends = dynamic(() => import("@/components/landing/ColorBends"), {
  ssr: false,
});

function BarChartIcon({ className = "", gradId }: { className?: string; gradId?: string }) {
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
        d="M3 21h18"
      />
      <path
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M5 21V7h3v14M10 21V3h3v18M15 21v-8h3v8"
      />
    </svg>
  );
}

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
          <linearGradient id="chrome-analytics-hero" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="18%" stopColor="rgba(215,220,235,0.65)" />
            <stop offset="38%" stopColor="rgba(150,160,185,0.35)" />
            <stop offset="55%" stopColor="rgba(180,190,215,0.5)" />
            <stop offset="72%" stopColor="rgba(59,130,246,0.35)" />
            <stop offset="88%" stopColor="rgba(59,130,246,0.55)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.4)" />
          </linearGradient>
        </defs>
      </svg>
      <BarChartIcon className="relative z-10 h-14 w-14 sm:h-16 sm:w-16" gradId="chrome-analytics-hero" />
      {/* Bottom accent glow — blue */}
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(59,130,246,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {/* Bottom edge accent line — blue */}
      <div
        className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.25) 30%, rgba(59,130,246,0.4) 50%, rgba(59,130,246,0.25) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}

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

function MockDashboardCard({ locale }: { locale: string }) {
  const metrics = [
    { label: locale === "fr" ? "Emails envoyés" : "Emails sent", value: "1,247", trend: "+12%", up: true },
    { label: locale === "fr" ? "Ouvertures" : "Opens", value: "892", sub: "71.5%", trend: "+8%", up: true },
    { label: locale === "fr" ? "Clics" : "Clicks", value: "634", trend: "+23%", up: true },
    { label: locale === "fr" ? "Écoutes" : "Plays", value: "1,089", trend: "+17%", up: true },
    { label: locale === "fr" ? "Téléchargements" : "Downloads", value: "312", trend: "-3%", up: false },
    { label: locale === "fr" ? "Sauvegardes" : "Saves", value: "187", trend: "+5%", up: true },
    { label: locale === "fr" ? "Achats" : "Purchases", value: "24", trend: "+42%", up: true },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.15)",
            }}
          >
            <BarChartIcon className="h-5 w-5 text-blue-400/80" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white/85">
              {locale === "fr" ? "Vue d'ensemble des campagnes" : "Campaign overview"}
            </p>
            <p className="text-[11px] text-white/35">
              {locale === "fr" ? "30 derniers jours · Toutes les campagnes" : "Last 30 days · All campaigns"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="rounded-xl px-4 py-3.5"
              style={{
                border: "1px solid rgba(255,255,255,0.04)",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <p className="text-[11px] text-white/30">{m.label}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[20px] font-semibold tabular-nums text-white/80">
                  {m.value}
                </span>
                {m.sub && (
                  <span className="text-[11px] text-white/30">{m.sub}</span>
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-1">
                <svg
                  viewBox="0 0 10 10"
                  className={`h-2.5 w-2.5 ${m.up ? "text-emerald-400/70" : "text-red-400/70"}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  {m.up ? (
                    <path d="M2 7L5 3L8 7" />
                  ) : (
                    <path d="M2 3L5 7L8 3" />
                  )}
                </svg>
                <span
                  className={`text-[10px] font-medium tabular-nums ${
                    m.up ? "text-emerald-400/60" : "text-red-400/60"
                  }`}
                >
                  {m.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

function MockActivityFeedCard({ locale }: { locale: string }) {
  const events = [
    {
      name: "Noah",
      action: locale === "fr" ? "a ouvert Pack 07" : "opened Pack 07",
      time: "2m ago",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 8h12M8 2l6 6-6 6" />
        </svg>
      ),
      color: "text-blue-400/70",
      dotColor: "bg-blue-400/70",
    },
    {
      name: "Mila",
      action: locale === "fr" ? "a écouté Midnight Chase" : "played Midnight Chase",
      time: "7m ago",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M4 2.5v11l9-5.5z" />
        </svg>
      ),
      color: "text-purple-400/70",
      dotColor: "bg-purple-400/70",
    },
    {
      name: "Kai",
      action: locale === "fr" ? "a téléchargé Dark Melodies Vol.3" : "downloaded Dark Melodies Vol.3",
      time: "11m ago",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v8m0 0l-3-3m3 3l3-3" />
          <path d="M2 12v2h12v-2" />
        </svg>
      ),
      color: "text-amber-400/70",
      dotColor: "bg-amber-400/70",
    },
    {
      name: "Lena",
      action: locale === "fr" ? "a sauvegardé Neon Pulse dans ses favoris" : "saved Neon Pulse to favorites",
      time: "21m ago",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M8 1.5l2 4.5h5l-4 3 1.5 5L8 11.5 3.5 14 5 9 1 6h5z" />
        </svg>
      ),
      color: "text-emerald-400/70",
      dotColor: "bg-emerald-400/70",
    },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold text-white/25">
          {locale === "fr" ? "Activité en temps réel" : "Real-time activity"}
        </p>
        <div className="mt-5 space-y-0">
          {events.map((e, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.dotColor}`} />
                {i < events.length - 1 && (
                  <div className="h-full w-px bg-white/[0.06]" />
                )}
              </div>
              <div className="flex flex-1 items-center justify-between pb-6">
                <div className="flex items-center gap-2.5">
                  <span className={e.color}>{e.icon}</span>
                  <span className="text-[13px] font-medium text-white/70">
                    <span className="text-white/90">{e.name}</span>{" "}
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

function MockHeatmapCard({ locale }: { locale: string }) {
  const days = locale === "fr" ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["9AM", "12PM", "3PM", "6PM", "9PM"];

  // Opacity values for each cell [day][hour] — simulates engagement intensity
  const data: number[][] = [
    [0.15, 0.25, 0.35, 0.20, 0.10], // Mon
    [0.20, 0.40, 0.85, 0.45, 0.15], // Tue — peak at 3PM
    [0.10, 0.30, 0.50, 0.35, 0.20], // Wed
    [0.25, 0.35, 0.40, 0.30, 0.15], // Thu
    [0.30, 0.45, 0.55, 0.25, 0.10], // Fri
    [0.05, 0.10, 0.15, 0.20, 0.30], // Sat
    [0.05, 0.08, 0.10, 0.15, 0.25], // Sun
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold text-white/25">
          {locale === "fr" ? "Ouvertures par heure" : "Opens by hour"}
        </p>
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[320px]">
            {/* Header row */}
            <div className="mb-2 flex">
              <div className="w-10 shrink-0" />
              {hours.map((h) => (
                <div key={h} className="flex-1 text-center text-[10px] text-white/25">
                  {h}
                </div>
              ))}
            </div>
            {/* Grid rows */}
            {days.map((day, di) => (
              <div key={day} className="mb-1 flex items-center">
                <div className="w-10 shrink-0 text-[10px] text-white/30">
                  {day}
                </div>
                {data[di].map((opacity, hi) => (
                  <div key={hi} className="flex-1 px-0.5">
                    <div
                      className="h-7 rounded-md"
                      style={{
                        background: `rgba(59,130,246,${opacity})`,
                        border: opacity > 0.7
                          ? "1px solid rgba(59,130,246,0.3)"
                          : "1px solid rgba(255,255,255,0.02)",
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-center gap-2">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-blue-400/60" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 4v4l3 2" />
          </svg>
          <span className="text-[11px] font-medium text-blue-400/50">
            {locale === "fr" ? "Meilleur moment pour envoyer : Mardi 14h00" : "Best time to send: Tuesday 2:00 PM"}
          </span>
        </div>
      </div>
    </GlowCard>
  );
}

function MockLeaderboardCard({ locale }: { locale: string }) {
  const topCampaigns = [
    { rank: 1, name: "Pack 07 Release", metric: locale === "fr" ? "14 ouvertures" : "14 opens" },
    { rank: 2, name: "Dark Melodies Vol.3", metric: locale === "fr" ? "11 ouvertures" : "11 opens" },
    { rank: 3, name: "Monthly Digest", metric: locale === "fr" ? "9 ouvertures" : "9 opens" },
  ];

  const topPacks = [
    { rank: 1, name: "Dark Melodies Vol.3", metric: locale === "fr" ? "89 écoutes" : "89 plays" },
    { rank: 2, name: "808 Essentials", metric: locale === "fr" ? "64 écoutes" : "64 plays" },
    { rank: 3, name: "Lo-fi Textures", metric: locale === "fr" ? "41 écoutes" : "41 plays" },
  ];

  const hotContacts = [
    { name: "Noah", score: 87 },
    { name: "Lena", score: 91 },
    { name: "Kai", score: 65 },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold text-white/25">
          {locale === "fr" ? "Meilleures campagnes" : "Top campaigns"}
        </p>
        <div className="mt-5 space-y-2">
          {topCampaigns.map((t) => (
            <div
              key={t.rank}
              className="flex items-center justify-between rounded-2xl px-4 py-3 transition-colors duration-200 hover:bg-white/[0.03]"
              style={{
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold tabular-nums text-white/60"
                  style={{
                    background: t.rank === 1 ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
                    border: t.rank === 1 ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {t.rank}
                </span>
                <p className="text-[13px] font-medium text-white/75">{t.name}</p>
              </div>
              <span className="text-[12px] tabular-nums text-white/40">
                {t.metric}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[11px] font-semibold text-white/25">
          {locale === "fr" ? "Meilleurs packs" : "Top packs"}
        </p>
        <div className="mt-3 space-y-2">
          {topPacks.map((t) => (
            <div
              key={t.rank}
              className="flex items-center justify-between rounded-2xl px-4 py-3 transition-colors duration-200 hover:bg-white/[0.03]"
              style={{
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold tabular-nums text-white/60"
                  style={{
                    background: t.rank === 1 ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
                    border: t.rank === 1 ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {t.rank}
                </span>
                <p className="text-[13px] font-medium text-white/75">{t.name}</p>
              </div>
              <span className="text-[12px] tabular-nums text-white/40">
                {t.metric}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[11px] font-semibold text-white/25">
          {locale === "fr" ? "Contacts actifs" : "Hot contacts"}
        </p>
        <div className="mt-3 flex gap-3">
          {hotContacts.map((c) => (
            <div
              key={c.name}
              className="flex-1 rounded-xl px-3 py-2.5 text-center"
              style={{
                border: "1px solid rgba(255,255,255,0.04)",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <p className="text-[13px] font-medium text-white/70">{c.name}</p>
              <p className="mt-0.5 text-[11px] tabular-nums text-emerald-400/60">{c.score}</p>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

export default function FeatureAnalyticsPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === "fr"
      ? "vvault | Analytics — Mesure le vrai engagement"
      : "vvault | Analytics — Track true engagement";
  }, [locale]);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      {/* Plasma hero background — fixed, full-width, blue accent */}
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
          <ColorBends
            colors={["#3b82f6"]}
            rotation={90}
            speed={0.2}
            scale={1.2}
            frequency={1}
            warpStrength={1}
            mouseInfluence={0}
            noise={0.15}
            parallax={0.5}
            iterations={1}
            intensity={1.5}
            bandWidth={6}
            transparent
            autoRotate={0}
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[680px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">

        {/* Emblem + Hero */}
        <Reveal>
          <Emblem />

          <h1
            className="mt-8 text-center text-3xl font-medium leading-tight tracking-tight sm:text-[2.8rem]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {locale === "fr" ? "Mesure le vrai engagement" : "Track true engagement"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {locale === "fr"
              ? "Sache qui écoute vraiment, ce qu'ils jouent, combien de temps ils restent, et quand ils reviennent acheter."
              : "Know who is really listening, what they play, how long they stay, and when they come back to buy."}
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="https://vvault.app/signup"
              className="inline-flex items-center rounded-xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
            >
              {locale === "fr" ? "Commencer" : "Get started"}
            </a>
          </div>
        </Reveal>

        {/* Section 1: Dashboard */}
        <Reveal className="mt-40 sm:mt-52">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Tout en un coup d'oeil" : "Everything at a glance"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "La plupart des plateformes s'arrêtent aux ouvertures et clics. vvault trace le parcours complet — de l'ouverture de l'email à l'écoute du beat, au téléchargement, à l'achat — pour que tu voies exactement quelles campagnes et tracks génèrent de vrais résultats."
              : "Most platforms stop at opens and clicks. vvault tracks the full journey — from email open to beat play to download to purchase — so you see exactly which campaigns and tracks drive real results."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockDashboardCard locale={locale} />
          </div>
        </Reveal>

        {/* Section 2: Activity Feed */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Fil d'activité en temps réel" : "Real-time activity feed"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Regarde l'engagement se produire en direct. Chaque ouverture, écoute, téléchargement et achat apparaît au moment où ça arrive — pour que tu puisses relancer tant que l'intérêt est frais."
              : "Watch engagement happen live. Every open, play, download, and purchase appears the moment it happens — so you can follow up while the interest is fresh."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockActivityFeedCard locale={locale} />
          </div>
        </Reveal>

        {/* Section 3: Heatmap */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Trouve le moment parfait pour envoyer" : "Find the perfect send time"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "vvault analyse quand ton audience s'engage vraiment et te donne le jour et l'heure optimaux pour ta prochaine campagne. Arrête de deviner — laisse les données décider."
              : "vvault analyzes when your audience actually engages and surfaces the optimal day and hour to send your next campaign. Stop guessing — let the data decide."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockHeatmapCard locale={locale} />
          </div>
        </Reveal>

        {/* Section 4: Leaderboards */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Connais tes meilleurs performers" : "Know your top performers"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Vois quelles campagnes génèrent le plus d'engagement et quels contacts sont tes leads les plus chauds. Classements des meilleures campagnes, meilleurs packs, et contacts les plus actifs — tout au même endroit."
              : "See which campaigns drive the most engagement and which contacts are your hottest leads. Leaderboards for top campaigns, top packs, and hot contacts — all in one place."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockLeaderboardCard locale={locale} />
          </div>
        </Reveal>

        {/* Section 5: Why it matters */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Pourquoi c'est important" : "Why it matters"}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: locale === "fr" ? "Au-delà des vanity metrics" : "Beyond vanity metrics",
                desc: locale === "fr"
                  ? "Les ouvertures ne veulent rien dire si personne n'écoute. vvault connecte chaque métrique à l'engagement réel pour que tu saches ce qui marche."
                  : "Opens mean nothing if nobody listens. vvault connects every metric to actual engagement so you know what is working.",
              },
              {
                title: locale === "fr" ? "Scoring par destinataire" : "Per-recipient scoring",
                desc: locale === "fr"
                  ? "Chaque contact reçoit un score d'engagement basé sur son activité. Identifie instantanément tes auditeurs les plus engagés et tes acheteurs sérieux."
                  : "Every contact gets an engagement score based on their activity. Instantly identify your most engaged listeners and serious buyers.",
              },
              {
                title: locale === "fr" ? "Visibilité du funnel" : "Funnel visibility",
                desc: locale === "fr"
                  ? "Vois le parcours complet de l'ouverture de l'email à l'écoute du beat jusqu'à l'achat. Identifie où les auditeurs décrochent et optimise ton flow."
                  : "See the full journey from email open to beat play to purchase. Identify where listeners drop off and optimize your flow.",
              },
              {
                title: locale === "fr" ? "Insights actionnables" : "Actionable insights",
                desc: locale === "fr"
                  ? "Les données brutes deviennent des recommandations claires — quand envoyer, qui relancer, et quels beats pousser."
                  : "Raw data becomes clear recommendations — when to send, who to follow up with, and which beats to push.",
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
              {locale === "fr" ? "Commence à tracker ce qui compte" : "Start tracking what matters"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {locale === "fr"
                ? "Inscris-toi gratuitement et vois exactement comment ton audience interagit avec chaque beat que tu envoies."
                : "Sign up for free and see exactly how your audience engages with every beat you send."}
            </p>
            <div className="mt-6 flex justify-center">
              <a
                href="https://vvault.app/signup"
                className="inline-flex items-center rounded-xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
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
