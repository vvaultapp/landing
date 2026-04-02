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

/* ── Video / play icon ── */
function VideoIcon({ className = "", gradId }: { className?: string; gradId?: string }) {
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
        d="M3.375 19.5h17.25m-17.25 0A1.125 1.125 0 0 1 2.25 18.375M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-12.75A1.125 1.125 0 0 1 3.375 4.5h7.5c.621 0 1.125.504 1.125 1.125m0 12.75v-12.75m0 12.75h5.25c.621 0 1.125-.504 1.125-1.125V8.625m0 0-.75-.75m.75.75h3c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-3L17.25 5.25"
      />
    </svg>
  );
}

/* ── Emblem ── */
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
          <linearGradient id="chrome-studio-hero" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="18%" stopColor="rgba(215,220,235,0.65)" />
            <stop offset="38%" stopColor="rgba(150,160,185,0.35)" />
            <stop offset="55%" stopColor="rgba(180,190,215,0.5)" />
            <stop offset="72%" stopColor="rgba(6,182,212,0.35)" />
            <stop offset="88%" stopColor="rgba(6,182,212,0.55)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0.4)" />
          </linearGradient>
        </defs>
      </svg>
      <VideoIcon className="relative z-10 h-14 w-14 sm:h-16 sm:w-16" gradId="chrome-studio-hero" />
      {/* Bottom accent glow */}
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(6,182,212,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {/* Bottom edge accent line */}
      <div
        className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.25) 30%, rgba(6,182,212,0.4) 50%, rgba(6,182,212,0.25) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}

/* ── GlowCard ── */
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

