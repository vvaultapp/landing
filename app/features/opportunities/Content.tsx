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
/*  Emblem icon — target / bullseye                                    */
/* ------------------------------------------------------------------ */
function TargetIcon({ className = "", gradId }: { className?: string; gradId?: string }) {
  const strokeColor = gradId ? `url(#${gradId})` : "currentColor";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10" stroke={strokeColor} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6" stroke={strokeColor} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" stroke={strokeColor} strokeWidth="1.5" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Emblem                                                             */
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
          <linearGradient id="chrome-opp-hero" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="18%" stopColor="rgba(215,220,235,0.65)" />
            <stop offset="38%" stopColor="rgba(150,160,185,0.35)" />
            <stop offset="55%" stopColor="rgba(180,190,215,0.5)" />
            <stop offset="72%" stopColor="rgba(244,63,94,0.35)" />
            <stop offset="88%" stopColor="rgba(244,63,94,0.55)" />
            <stop offset="100%" stopColor="rgba(244,63,94,0.4)" />
          </linearGradient>
        </defs>
      </svg>
      <TargetIcon className="relative z-10 h-14 w-14 sm:h-16 sm:w-16" gradId="chrome-opp-hero" />
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(244,63,94,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(244,63,94,0.25) 30%, rgba(244,63,94,0.4) 50%, rgba(244,63,94,0.25) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GlowCard                                                           */
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
/*  Mock: Request Board Card                                           */
/* ------------------------------------------------------------------ */
function MockRequestBoardCard({ locale }: { locale: "en" | "fr" }) {
  const requests = [
    {
      title: locale === "fr" ? "Recherche des loops trap sombres" : "Looking for dark trap loops",
      author: "@nvzion",
      tags: ["Beats", "Loops"],
      submissions: 12,
      status: "open" as const,
    },
    {
      title: locale === "fr" ? "Besoin d'un pack de vocal chops R&B" : "Need R&B vocal chops pack",
      author: "@melodiqa",
      tags: ["Vocals", "R&B"],
      submissions: 8,
      status: "open" as const,
    },
    {
      title: locale === "fr" ? "808 slide bass one-shots" : "808 slide bass one-shots",
      author: "@prxdbykai",
      tags: ["One-shots", "808s"],
      submissions: 23,
      status: "closed" as const,
    },
    {
      title: locale === "fr" ? "Textures de pads ambient pour lo-fi" : "Ambient pad textures for lo-fi",
      author: "@snoozegod",
      tags: ["Loops", "Lo-fi"],
      submissions: 5,
      status: "open" as const,
    },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(244,63,94,0.08)",
              border: "1px solid rgba(244,63,94,0.15)",
            }}
          >
            <TargetIcon className="h-5 w-5 text-rose-400/80" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white/85">{locale === "fr" ? "Tableau de demandes" : "Request board"}</p>
            <p className="text-[11px] text-white/35">{locale === "fr" ? "Demandes communautaires" : "Community requests"} &middot; {locale === "fr" ? "Soumissions ouvertes" : "Open submissions"}</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {requests.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl px-4 py-3 transition-colors duration-200 hover:bg-white/[0.03]"
              style={{ border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[13px] font-medium text-white/75">{r.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      r.status === "open"
                        ? "bg-emerald-500/10 text-emerald-400/70"
                        : "bg-white/5 text-white/25"
                    }`}
                  >
                    {locale === "fr" ? (r.status === "open" ? "ouvert" : "fermé") : r.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[11px] text-white/30">{r.author}</span>
                  <span className="text-[11px] text-white/15">&middot;</span>
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/30"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ml-4 shrink-0 text-right">
                <span className="text-[13px] font-semibold tabular-nums text-white/50">{r.submissions}</span>
                <p className="text-[10px] text-white/25">{locale === "fr" ? "soumissions" : "submissions"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock: Submission Card                                              */
/* ------------------------------------------------------------------ */
function MockSubmissionCard({ locale }: { locale: "en" | "fr" }) {
  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold text-white/25">{locale === "fr" ? "Ta soumission" : "Your submission"}</p>

        <div className="mt-5 rounded-2xl px-4 py-4" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
                <svg viewBox="0 0 16 16" className="h-4 w-4 text-rose-400/70" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 8h10M8 3v10" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-medium text-white/75">Dark Melody Kit Vol.2</p>
                <p className="text-[11px] text-white/30">{locale === "fr" ? "Soumis à" : "Submitted to"} &ldquo;{locale === "fr" ? "Recherche des loops trap sombres" : "Looking for dark trap loops"}&rdquo;</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400/70">
              {locale === "fr" ? "Soumis" : "Submitted"}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 border-t border-white/[0.04] pt-3">
            <span className="text-[11px] text-white/25">14 {locale === "fr" ? "pistes" : "tracks"}</span>
            <span className="text-[11px] text-white/15">&middot;</span>
            <span className="text-[11px] text-white/25">{locale === "fr" ? "Soumis il y a 2h" : "Submitted 2h ago"}</span>
            <span className="text-[11px] text-white/15">&middot;</span>
            <span className="text-[11px] text-white/25">by @kodaa</span>
          </div>
        </div>

        <div className="mt-3 rounded-2xl px-4 py-4" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                <svg viewBox="0 0 16 16" className="h-4 w-4 text-emerald-400/70" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 8.5l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-medium text-white/75">Lo-fi Textures Pack</p>
                <p className="text-[11px] text-white/30">{locale === "fr" ? "Soumis à" : "Submitted to"} &ldquo;{locale === "fr" ? "Textures de pads ambient pour lo-fi" : "Ambient pad textures for lo-fi"}&rdquo;</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400/70">
              {locale === "fr" ? "Soumis" : "Submitted"}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 border-t border-white/[0.04] pt-3">
            <span className="text-[11px] text-white/25">8 {locale === "fr" ? "pistes" : "tracks"}</span>
            <span className="text-[11px] text-white/15">&middot;</span>
            <span className="text-[11px] text-white/25">{locale === "fr" ? "Soumis il y a 1j" : "Submitted 1d ago"}</span>
            <span className="text-[11px] text-white/15">&middot;</span>
            <span className="text-[11px] text-white/25">by @kodaa</span>
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */
export default function FeatureOpportunitiesPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === "fr"
      ? "vvault | Trouve des opportunités"
      : "vvault | Find opportunities";
  }, [locale]);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      {/* Plasma hero background — fixed, full-width, rose accent */}
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
            color="#f43f5e"
            speed={0.3}
            direction="forward"
            scale={1.2}
            opacity={0.6}
            mouseInteractive={false}
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[680px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">

        {/* Emblem + heading */}
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
            {locale === "fr" ? "Trouve des opportunités" : "Find opportunities"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {locale === "fr"
              ? "Un tableau de demandes communautaire où les artistes postent ce dont ils ont besoin."
              : "Community-driven request board where artists post what they need."}
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

        {/* Section 1: Request Board */}
        <Reveal className="mt-40 sm:mt-52">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Parcours ce que les artistes recherchent" : "Browse what artists need"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Les artistes postent des demandes pour les sons qu'ils recherchent — loops, one-shots, beats complets, packs de vocals. Parcours le tableau, trouve les demandes qui correspondent à ton style, et soumets ton travail directement."
              : "Artists post requests for the sounds they\u2019re looking for \u2014 loops, one-shots, full beats, vocal packs. Browse the board, find requests that match your style, and submit your work directly."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockRequestBoardCard locale={locale} />
          </div>
        </Reveal>

        {/* Section 2: Submission */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Soumets et fais-toi découvrir" : "Submit and get discovered"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Package tes sons et soumets-les aux demandes ouvertes. Suis le statut de chaque soumission — de la review à l'acceptation — tout au même endroit."
              : "Package your sounds and submit them to open requests. Track the status of every submission — from review to accepted — all in one place."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockSubmissionCard locale={locale} />
          </div>
        </Reveal>

        {/* Section 3: Why it matters */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Pourquoi c'est important" : "Why it matters"}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: locale === "fr" ? "Découvre ce que les artistes veulent" : "Discover what artists need",
                desc: locale === "fr"
                  ? "Arrête de deviner ce qui se vend. Vois de vraies demandes de vrais artistes et crée des sons que les gens recherchent."
                  : "Stop guessing what sells. See real requests from real artists and create sounds you know people are looking for.",
              },
              {
                title: locale === "fr" ? "Soumets directement" : "Submit directly",
                desc: locale === "fr"
                  ? "Pas d'intermédiaires, pas de gatekeepers. Soumets tes packs directement à l'artiste qui les a demandés et lance la conversation."
                  : "No middlemen, no gatekeepers. Submit your packs straight to the artist who requested them and start a conversation.",
              },
              {
                title: locale === "fr" ? "Fais-toi découvrir" : "Get discovered",
                desc: locale === "fr"
                  ? "Chaque soumission acceptée met ton nom devant une nouvelle audience. Construis ta réputation un placement à la fois."
                  : "Every accepted submission puts your name in front of a new audience. Build your reputation one placement at a time.",
              },
              {
                title: locale === "fr" ? "Soumissions payantes" : "Paid submissions",
                desc: locale === "fr"
                  ? "Les créateurs de demandes peuvent fixer un prix par soumission. Soumets gratuitement ou en payant — chaque opportunité définit ses propres règles."
                  : "Request owners can set a price per submission. Submit free or paid — each opportunity defines its own rules and upload limits.",
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
              {locale === "fr" ? "Commence à trouver des opportunités" : "Start finding opportunities"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {locale === "fr"
                ? "Inscris-toi gratuitement et parcours le tableau de demandes dès aujourd'hui."
                : "Sign up for free and browse the request board today."}
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
