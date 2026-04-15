"use client";

import { useState } from "react";
import { Reveal } from "@/components/landing/Reveal";
import type { Locale } from "@/components/landing/content";

/* ------------------------------------------------------------------ */
/*  Pack cover gradients (matching the 4 images provided)              */
/* ------------------------------------------------------------------ */

const PACK_COVERS = [
  "/covers/pack-1.jpg",
  "/covers/pack-2.jpg",
  "/covers/pack-3.jpg",
  "/covers/pack-4.jpg",
];

/* ------------------------------------------------------------------ */
/*  Section Emblem + Icon SVGs                                         */
/* ------------------------------------------------------------------ */

function SectionEmblem({
  icon,
  accentColor,
  id,
}: {
  icon: (gradId: string) => React.ReactNode;
  accentColor: string;
  id: string;
}) {
  return (
    <div
      className="relative flex h-[80px] w-[80px] items-center justify-center overflow-hidden rounded-[22px] sm:h-[96px] sm:w-[96px] sm:rounded-[26px]"
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
      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
      {/* Top-left specular highlight */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[60%] w-[70%]"
        style={{
          background:
            "radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.04) 0%, transparent 60%)",
        }}
      />
      {/* Top edge highlight line */}
      <div
        className="pointer-events-none absolute inset-x-[15%] top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)",
        }}
      />
      {/* Bottom accent glow — soft diffused spill */}
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background: `radial-gradient(ellipse 100% 60% at 50% 80%, ${accentColor} 0%, transparent 70%)`,
          opacity: 0.12,
          filter: "blur(20px)",
        }}
      />
      {/* Bottom edge accent line — thin, smooth */}
      <div
        className="pointer-events-none absolute inset-x-[20%] bottom-0 h-[0.5px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentColor}40 30%, ${accentColor}70 50%, ${accentColor}40 70%, transparent 100%)`,
        }}
      />
      {/* Left edge subtle highlight */}
      <div
        className="pointer-events-none absolute inset-y-[15%] left-0 w-px"
        style={{
          background: `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, ${accentColor}15 80%, transparent 100%)`,
        }}
      />
      {/* Chrome icon with metallic gradient — lighting cast from bottom accent */}
      <div className="relative z-10">
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id={`chrome-${id}`} x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
              <stop offset="18%" stopColor="rgba(215,220,235,0.65)" />
              <stop offset="38%" stopColor="rgba(150,160,185,0.35)" />
              <stop offset="55%" stopColor="rgba(180,190,215,0.5)" />
              <stop offset="72%" stopColor={accentColor} stopOpacity="0.35" />
              <stop offset="88%" stopColor={accentColor} stopOpacity="0.55" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
        {icon(`chrome-${id}`)}
      </div>
    </div>
  );
}

function AnalyticsIcon({ gradId }: { gradId?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-9 w-9 sm:h-10 sm:w-10"
      fill="none"
      stroke={gradId ? `url(#${gradId})` : "currentColor"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Three bar chart bars */}
      <path d="M6.75 11.25v10.485c0 .198-.048.392-.14.567a1.08 1.08 0 0 1-.392.433C5.71 23.074 5.112 23.255 4.5 23.255s-1.209-.181-1.718-.52a1.08 1.08 0 0 1-.391-.433 1.156 1.156 0 0 1-.141-.567V11.25" />
      <ellipse cx="4.5" cy="11.25" rx="2.25" ry="1.5" />
      <path d="M14.25 7.5v14.235c0 .198-.048.392-.14.567a1.08 1.08 0 0 1-.392.433c-.509.339-1.107.52-1.718.52s-1.209-.181-1.718-.52a1.08 1.08 0 0 1-.391-.433 1.156 1.156 0 0 1-.141-.567V7.5" />
      <ellipse cx="12" cy="7.5" rx="2.25" ry="1.5" />
      <path d="M21.75 3v18.735c0 .198-.048.392-.14.567a1.08 1.08 0 0 1-.392.433c-.509.339-1.107.52-1.718.52s-1.209-.181-1.718-.52a1.08 1.08 0 0 1-.391-.433 1.156 1.156 0 0 1-.141-.567V3" />
      <ellipse cx="19.5" cy="3" rx="2.25" ry="1.5" />
    </svg>
  );
}

