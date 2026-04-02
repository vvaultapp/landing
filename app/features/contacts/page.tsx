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
/*  People / Contacts Icon                                            */
/* ------------------------------------------------------------------ */
function PeopleIcon({ className = "", gradId }: { className?: string; gradId?: string }) {
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
        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
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
          <linearGradient id="chrome-contacts-hero" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="18%" stopColor="rgba(215,220,235,0.65)" />
            <stop offset="38%" stopColor="rgba(150,160,185,0.35)" />
            <stop offset="55%" stopColor="rgba(180,190,215,0.5)" />
            <stop offset="72%" stopColor="rgba(245,158,11,0.35)" />
            <stop offset="88%" stopColor="rgba(245,158,11,0.55)" />
            <stop offset="100%" stopColor="rgba(245,158,11,0.4)" />
          </linearGradient>
        </defs>
      </svg>
      <PeopleIcon className="relative z-10 h-14 w-14 sm:h-16 sm:w-16" gradId="chrome-contacts-hero" />
      {/* Bottom accent glow — amber */}
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(245,158,11,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {/* Bottom edge accent line — amber */}
      <div
        className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.25) 30%, rgba(245,158,11,0.4) 50%, rgba(245,158,11,0.25) 70%, transparent 100%)",
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
/*  Avatar                                                            */
/* ------------------------------------------------------------------ */
function Avatar({
  letter,
  color,
  size = "md",
}: {
  letter: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-[12px]",
    lg: "h-12 w-12 text-[16px]",
  };
  return (
    <span
      className={`flex items-center justify-center rounded-full font-bold text-white/90 ${sizeClasses[size]}`}
      style={{ background: color }}
    >
      {letter}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Score Badge                                                       */
/* ------------------------------------------------------------------ */
function ScoreBadge({ score }: { score: number }) {
  const colors =
    score >= 85
      ? { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.2)", text: "text-emerald-400/90" }
      : score >= 70
        ? { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)", text: "text-emerald-300/80" }
        : score >= 40
          ? { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)", text: "text-amber-300/80" }
          : score >= 20
            ? { bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.15)", text: "text-orange-300/70" }
            : { bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.15)", text: "text-rose-300/70" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${colors.text}`}
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
    >
      {score}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock Contact Detail Card                                          */
/* ------------------------------------------------------------------ */
function MockContactDetailCard() {
  const stats = [
    { label: "Opens", value: 42 },
    { label: "Clicks", value: 28 },
    { label: "Plays", value: 67 },
    { label: "Saves", value: 15 },
    { label: "Downloads", value: 12 },
  ];
  const groups = ["#french", "#ar", "#priority"];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar letter="N" color="hsl(25,60%,28%)" size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2.5">
              <p className="text-[16px] font-semibold text-white/90">Noah</p>
            </div>
            <p className="mt-0.5 text-[12px] text-white/35">noah@label.com</p>
          </div>
          <ScoreBadge score={87} />
        </div>

        {/* Stats grid */}
        <div className="mt-6 grid grid-cols-5 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-3 py-3 text-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <p className="text-[18px] font-semibold tabular-nums text-white/70">
                {s.value}
              </p>
              <p className="mt-0.5 text-[10px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Meta */}
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.04] pt-4">
          <span className="text-[11px] text-white/30">Last active</span>
          <span className="text-[12px] font-medium text-white/50">2 hours ago</span>
        </div>

        {/* Groups */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {groups.map((g) => (
            <span
              key={g}
              className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-amber-400/60"
              style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.1)",
              }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock Contact Timeline Card                                        */
/* ------------------------------------------------------------------ */
function MockContactTimelineCard() {
  const events = [
    {
      action: "Opened Pack 07 campaign",
      time: "Today 14:23",
      dotColor: "bg-amber-400/70",
      color: "text-amber-400/70",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4l6-2 6 2v6l-6 2-6-2V4z" />
          <path d="M2 4l6 2 6-2" />
          <path d="M8 6v8" />
        </svg>
      ),
    },
    {
      action: "Played Midnight Chase (full play)",
      time: "Today 14:25",
      dotColor: "bg-emerald-400/70",
      color: "text-emerald-400/70",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="5,3 13,8 5,13" />
        </svg>
      ),
    },
    {
      action: "Downloaded Dark Melodies Vol.3",
      time: "Yesterday",
      dotColor: "bg-blue-400/70",
      color: "text-blue-400/70",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v8m0 0l-3-3m3 3l3-3" />
          <path d="M2 12v2h12v-2" />
        </svg>
      ),
    },
    {
      action: "Opened Vol.2 campaign",
      time: "3 days ago",
      dotColor: "bg-amber-400/50",
      color: "text-amber-400/50",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4l6-2 6 2v6l-6 2-6-2V4z" />
          <path d="M2 4l6 2 6-2" />
          <path d="M8 6v8" />
        </svg>
      ),
    },
    {
      action: "Played 4 tracks (avg 1:42)",
      time: "3 days ago",
      dotColor: "bg-emerald-400/50",
      color: "text-emerald-400/50",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="5,3 13,8 5,13" />
        </svg>
      ),
    },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/25">
          Activity timeline
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
                    {e.action}
                  </span>
                </div>
                <span className="shrink-0 text-[11px] text-white/25">{e.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock Contact List Card                                            */
/* ------------------------------------------------------------------ */
function MockContactListCard() {
  const contacts = [
    { name: "Noah", email: "noah@label.com", score: 87, time: "2h ago", color: "hsl(25,60%,28%)" },
    { name: "Mila", email: "mila@gmail.com", score: 72, time: "7h ago", color: "hsl(280,45%,30%)" },
    { name: "Kai", email: "kai@beats.io", score: 65, time: "1d ago", color: "hsl(200,50%,28%)" },
    { name: "Lena", email: "lena@studio.co", score: 91, time: "3h ago", color: "hsl(340,45%,30%)" },
    { name: "Marcus", email: "marc@mgmt.com", score: 58, time: "2d ago", color: "hsl(160,40%,25%)" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/25">
          Contacts
        </p>

        {/* Search bar */}
        <div
          className="mt-4 flex items-center gap-2.5 rounded-xl px-4 py-2.5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white/25" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" />
          </svg>
          <span className="text-[12px] text-white/20">Search contacts...</span>
        </div>

        {/* Contact rows */}
        <div className="mt-4 space-y-1">
          {contacts.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.03]"
              style={{ border: "1px solid transparent" }}
            >
              <div className="flex items-center gap-3">
                <Avatar letter={c.name[0]} color={c.color} size="sm" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-medium text-white/75">{c.name}</span>
                    <span className="text-[11px] text-white/30">{c.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ScoreBadge score={c.score} />
                <span className="text-[10px] text-white/20">{c.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock Groups Card                                                  */
/* ------------------------------------------------------------------ */
function MockGroupsCard() {
  const groups = [
    { label: "#french", count: 19, color: "hsl(220,60%,55%)" },
    { label: "#ar", count: 7, color: "hsl(280,55%,50%)" },
    { label: "#priority", count: 12, color: "hsl(25,70%,50%)" },
    { label: "#new-leads", count: 34, color: "hsl(160,50%,45%)" },
    { label: "#hip-hop", count: 23, color: "hsl(340,55%,50%)" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/25">
          Groups
        </p>
        <div className="mt-5 space-y-2">
          {groups.map((g) => (
            <div
              key={g.label}
              className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-white/[0.03]"
              style={{
                border: "1px solid rgba(255,255,255,0.04)",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: g.color }}
                />
                <span className="text-[13px] font-medium text-white/70">{g.label}</span>
              </div>
              <span className="text-[12px] tabular-nums text-white/30">
                {g.count} contacts
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ================================================================== */
/*  Page                                                              */
/* ================================================================== */
export default function FeatureContactsPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === "fr"
      ? "vvault | Contacts — Connais ton réseau"
      : "vvault | Contacts — Know your network";
  }, [locale]);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      {/* Plasma hero background — fixed, full-width, amber accent */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-screen"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.55] max-lg:opacity-[0.25]">
          <Plasma
            color="#f59e0b"
            speed={0.3}
            direction="forward"
            scale={1.2}
            opacity={0.6}
            mouseInteractive={false}
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[680px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">

        {/* Hero — Emblem + heading */}
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
            {locale === "fr" ? "Connais tes contacts" : "Know your contacts"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {locale === "fr"
              ? "Un CRM pensé pour l'industrie musicale. Gère chaque relation, suis l'engagement, et ne laisse jamais un contact refroidir."
              : "A CRM built for the music industry. Manage every relationship, track engagement, and never let a connection go cold."}
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

        {/* Section 1: Contact detail */}
        <Reveal className="mt-40 sm:mt-52">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Chaque contact, entièrement profilé" : "Every contact, fully profiled"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Chaque contact a un profil riche avec un score d'engagement, des stats d'interaction et des tags. Vois en un coup d'oeil qui est engagé, ce qu'ils ont écouté, et quand relancer."
              : "Each contact has a rich profile with engagement scoring, interaction stats, and tags. Know at a glance who is engaged, what they have listened to, and when to follow up."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockContactDetailCard />
          </div>
        </Reveal>

        {/* Section 2: Timeline */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Timeline d'activité complète" : "Full activity timeline"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Chaque ouverture, écoute, téléchargement et clic est logué automatiquement. Vois exactement comment chaque contact interagit avec ta musique — sans tracking manuel."
              : "Every open, play, download, and click is logged automatically. See exactly how each contact interacts with your music — no manual tracking required."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockContactTimelineCard />
          </div>
        </Reveal>

        {/* Section 3: Contact list */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Ton réseau en un coup d'oeil" : "Your network at a glance"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Cherche, filtre et segmente tes contacts par score d'engagement, rôle ou tags personnalisés. Trouve les bonnes personnes pour chaque campagne en quelques secondes."
              : "Search, filter, and segment your contacts by engagement score, role, or custom tags. Find the right people for every campaign in seconds."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockContactListCard />
          </div>
        </Reveal>

        {/* Section 4: Groups */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Organise avec des groupes" : "Organize with groups"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Tague tes contacts avec des groupes et des couleurs personnalisés. Filtre par groupe pour trouver rapidement la bonne audience pour ta prochaine campagne."
              : "Tag contacts with custom groups and colors. Filter by group to quickly find the right audience for your next campaign."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockGroupsCard />
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
                title: locale === "fr" ? "Scoring d'engagement" : "Engagement scoring",
                desc: locale === "fr"
                  ? "Les contacts sont scorés automatiquement selon les ouvertures, écoutes, téléchargements et clics. Concentre-toi sur ceux qui écoutent vraiment."
                  : "Contacts are scored automatically based on opens, plays, downloads, and clicks. Focus on the people who are actually listening.",
              },
              {
                title: locale === "fr" ? "Segmentation intelligente" : "Smart segmentation",
                desc: locale === "fr"
                  ? "Groupe tes contacts avec des tags et couleurs personnalisés. Filtre par niveau d'engagement, groupe ou activité pour envoyer la bonne musique aux bonnes personnes."
                  : "Group contacts with custom tags and colors. Filter by engagement level, group, or activity to send the right music to the right people.",
              },
              {
                title: locale === "fr" ? "Tracking automatique" : "Automatic tracking",
                desc: locale === "fr"
                  ? "Chaque interaction est loguée sans lever le petit doigt. Ouvertures, écoutes, téléchargements et clics construisent une image complète au fil du temps."
                  : "Every interaction is logged without lifting a finger. Opens, plays, downloads, and clicks build a complete picture over time.",
              },
              {
                title: locale === "fr" ? "Pensé pour la musique" : "Built for music",
                desc: locale === "fr"
                  ? "Ce n'est pas un CRM générique. Chaque fonctionnalité est pensée autour de la façon dont les producteurs, labels et artistes gèrent vraiment leurs relations."
                  : "This is not a generic CRM. Every feature is designed around how producers, labels, and artists actually manage relationships.",
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
              {locale === "fr" ? "Commence à construire tes relations" : "Start building relationships"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {locale === "fr"
                ? "Inscris-toi gratuitement et transforme ta liste de contacts en un vrai CRM de l'industrie musicale."
                : "Sign up for free and turn your contact list into a real music industry CRM."}
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
