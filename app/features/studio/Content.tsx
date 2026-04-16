"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

const Plasma = dynamic(() => import("@/components/landing/Plasma"), {
  ssr: false,
});

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
      <div
        className="relative z-10 h-[68px] w-[68px] sm:h-[80px] sm:w-[80px]"
        style={{
          WebkitMaskImage: "url('/vvault-studio-logo.png')",
          maskImage: "url('/vvault-studio-logo.png')",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          background: "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(215,220,235,0.65) 18%, rgba(150,160,185,0.35) 38%, rgba(180,190,215,0.5) 55%, rgba(6,182,212,0.4) 72%, rgba(6,182,212,0.6) 88%, rgba(6,182,212,0.45) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(6,182,212,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
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
function MockAutoVideoCard({ locale }: { locale: string }) {
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
                {locale === "fr" ? "Publication vidéo automatique" : "Auto-video posting"}
              </p>
              <p className="text-[11px] text-white/35">
                {locale === "fr" ? "Pack : Summer Vibes Vol.2" : "Pack: Summer Vibes Vol.2"}
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
            {locale === "fr" ? "Actif" : "Active"}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {[
            { label: locale === "fr" ? "Fréquence" : "Frequency", value: locale === "fr" ? "Tous les jours" : "Every 1 day" },
            { label: locale === "fr" ? "Heure de publication" : "Post time", value: "10:00 AM (UTC)" },
            { label: locale === "fr" ? "Résolution" : "Resolution", value: "1280 × 720 @ 30fps" },
            { label: locale === "fr" ? "Mode de couverture" : "Cover mode", value: locale === "fr" ? "Artwork du track → Pack par défaut" : "Track artwork → Pack default" },
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

        <div className="mt-5">
          <p className="text-[11px] font-semibold text-white/25">
            {locale === "fr" ? "Template vidéo" : "Video template"}
          </p>
          <div
            className="mt-3 rounded-xl px-4 py-3.5"
            style={{
              border: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(255,255,255,0.01)",
            }}
          >
            <p className="text-[12px] font-medium text-white/60">
              {locale === "fr" ? "Titre :" : "Title:"} <span className="text-cyan-400/60">{"{name}"}</span>
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-white/30">
              {locale === "fr" ? "Télécharge et achète ce beat ici :" : "Download and purchase this beat here :"} <span className="text-cyan-400/50">{"<link>"}</span>
              <br />BPM: <span className="text-cyan-400/50">{"<bpm>"}</span> &middot; {locale === "fr" ? "Tonalité :" : "Key:"} <span className="text-cyan-400/50">{"<key>"}</span>
              <br />{locale === "fr" ? "Suis-moi sur Instagram :" : "Follow me on Instagram:"} <span className="text-cyan-400/50">{"<ig>"}</span>
              <br />{locale === "fr" ? "Suis-moi sur YouTube :" : "Follow me on YouTube:"} <span className="text-cyan-400/50">{"<ytb>"}</span>
            </p>
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

/* ── Mock Scheduled Posts Card ── */
function MockScheduledPostsCard({ locale }: { locale: string }) {
  const posts = [
    { track: "Midnight Chase", time: locale === "fr" ? "Aujourd'hui, 10h00" : "Today, 10:00 AM", status: locale === "fr" ? "Programmé" : "Scheduled", dotColor: "bg-cyan-400/70", statusKey: "scheduled" },
    { track: "Dark Melodies", time: locale === "fr" ? "Demain, 10h00" : "Tomorrow, 10:00 AM", status: locale === "fr" ? "Programmé" : "Scheduled", dotColor: "bg-cyan-400/70", statusKey: "scheduled" },
    { track: "Summer Breeze", time: locale === "fr" ? "28 mars, 10h00" : "Mar 28, 10:00 AM", status: locale === "fr" ? "Programmé" : "Scheduled", dotColor: "bg-cyan-400/70", statusKey: "scheduled" },
    { track: "Neon Lights", time: locale === "fr" ? "25 mars, 10h00" : "Mar 25, 10:00 AM", status: locale === "fr" ? "Publié" : "Posted", dotColor: "bg-emerald-400/70", statusKey: "posted" },
    { track: "Late Night Drive", time: locale === "fr" ? "24 mars, 10h00" : "Mar 24, 10:00 AM", status: locale === "fr" ? "Publié" : "Posted", dotColor: "bg-emerald-400/70", statusKey: "posted" },
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
              {locale === "fr" ? "Vidéos programmées" : "Scheduled videos"}
            </p>
            <p className="text-[11px] text-white/35">
              {locale === "fr" ? "Générées automatiquement depuis les tracks de ton pack" : "Auto-generated from your pack tracks"}
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
                    item.statusKey === "posted" ? "text-emerald-400/60" : "text-white/40"
                  }`}
                  style={{
                    background: item.statusKey === "posted" ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${item.statusKey === "posted" ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)"}`,
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

/* ── Mock WaveMatch Scan Card ── */
function MockWaveMatchCard({ locale }: { locale: string }) {
  const matches = [
    { platform: "YouTube", title: "Dark Melody Type Beat 2026", artist: "ProdByAlex", match: "98%", color: "text-red-400/70", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)" },
    { platform: "Spotify", title: "Late Night Sessions", artist: "DJ Wavez", match: "94%", color: "text-emerald-400/70", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.15)" },
    { platform: "Apple Music", title: "Trap Soul Vibes", artist: "BeatKing", match: "87%", color: "text-pink-400/70", bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.15)" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(168,85,247,0.08)",
                border: "1px solid rgba(168,85,247,0.15)",
              }}
            >
              <svg viewBox="0 0 16 16" className="h-5 w-5 text-purple-400/70" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3l2 1" />
                <path d="M11.5 4.5l1.5-1.5M4.5 11.5l-1.5 1.5" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white/85">WaveMatch</p>
              <p className="text-[11px] text-white/35">
                {locale === "fr" ? "Midnight_Chase_Beat.wav" : "Midnight_Chase_Beat.wav"}
              </p>
            </div>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-purple-400/70"
            style={{
              background: "rgba(168,85,247,0.08)",
              border: "1px solid rgba(168,85,247,0.15)",
            }}
          >
            {locale === "fr" ? "3 résultats" : "3 matches"}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {matches.map((m) => (
            <div
              key={m.title}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                border: "1px solid rgba(255,255,255,0.04)",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${m.color}`}
                  style={{ background: m.bg, border: `1px solid ${m.border}` }}
                >
                  {m.platform}
                </span>
                <div>
                  <p className="text-[12px] font-medium text-white/65">{m.title}</p>
                  <p className="text-[10px] text-white/30">{m.artist}</p>
                </div>
              </div>
              <span className="text-[12px] font-semibold text-purple-400/60">{m.match}</span>
            </div>
          ))}
        </div>

        <div
          className="mt-5 rounded-xl px-4 py-3"
          style={{
            border: "1px solid rgba(168,85,247,0.1)",
            background: "rgba(168,85,247,0.03)",
          }}
        >
          <p className="text-[11px] text-purple-300/50">
            {locale === "fr"
              ? "Scanne YouTube, Spotify et Apple Music pour trouver des utilisations non autorisées de tes beats."
              : "Scans YouTube, Spotify, and Apple Music to find unauthorized uses of your beats."}
          </p>
        </div>
      </div>
    </GlowCard>
  );
}

/* ── Mock Template Tokens Card ── */
function MockTemplateCard({ locale }: { locale: string }) {
  const tokens = [
    { token: "{name}", desc: locale === "fr" ? "Titre du track" : "Track title", example: "Midnight Chase" },
    { token: "{bpm}", desc: "BPM", example: "140" },
    { token: "{key}", desc: locale === "fr" ? "Tonalité" : "Key", example: "C minor" },
    { token: "{link}", desc: locale === "fr" ? "Lien d'achat" : "Purchase link", example: "vvault.app/p/..." },
    { token: "{ig}", desc: "Instagram", example: "@producer" },
    { token: "{ytb}", desc: "YouTube", example: "youtube.com/..." },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.15)",
            }}
          >
            <svg viewBox="0 0 16 16" className="h-5 w-5 text-cyan-400/70" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="12" height="12" rx="2" />
              <path d="M5 6h6M5 8h4M5 10h5" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white/85">
              {locale === "fr" ? "Tokens dynamiques" : "Dynamic tokens"}
            </p>
            <p className="text-[11px] text-white/35">
              {locale === "fr" ? "Remplis automatiquement les métadonnées" : "Auto-fill metadata in every post"}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
          <div
            className="grid grid-cols-3 gap-0 px-4 py-2"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <span className="text-[10px] font-semibold text-white/30">Token</span>
            <span className="text-[10px] font-semibold text-white/30">{locale === "fr" ? "Description" : "Description"}</span>
            <span className="text-[10px] font-semibold text-white/30">{locale === "fr" ? "Exemple" : "Example"}</span>
          </div>
          {tokens.map((t) => (
            <div
              key={t.token}
              className="grid grid-cols-3 gap-0 px-4 py-2.5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
            >
              <span className="text-[11px] font-mono text-cyan-400/60">{t.token}</span>
              <span className="text-[11px] text-white/45">{t.desc}</span>
              <span className="text-[11px] text-white/30">{t.example}</span>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ── Mock Cover Fallback Card ── */
function MockCoverFallbackCard({ locale }: { locale: string }) {
  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.15)",
            }}
          >
            <svg viewBox="0 0 16 16" className="h-5 w-5 text-cyan-400/70" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="12" height="12" rx="2" />
              <circle cx="5.5" cy="5.5" r="1" />
              <path d="M14 10l-3-3-7 7" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white/85">
              {locale === "fr" ? "Couverture intelligente" : "Smart cover art"}
            </p>
            <p className="text-[11px] text-white/35">
              {locale === "fr" ? "Fallback automatique en cascade" : "Automatic cascading fallback"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {[
            { label: locale === "fr" ? "Artwork du track" : "Track artwork", active: true },
            { label: locale === "fr" ? "Cover du pack" : "Pack cover", active: false },
            { label: locale === "fr" ? "Couverture générée" : "Generated cover", active: false },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className="rounded-xl px-4 py-3 text-center"
                style={{
                  border: `1px solid ${step.active ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.04)"}`,
                  background: step.active ? "rgba(6,182,212,0.05)" : "rgba(255,255,255,0.01)",
                }}
              >
                <div
                  className="mx-auto mb-2 h-10 w-10 rounded-lg"
                  style={{
                    background: step.active
                      ? "linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(168,85,247,0.2) 100%)"
                      : "rgba(255,255,255,0.04)",
                  }}
                />
                <p className={`text-[10px] ${step.active ? "text-cyan-400/60 font-medium" : "text-white/25"}`}>
                  {step.label}
                </p>
              </div>
              {i < 2 && (
                <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0 fill-none stroke-white/15 stroke-[1.5]">
                  <path d="M4 2l4 4-4 4" />
                </svg>
              )}
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
        <div className="absolute inset-0 opacity-[0.55]">
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

      <main className="relative z-10 mx-auto max-w-[720px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">

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
              ? "Publication automatique de vidéos et identification de contenu pour les producteurs. Planifie, publie et protège tes beats — le tout en autopilote."
              : "Automated video posting and content identification for producers. Schedule, publish, and protect your beats — all on autopilot."}
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="https://studio.vvault.app"
              className="inline-flex items-center rounded-xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
            >
              {locale === "fr" ? "Commencer" : "Get started"}
            </a>
            <Link
              href="/docs/studio"
              className="inline-flex items-center rounded-2xl px-6 py-2.5 text-[14px] font-medium text-white/50 transition-colors duration-200 hover:text-white/80"
            >
              {locale === "fr" ? "Documentation" : "Read docs"}
              <svg viewBox="0 0 12 12" className="ml-1.5 h-3 w-3 fill-none stroke-current stroke-[1.5]">
                <path d="M4 2l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </Reveal>

        {/* Two tools overview */}
        <Reveal className="mt-32 sm:mt-40">
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className="rounded-2xl px-6 py-6"
              style={{
                border: "1px solid rgba(6,182,212,0.1)",
                background: "rgba(6,182,212,0.03)",
              }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <svg viewBox="0 0 16 16" className="h-5 w-5 text-cyan-400/70" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="14" height="10" rx="2" />
                  <path d="M6 6.5l4 2.5-4 2.5z" fill="currentColor" stroke="none" />
                </svg>
                <p className="text-[14px] font-semibold text-white/80">
                  {locale === "fr" ? "Publication automatique" : "Automated Publishing"}
                </p>
              </div>
              <p className="text-[13px] leading-relaxed text-white/35">
                {locale === "fr"
                  ? "Génère et publie automatiquement des vidéos pour chaque track de tes packs. Planifie, personnalise les templates et laisse Studio gérer ton contenu."
                  : "Auto-generate and post videos for every track in your packs. Schedule posts, customize templates, and let Studio handle your content pipeline."}
              </p>
            </div>
            <div
              className="rounded-2xl px-6 py-6"
              style={{
                border: "1px solid rgba(168,85,247,0.1)",
                background: "rgba(168,85,247,0.03)",
              }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <svg viewBox="0 0 16 16" className="h-5 w-5 text-purple-400/70" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 5v3l2 1" />
                  <path d="M11.5 4.5l1.5-1.5M4.5 11.5l-1.5 1.5" />
                </svg>
                <p className="text-[14px] font-semibold text-white/80">WaveMatch</p>
              </div>
              <p className="text-[13px] leading-relaxed text-white/35">
                {locale === "fr"
                  ? "Identifie qui utilise tes beats sur YouTube, Spotify et Apple Music. Découvre les placements non crédités et réclame tes revenus."
                  : "Identify who used your beats across YouTube, Spotify, and Apple Music. Discover uncredited placements and claim your revenue."}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Section 1: Auto-Video Config */}
        <Reveal className="mt-32 sm:mt-40">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Configure et oublie" : "Set it and forget it"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Active Studio sur n'importe quel pack pour générer et publier automatiquement des vidéos pour chaque track. Choisis ton planning, définis un template avec des tokens dynamiques — Studio s'occupe du reste."
              : "Enable Studio on any pack to automatically generate and post videos for each track. Choose your schedule, set a template with dynamic tokens — Studio handles the rest."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockAutoVideoCard locale={locale} />
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
            <MockScheduledPostsCard locale={locale} />
          </div>
        </Reveal>

        {/* Section 3: Templates */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Templates intelligents" : "Smart templates"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Les tokens dynamiques remplissent automatiquement les métadonnées dans chaque titre et description de vidéo. Plus besoin de copier-coller."
              : "Dynamic tokens auto-fill metadata into every video title and description. No more copy-pasting."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockTemplateCard locale={locale} />
          </div>
        </Reveal>

        {/* Section 4: Cover Art */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Couverture intelligente" : "Smart cover art"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Studio sélectionne automatiquement la meilleure couverture pour chaque vidéo. L'artwork du track est utilisé en priorité, avec un fallback vers la cover du pack ou une couverture générée."
              : "Studio automatically selects the best cover art for each video. Track artwork is used first, falling back to the pack cover or a generated default."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockCoverFallbackCard locale={locale} />
          </div>
        </Reveal>

        {/* Section 5: WaveMatch */}
        <Reveal className="mt-32 sm:mt-40">
          <div className="mb-6 flex justify-center">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold text-purple-400/70"
              style={{
                background: "rgba(168,85,247,0.08)",
                border: "1px solid rgba(168,85,247,0.15)",
              }}
            >
              {locale === "fr" ? "Identification de contenu" : "Content identification"}
            </span>
          </div>
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Trouve qui utilise tes beats" : "Find who used your beats"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "WaveMatch scanne YouTube, Spotify et Apple Music pour détecter les utilisations de tes beats. Découvre les placements non crédités, négocie tes royalties et réclame tes revenus."
              : "WaveMatch scans YouTube, Spotify, and Apple Music to detect uses of your beats. Discover uncredited placements, negotiate royalties, and claim your revenue."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockWaveMatchCard locale={locale} />
          </div>
        </Reveal>

        {/* WaveMatch upload methods */}
        <Reveal className="mt-16 sm:mt-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg viewBox="0 0 16 16" className="h-5 w-5 text-purple-400/50" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 10V2m0 0L5 5m3-3l3 3" />
                    <path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3" />
                  </svg>
                ),
                title: locale === "fr" ? "Fichier local" : "Local file",
                desc: locale === "fr" ? "Glisse-dépose un fichier audio (MP3, WAV, FLAC, OGG — max 50 MB)" : "Drag-and-drop an audio file (MP3, WAV, FLAC, OGG — max 50 MB)",
              },
              {
                icon: (
                  <svg viewBox="0 0 16 16" className="h-5 w-5 text-purple-400/50" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="3" width="12" height="10" rx="2" />
                    <path d="M5 7h6M5 9h4" />
                  </svg>
                ),
                title: locale === "fr" ? "Bibliothèque" : "Storage",
                desc: locale === "fr" ? "Sélectionne un track déjà dans ta bibliothèque vVault" : "Select a track already in your vVault library",
              },
              {
                icon: (
                  <svg viewBox="0 0 16 16" className="h-5 w-5 text-purple-400/50" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="8" r="5" />
                    <path d="M8 5v3h3" />
                  </svg>
                ),
                title: "Autoscan",
                desc: locale === "fr" ? "Scanne automatiquement tout ton catalogue en continu" : "Automatically scan your entire catalog on a schedule",
              },
            ].map((m) => (
              <div
                key={m.title}
                className="rounded-2xl px-5 py-5"
                style={{
                  border: "1px solid rgba(255,255,255,0.04)",
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                <div className="mb-3">{m.icon}</div>
                <p className="text-[13px] font-semibold text-white/70">{m.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-white/30">{m.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Section 6: Why it matters */}
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
                title: locale === "fr" ? "Identification de contenu" : "Content identification",
                desc: locale === "fr"
                  ? "WaveMatch détecte qui utilise tes beats sur les plateformes de streaming. Protège ta musique et réclame tes revenus."
                  : "WaveMatch detects who used your beats across streaming platforms. Protect your music and claim your revenue.",
              },
              {
                title: locale === "fr" ? "Planning flexible" : "Flexible scheduling",
                desc: locale === "fr"
                  ? "Publie plusieurs fois par jour ou une fois par semaine. Définis l'heure exacte et le fuseau horaire qui conviennent à ton audience."
                  : "Post multiple times per day or once a week. Set the exact time and timezone that works for your audience.",
              },
              {
                title: locale === "fr" ? "Templates dynamiques" : "Dynamic templates",
                desc: locale === "fr"
                  ? "Les tokens remplissent automatiquement le BPM, la tonalité, les liens d'achat et tes réseaux dans chaque vidéo."
                  : "Tokens auto-fill BPM, key, purchase links, and your social handles into every video.",
              },
              {
                title: locale === "fr" ? "Contrôle de la cover" : "Cover art control",
                desc: locale === "fr"
                  ? "Cascade automatique : artwork du track → cover du pack → couverture générée."
                  : "Automatic cascade: track artwork → pack cover → generated default.",
              },
              {
                title: locale === "fr" ? "Duplique tes configs" : "Duplicate settings",
                desc: locale === "fr"
                  ? "Applique la même configuration Studio à plusieurs packs en un clic. Pas besoin de reconfigurer à chaque fois."
                  : "Apply the same Studio configuration across multiple packs in one click. No need to reconfigure each time.",
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

        {/* Video specs table */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Spécifications vidéo" : "Video specs"}
          </h2>
          <div className="mt-8">
            <GlowCard>
              <div className="select-none cursor-default px-6 py-6 sm:px-10 sm:py-8">
                <div className="space-y-3">
                  {[
                    { label: "Format", value: "MP4 (H.264)" },
                    { label: locale === "fr" ? "Résolution" : "Resolution", value: "1280 × 720" },
                    { label: locale === "fr" ? "Fréquence d'images" : "Frame rate", value: "30 fps" },
                    { label: locale === "fr" ? "Couverture" : "Cover art", value: locale === "fr" ? "Images carrousel ; la première est utilisée comme cover" : "Carousel images; first image used as cover" },
                    { label: locale === "fr" ? "Audio" : "Audio", value: locale === "fr" ? "Track originale du pack" : "Original track from pack" },
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
              </div>
            </GlowCard>
          </div>
        </Reveal>

        {/* Ultra plan badge */}
        <Reveal className="mt-16 sm:mt-20">
          <div className="text-center">
            <div
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4 text-amber-400/60" fill="currentColor">
                <path d="M8 1l2.1 4.3L15 6l-3.5 3.4.8 4.8L8 12l-4.3 2.2.8-4.8L1 6l4.9-.7z" />
              </svg>
              <span className="text-[13px] text-white/50">
                {locale === "fr"
                  ? "Certaines fonctionnalités Studio nécessitent le plan Ultra."
                  : "Some Studio features require the Ultra plan."}
              </span>
            </div>
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
                ? "Publication automatique, identification de contenu, templates dynamiques — tout ce dont tu as besoin pour automatiser ton contenu."
                : "Automated posting, content identification, dynamic templates — everything you need to automate your content."}
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <a
                href="https://studio.vvault.app"
                className="inline-flex items-center rounded-xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
              >
                {locale === "fr" ? "Commencer gratuitement" : "Start for free"}
              </a>
              <Link
                href="/docs/studio"
                className="inline-flex items-center text-[14px] font-medium text-white/50 transition-colors duration-200 hover:text-white/80"
              >
                {locale === "fr" ? "En savoir plus" : "Learn more"}
                <svg viewBox="0 0 12 12" className="ml-1.5 h-3 w-3 fill-none stroke-current stroke-[1.5]">
                  <path d="M4 2l4 4-4 4" />
                </svg>
              </Link>
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