function LayersIcon({ gradId }: { gradId?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-9 w-9 sm:h-10 sm:w-10"
      fill="none"
      stroke={gradId ? `url(#${gradId})` : "currentColor"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 12 10 5 10-5" />
      <path d="m2 17 10 5 10-5" />
    </svg>
  );
}

function MoneyIcon({ gradId }: { gradId?: string }) {
  const fillColor = gradId ? `url(#${gradId})` : "currentColor";
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-10 w-10 sm:h-11 sm:w-11"
      fill={fillColor}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 10.781c0.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27 -0.179 3.678 -1.438 3.678 -3.3 0 -1.59 -0.947 -2.51 -2.956 -3.028l-0.722 -0.187V3.467c1.122 0.11 1.879 0.714 2.07 1.616h1.47c-0.166 -1.6 -1.54 -2.748 -3.54 -2.875V1H7.591v1.233c-1.939 0.23 -3.27 1.472 -3.27 3.156 0 1.454 0.966 2.483 2.661 2.917l0.61 0.162v4.031c-1.149 -0.17 -1.94 -0.8 -2.131 -1.718zm3.391 -3.836c-1.043 -0.263 -1.6 -0.825 -1.6 -1.616 0 -0.944 0.704 -1.641 1.8 -1.828v3.495l-0.2 -0.05zm1.591 1.872c1.287 0.323 1.852 0.859 1.852 1.769 0 1.097 -0.826 1.828 -2.2 1.939V8.73z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared                                                             */
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
      {/* Single smooth border overlay — top + sides that fade out, no bottom */}
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
      {/* top glow line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[inherit]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
        }}
      />
      {/* top center glow orb */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[120px] w-[400px] sm:h-[140px] sm:w-[520px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}

function EdgeFade({
  children,
  className = "",
  bottom = true,
  right = true,
  left = false,
}: {
  children: React.ReactNode;
  className?: string;
  bottom?: boolean;
  right?: boolean;
  left?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      {bottom && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
          style={{
            background:
              "linear-gradient(to top, rgba(4,4,5,1) 0%, rgba(4,4,5,0.85) 25%, transparent 100%)",
          }}
        />
      )}
      {right && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[18%]"
          style={{
            background:
              "linear-gradient(to left, rgba(4,4,5,1) 0%, transparent 100%)",
          }}
        />
      )}
      {left && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[8%]"
          style={{
            background:
              "linear-gradient(to right, rgba(4,4,5,0.6) 0%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  1. Analytics — Full-width                                          */
/* ------------------------------------------------------------------ */

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-2xl px-4 py-3.5 transition-colors duration-200 hover:bg-white/[0.03]"
      style={{
        border: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-semibold text-white/30 sm:text-[11px]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[10px] font-medium text-emerald-400/70 sm:text-[11px]">
          {sub}
        </p>
      )}
    </div>
  );
}

function AnalyticsSection({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  const activities = [
    {
      name: "Metro Boomin",
      action: fr ? "a ouvert" : "opened",
      track: "Dark Melody Vol. 3",
      time: fr ? "il y a 2m" : "2m ago",
      dot: "#34d399",
    },
    {
      name: "Southside",
      action: fr ? "a écouté" : "played",
      track: "808 Rage Kit",
      time: fr ? "il y a 4m" : "4m ago",
      dot: "#60a5fa",
    },
    {
      name: "Wheezy",
      action: fr ? "a téléchargé" : "downloaded",
      track: "Flute Type Beat",
      time: fr ? "il y a 12m" : "12m ago",
      dot: "#c084fc",
    },
    {
      name: "TM88",
      action: fr ? "a sauvegardé" : "saved",
      track: "Trap Soul Pack",
      time: fr ? "il y a 18m" : "18m ago",
      dot: "#fbbf24",
    },
    {
      name: "Pi'erre Bourne",
      action: fr ? "a ouvert" : "opened",
      track: "Synth Wave",
      time: fr ? "il y a 24m" : "24m ago",
      dot: "#34d399",
    },
    {
      name: "Murda Beatz",
      action: fr ? "a écouté" : "played",
      track: "Hard Knock",
      time: fr ? "il y a 31m" : "31m ago",
      dot: "#60a5fa",
    },
  ];

  return (
    <Reveal>
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <SectionEmblem accentColor="#60a5fa" icon={(g) => <AnalyticsIcon gradId={g} />} id="analytics" />
        </div>
        <h3 className="text-[1.55rem] font-medium leading-tight text-white sm:text-3xl lg:text-[2.2rem]">
          {locale === "fr" ? (
            <>
              <span className="text-white/40">Vois qui a</span>{" "}
              ouvert.{" "}
              <span className="text-white/40">Qui a</span>{" "}
              écouté.{" "}
              <span className="text-white/40">Qui a</span>{" "}
              téléchargé.
            </>
          ) : (
            <>
              <span className="text-white/40">See who</span>{" "}
              opened.{" "}
              <span className="text-white/40">Who</span>{" "}
              played.{" "}
              <span className="text-white/40">Who</span>{" "}
              downloaded.
            </>
          )}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
          {locale === "fr" ? "Des analytics en temps réel sur chaque envoi." : "Real-time analytics on every send."}
        </p>
      </div>
      <div className="mt-8 sm:mt-10">
        <GlowCard>
          <EdgeFade className="min-h-[320px] sm:min-h-[400px]">
            <div className="select-none px-5 pt-6 sm:px-8 sm:pt-8">
              {/* KPI row */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                <KpiCard
                  icon={
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5 text-white/40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M1 12l4-4 3 3 7-7" />
                      <path d="M11 4h4v4" />
                    </svg>
                  }
                  label={fr ? "Emails envoyés" : "Emails sent"}
                  value="1,247"
                  sub={fr ? "Taux d'ouverture : 76%" : "Open rate: 76%"}
                />
                <KpiCard
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 text-emerald-400/70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  }
                  label={fr ? "Ouvertures" : "Opens"}
                  value="943"
                  sub={fr ? "+12% vs mois dernier" : "+12% vs last month"}
                />
                <KpiCard
                  icon={
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5 text-blue-400/70"
                      fill="currentColor"
                    >
                      <path d="M4.5 3v10l8-5z" />
                    </svg>
                  }
                  label={fr ? "Écoutes" : "Plays"}
                  value="612"
                  sub="+24%"
                />
                <KpiCard
                  icon={
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5 text-purple-400/70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M8 10V2m0 8l-3-3m3 3l3-3" />
                      <path d="M2 12v2h12v-2" />
                    </svg>
                  }
                  label={fr ? "Téléchargements" : "Downloads"}
                  value="89"
                  sub="+7%"
                />
              </div>

              {/* Activity feed */}
              <div className="mt-6 sm:mt-8">
                <p className="px-3 text-[10px] font-semibold text-white/25 sm:text-[11px]">
                  {fr ? "Activité en direct" : "Live activity"}
                </p>
                <div className="mt-2 space-y-0.5">
                  {activities.map((a, i) => (
                    <div
                      key={i}
                      className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2 text-[11px] transition-colors duration-150 hover:bg-white/[0.03] sm:text-[13px]"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: a.dot }}
                      />
                      <span className="font-medium text-white/75">
                        {a.name}
                      </span>
                      <span className="text-white/30">{a.action}</span>
                      <span className="truncate text-white/50">{a.track}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-white/20">
                        {a.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </EdgeFade>
        </GlowCard>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Packs + Send — Resend-style                                     */
/* ------------------------------------------------------------------ */

function PackCard({
  name,
  tracks,
  coverSrc,
  locale = "en",
}: {
  name: string;
  tracks: number;
  coverSrc: string;
  locale?: Locale;
}) {
  return (
    <div className="group flex w-full cursor-default flex-col select-none transition-transform duration-200 hover:-translate-y-0.5">
      <div
        className="relative aspect-square overflow-hidden rounded-2xl"
        style={{
          boxShadow: "0 14px 32px rgba(0,0,0,0.45)",
        }}
      >
        <img
          src={coverSrc}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative flex h-full flex-col justify-between p-3">
          <div>
            <p className="text-base font-semibold tabular-nums text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]">
              {tracks}
            </p>
            <p className="text-[9px] tracking-wide text-white/70">{locale === "fr" ? "pistes" : "tracks"}</p>
          </div>
          <div className="flex justify-end">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-[0_6px_18px_rgba(0,0,0,0.7)] transition-opacity duration-200 group-hover:opacity-100">
              <svg
                viewBox="0 0 16 16"
                className="ml-0.5 h-3 w-3"
                fill="currentColor"
              >
                <path d="M4 2.5v11l9-5.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2.5 px-1">
        <p className="truncate text-[13px] font-semibold text-white/80">
          {name}
        </p>
        <p className="text-[11px] text-white/35">{tracks} {locale === "fr" ? "pistes" : "tracks"}</p>
      </div>
    </div>
  );
}

function PacksCard({ locale }: { locale: Locale }) {
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const packs = [
    { name: "Dark Melodies Vol.3", tracks: 12, coverSrc: PACK_COVERS[0] },
    { name: "808 Rage Kit", tracks: 8, coverSrc: PACK_COVERS[1] },
    { name: "Ambient Souls", tracks: 15, coverSrc: PACK_COVERS[2] },
    { name: "Flute Gang", tracks: 6, coverSrc: PACK_COVERS[3] },
  ];

  return (
    <div>
      <GlowCard>
        <EdgeFade className="min-h-[300px] sm:min-h-[360px]">
          <div className="select-none px-5 pt-5 sm:px-7 sm:pt-7">
            {/* toolbar */}
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 flex-1 items-center gap-2 rounded-xl px-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-3 w-3 shrink-0 text-white/25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="6.5" cy="6.5" r="4.5" />
                  <path d="M10 10l4 4" />
                </svg>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={locale === "fr" ? "Chercher des packs…" : "Search packs…"}
                  className="w-full bg-transparent text-[11px] text-white/60 outline-none placeholder:text-white/20"
                />
              </div>
              {(["All", "Packs", "Series"] as const).map((tab) => {
                const tabLabel = locale === "fr"
                  ? { All: "Tout", Packs: "Packs", Series: "Séries" }[tab]
                  : tab;
                return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
                    tab === activeTab
                      ? "bg-white/10 text-white/75"
                      : "text-white/25 hover:bg-white/[0.04] hover:text-white/40"
                  }`}
                >
                  {tabLabel}
                </button>
                );
              })}
            </div>

            {/* pack grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {packs.map((p) => (
                <PackCard key={p.name} {...p} locale={locale} />
              ))}
            </div>
          </div>
        </EdgeFade>
      </GlowCard>

      {/* Label overlapping card bottom — pulled up */}
      <div className="relative z-10 mt-5 px-1 sm:mt-6">
        <p className="text-[14px] font-semibold text-white/80 sm:text-[15px]">
          {locale === "fr" ? "Ta bibliothèque" : "Your library"}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-white/35">
          {locale === "fr"
            ? "Organise tes beats en packs propres et pro. Tag, cherche et gère ton catalogue depuis un seul endroit. Laisse des commentaires horodatés sur tes tracks pour un feedback précis."
            : "Organize your beats into clean, professional packs. Tag, search, and manage your catalog from one place. Leave timestamped comments on tracks for precise feedback."}
        </p>
      </div>
    </div>
  );
}

function ComposeCard({ locale }: { locale: Locale }) {
  const defaultSubject = locale === "fr" ? "Nouveau pack : Dark Melodies Vol.3" : "New pack: Dark Melodies Vol.3";
  const defaultMessage = locale === "fr"
    ? "Hey, je viens de sortir un nouveau pack qui devrait te plaire. Dis-moi ce que t'en penses !"
    : "Hey, just dropped a new pack I think you'll love. Let me know what you think!";
  const [subjectValue, setSubjectValue] = useState(defaultSubject);
  const [messageValue, setMessageValue] = useState(defaultMessage);
  const [activeChannel, setActiveChannel] = useState("email");

  const recipients = [
    { name: "Metro Boomin", initial: "M", color: "hsl(160,45%,25%)" },
    { name: "Southside", initial: "S", color: "hsl(220,45%,25%)" },
    { name: "Wheezy", initial: "W", color: "hsl(280,45%,25%)" },
  ];

  return (
    <div>
      <GlowCard>
        <EdgeFade className="min-h-[300px] sm:min-h-[360px]">
          <div className="select-none px-5 pt-5 sm:px-7 sm:pt-7">
            {/* compose header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="1" y="3" width="14" height="10" rx="2" />
                    <path d="M1 5l7 4 7-4" />
                  </svg>
                </div>
                <span className="text-[12px] font-semibold text-white/70">
                  {locale === "fr" ? "Nouvelle campagne" : "New campaign"}
                </span>
              </div>
              <div className="flex gap-1">
                {[
                  { key: "email", label: "Email" },
                  { key: "ig", label: "Instagram" },
                ].map((ch) => (
                  <button
                    key={ch.key}
                    onClick={() => setActiveChannel(ch.key)}
                    className={`rounded-lg px-2 py-1 text-[10px] font-medium transition-colors ${
                      ch.key === activeChannel
                        ? "bg-white/10 text-white/70"
                        : "text-white/25 hover:bg-white/[0.04] hover:text-white/40"
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* form fields */}
            <div className="mt-4 space-y-2.5">
              {/* To field */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-white/30">
                  {locale === "fr" ? "À" : "To"}
                </label>
                <div
                  className="flex flex-wrap items-center gap-1.5 rounded-xl px-3 py-2"
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.015)",
                  }}
                >
                  {recipients.map((r) => (
                    <span
                      key={r.name}
                      className="flex cursor-default items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2 transition-colors hover:bg-white/[0.06]"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-semibold text-white/80"
                        style={{ background: r.color }}
                      >
                        {r.initial}
                      </span>
                      <span className="text-[10px] text-white/60">
                        {r.name}
                      </span>
                    </span>
                  ))}
                  <span className="text-[10px] text-white/25">{locale === "fr" ? "+12 autres" : "+12 more"}</span>
                </div>
              </div>

              {/* Subject field */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-white/30">
                  {locale === "fr" ? "Objet" : "Subject"}
                </label>
                <input
                  type="text"
                  value={subjectValue}
                  onChange={(e) => setSubjectValue(e.target.value)}
                  className="w-full rounded-xl bg-transparent px-3 py-2 text-[12px] text-white/70 outline-none placeholder:text-white/20 focus:ring-1 focus:ring-white/10"
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.015)",
                  }}
                />
              </div>

              {/* Message field */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-white/30">
                  Message
                </label>
                <textarea
                  value={messageValue}
                  onChange={(e) => setMessageValue(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl bg-transparent px-3 py-2 text-[12px] leading-relaxed text-white/70 outline-none placeholder:text-white/20 focus:ring-1 focus:ring-white/10"
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.015)",
                  }}
                />
              </div>
            </div>

            {/* send button */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                <span className="text-[10px] text-white/30">
                  {locale === "fr" ? "Prêt à envoyer" : "Ready to send"}
                </span>
              </div>
              <button className="rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-black transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,255,255,0.1)]">
                {locale === "fr" ? "Envoyer" : "Send campaign"}
              </button>
            </div>
          </div>
        </EdgeFade>
      </GlowCard>

      {/* Label overlapping card bottom — pulled up */}
      <div className="relative z-10 mt-5 px-1 sm:mt-6">
        <p className="text-[14px] font-semibold text-white/80 sm:text-[15px]">
          {locale === "fr" ? "Personnel, à grande échelle" : "Personal at scale"}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-white/35">
          {locale === "fr"
            ? "Envoie à un contact ou à toute ta liste. Chaque envoi donne l'impression d'avoir été fait juste pour eux."
            : "Send to one contact or your whole list. Each one feels like it was crafted just for them."}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Sell — track row card (matching real app style)                  */
/* ------------------------------------------------------------------ */

function SellCard({ locale }: { locale: Locale }) {
  const [purchased, setPurchased] = useState(false);

  return (
    <Reveal>
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <SectionEmblem accentColor="#34d399" icon={(g) => <MoneyIcon gradId={g} />} id="money" />
        </div>
        <h3 className="text-[1.55rem] font-medium leading-tight text-white sm:text-3xl lg:text-[2.2rem]">
          {locale === "fr" ? (
            <>
              Vends ta musique.{" "}
              <span className="text-white/40">Garde 100% de ton argent.</span>
            </>
          ) : (
            <>
              Sell your music.{" "}
              <span className="text-white/40">Keep 100% of your money.</span>
            </>
          )}
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
          {locale === "fr"
            ? "Fixe ton prix, vends directement à ton audience via un checkout Stripe sécurisé. 0% de frais sur le plan Ultra — contrairement aux autres plateformes, on ne prend aucune commission sur tes ventes."
            : "Set your price, sell directly to your audience through secure Stripe checkout. 0% platform fee on Ultra — unlike other platforms, we don't take a cut of your sales."}
        </p>
      </div>
      <div className="mt-8 sm:mt-10">
        <GlowCard>
          <div className="select-none px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Track number */}
              <span className="hidden text-[13px] tabular-nums text-white/25 sm:block">
                1
              </span>

              {/* Album cover */}
              <div
                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl sm:h-14 sm:w-14"
                style={{
                  boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
                }}
              >
                <img
                  src={PACK_COVERS[0]}
                  alt="Dark Melodies Vol.3"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>

              {/* Track info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white/85 sm:text-[14px]">
                  Dark Melodies Vol.3 &mdash; Melody Pack &mdash; 140 BPM
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    &euro;29.99
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-white/40">
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full text-[7px] font-bold text-white/70"
                      style={{ background: "hsl(25,50%,22%)" }}
                    >
                      K
                    </span>
                    Kodaa
                  </span>
                </div>
              </div>

              {/* 0% fees badge */}
              <div
                className="hidden shrink-0 rounded-full px-2.5 sm:flex sm:items-center sm:py-1"
                style={{
                  background: "rgba(52,211,153,0.06)",
                  border: "1px solid rgba(52,211,153,0.12)",
                }}
              >
                <span className="text-[10px] font-medium leading-none text-emerald-400/70">
                  {locale === "fr" ? "0% sur Ultra" : "0% on Ultra"}
                </span>
              </div>

              {/* Action icons */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Download */}
                <button className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06]">
                  <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4 text-white/30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M8 2v8m0 0l-3-3m3 3l3-3" />
                    <path d="M2 12v2h12v-2" />
                  </svg>
                </button>
                {/* Cart */}
                <button
                  onClick={() => setPurchased(!purchased)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    purchased
                      ? "bg-emerald-500/15 text-emerald-400/80"
                      : "hover:bg-white/[0.06] text-white/30"
                  }`}
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M1 1h2l1.5 8h8L14 3H4" />
                    <circle cx="6" cy="13" r="1" />
                    <circle cx="11" cy="13" r="1" />
                  </svg>
                </button>
                {/* Heart */}
                <button className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06]">
                  <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4 text-white/30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 0 1 8 4.5 3.5 3.5 0 0 1 13.5 7C13.5 10.5 8 14 8 14z" />
                  </svg>
                </button>
                {/* More */}
                <button className="hidden h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06] sm:flex">
                  <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4 text-white/30"
                    fill="currentColor"
                  >
                    <circle cx="8" cy="3" r="1.2" />
                    <circle cx="8" cy="8" r="1.2" />
                    <circle cx="8" cy="13" r="1.2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </GlowCard>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export function FeatureShowcase({ locale = "en" }: { locale?: Locale }) {
  return (
    <section className="pt-32 sm:pt-44">
      <div className="mx-auto w-full max-w-[1320px] space-y-36 px-5 sm:space-y-52 sm:px-8 lg:px-10">
        {/* 1 — Analytics: full-width */}
        <AnalyticsSection locale={locale} />

        {/* 2 — Packs + Send: Resend-style */}
        <Reveal>
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <SectionEmblem accentColor="#a78bfa" icon={(g) => <LayersIcon gradId={g} />} id="layers" />
            </div>
            <h3 className="text-[1.55rem] font-medium leading-tight text-white sm:text-3xl lg:text-[2.2rem]">
              {locale === "fr" ? (
                <>
                  Crée des packs propres.
                  <br />
                  <span className="text-white/40">Envoie-les personnellement.</span>
                </>
              ) : (
                <>
                  Build clean packs.
                  <br />
                  <span className="text-white/40">Send them personally.</span>
                </>
              )}
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {locale === "fr"
                ? "On a construit les outils qu'on a toujours voulu avoir en tant que producteurs \u2014 un endroit pour organiser ton catalogue et toucher ton audience, où chaque envoi semble fait juste pour eux."
                : <>We built the tools we always wished we had as producers &mdash; a place to organize your catalog and reach your audience, where every send feels like it was made just for them.</>}
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:mt-14 lg:grid-cols-2 lg:gap-4">
            <PacksCard locale={locale} />
            <ComposeCard locale={locale} />
          </div>
        </Reveal>

        {/* 3 — Sell: track row card */}
        <SellCard locale={locale} />
      </div>
    </section>
  );
}