/* ── Mock Auto-Video Config Card ── */
function MockAutoVideoCard() {
  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(6,182,212,0.08)",
                border: "1px solid rgba(6,182,212,0.15)",
              }}
            >
              <svg viewBox="0 0 16 16" className="h-5 w-5 text-cyan-400/70" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="3" width="14" height="10" rx="2" />
                <path d="M6 6.5l4 2.5-4 2.5z" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white/85">
                Auto-video posting
              </p>
              <p className="text-[11px] text-white/35">
                Pack: Summer Vibes Vol.2
              </p>
            </div>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400/70"
            style={{
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.15)",
            }}
          >
            Active
          </span>
        </div>

        {/* Schedule settings */}
        <div className="mt-6 space-y-3">
          {[
            { label: "Frequency", value: "Every 1 day" },
            { label: "Post time", value: "10:00 AM (UTC)" },
            { label: "Resolution", value: "1280 × 720 @ 30fps" },
            { label: "Cover mode", value: "Track artwork → Pack default" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                border: "1px solid rgba(255,255,255,0.04)",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <span className="text-[12px] text-white/35">{row.label}</span>
              <span className="text-[12px] font-medium text-white/65">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Template preview */}
        <div className="mt-5">
          <p className="text-[11px] font-semibold text-white/25">
            Video template
          </p>
          <div
            className="mt-3 rounded-xl px-4 py-3.5"
            style={{
              border: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(255,255,255,0.01)",
            }}
          >
            <p className="text-[12px] font-medium text-white/60">
              Title: <span className="text-cyan-400/60">{"{name}"}</span>
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-white/30">
              Download and purchase this beat here : <span className="text-cyan-400/50">{"<link>"}</span>
              <br />BPM: <span className="text-cyan-400/50">{"<bpm>"}</span> &middot; Key: <span className="text-cyan-400/50">{"<key>"}</span>
              <br />Follow me on Instagram: <span className="text-cyan-400/50">{"<ig>"}</span>
              <br />Follow me on YouTube: <span className="text-cyan-400/50">{"<ytb>"}</span>
            </p>
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

/* ── Mock Scheduled Posts Card ── */
function MockScheduledPostsCard() {
  const posts = [
    { track: "Midnight Chase", time: "Today, 10:00 AM", status: "Scheduled", dotColor: "bg-cyan-400/70" },
    { track: "Dark Melodies", time: "Tomorrow, 10:00 AM", status: "Scheduled", dotColor: "bg-cyan-400/70" },
    { track: "Summer Breeze", time: "Mar 28, 10:00 AM", status: "Scheduled", dotColor: "bg-cyan-400/70" },
    { track: "Neon Lights", time: "Mar 25, 10:00 AM", status: "Posted", dotColor: "bg-emerald-400/70" },
    { track: "Late Night Drive", time: "Mar 24, 10:00 AM", status: "Posted", dotColor: "bg-emerald-400/70" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.15)",
            }}
          >
            <svg viewBox="0 0 16 16" className="h-5 w-5 text-cyan-400/70" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v4l3 2" />
              <circle cx="8" cy="8" r="6" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white/85">
              Scheduled videos
            </p>
            <p className="text-[11px] text-white/35">
              Auto-generated from your pack tracks
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-0">
          {posts.map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${item.dotColor}`} />
                {i < posts.length - 1 && (
                  <div className="h-full w-px bg-white/[0.06]" />
                )}
              </div>
              <div className="flex flex-1 items-center justify-between pb-5">
                <div>
                  <span className="text-[13px] font-medium text-white/70">{item.track}</span>
                  <p className="text-[11px] text-white/25">{item.time}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    item.status === "Posted" ? "text-emerald-400/60" : "text-white/40"
                  }`}
                  style={{
                    background: item.status === "Posted" ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${item.status === "Posted" ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)"}`,
                  }}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ── Page ── */
export default function FeatureStudioPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === "fr" ? "vvault | Studio" : "vvault | Studio";
  }, [locale]);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      {/* Plasma hero background */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-screen"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.55] max-lg:opacity-[0.15]">
          <Plasma
            color="#06b6d4"
            speed={0.3}
            direction="forward"
            scale={1.2}
            opacity={0.6}
            mouseInteractive={false}
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
            vvault Studio
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {locale === "fr"
              ? "Publication automatique de vidéos pour tes beats. Définis un planning, personnalise tes templates, et laisse Studio publier les vidéos de tes packs en autopilote."
              : "Automated video posting for your beats. Set a schedule, customize templates, and let Studio publish videos from your packs on autopilot."}
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

        {/* Section 1: Auto-Video Config */}
        <Reveal className="mt-40 sm:mt-52">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Configure et oublie" : "Set it and forget it"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Configure Studio sur n'importe quel pack pour générer et publier automatiquement des vidéos pour chaque track. Choisis ton planning, définis un template avec des tokens dynamiques comme le BPM, la tonalité et tes liens sociaux — Studio s'occupe du reste."
              : "Configure Studio on any pack to automatically generate and post videos for each track. Choose your schedule, set a template with dynamic tokens like BPM, key, and social links \u2014 Studio handles the rest."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockAutoVideoCard />
          </div>
        </Reveal>

        {/* Section 2: Scheduled Posts */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Ta file de publication" : "Your posting queue"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Studio met en file d'attente les vidéos de ton pack et les publie selon ton planning. Suis ce qui a été posté et ce qui arrive."
              : "Studio queues up videos from your pack and posts them on your schedule. Track what\u2019s been posted and what\u2019s coming next."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockScheduledPostsCard />
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
                title: locale === "fr" ? "Publication automatique" : "Automated posting",
                desc: locale === "fr"
                  ? "Plus besoin de créer des vidéos à la main. Studio génère des vidéos 1280×720 à partir de tes tracks et les publie selon ton planning."
                  : "No more manual video creation. Studio generates 1280×720 videos from your tracks and posts them on schedule.",
              },
              {
                title: locale === "fr" ? "Templates intelligents" : "Smart templates",
                desc: locale === "fr"
                  ? "Les tokens dynamiques remplissent automatiquement le BPM, la tonalité, les liens d'achat et tes réseaux dans chaque titre et description de vidéo."
                  : "Dynamic tokens auto-fill BPM, key, purchase links, and your social handles into every video title and description.",
              },
              {
                title: locale === "fr" ? "Planning flexible" : "Flexible scheduling",
                desc: locale === "fr"
                  ? "Publie plusieurs fois par jour ou une fois par semaine. Définis l'heure exacte et le fuseau horaire qui conviennent à ton audience."
                  : "Post multiple times per day or once a week. Set the exact time and timezone that works for your audience.",
              },
              {
                title: locale === "fr" ? "Contrôle de la cover" : "Cover art control",
                desc: locale === "fr"
                  ? "Choisis comment la cover est sélectionnée : utilise l'artwork de la track, celui par défaut du pack, ou un fallback personnalisé pour chaque vidéo."
                  : "Choose how cover art is selected: use the track artwork, the pack default, or a custom fallback for every video.",
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
              {locale === "fr" ? "Essaie Studio aujourd'hui" : "Try Studio today"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {locale === "fr"
                ? "Configure la publication automatique de vidéos et laisse Studio gérer ton calendrier de contenu pendant que tu te concentres sur la musique."
                : "Set up automated video posting and let Studio handle your content schedule while you focus on making music."}
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
