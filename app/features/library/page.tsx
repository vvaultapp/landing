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
/*  Icon                                                               */
/* ------------------------------------------------------------------ */

function FolderMusicIcon({ className = "", gradId }: { className?: string; gradId?: string }) {
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
        d="M3.75 9.75V5.25a1.5 1.5 0 0 1 1.5-1.5h4.19a1.5 1.5 0 0 1 1.06.44l1.06 1.06a1.5 1.5 0 0 0 1.06.44h5.63a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V9.75Z"
      />
      <path
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M14.25 11.25v5.25"
      />
      <path
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M14.25 11.25l2.25-.75"
      />
      <circle
        cx="12.75"
        cy="16.5"
        r="1.5"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
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
      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
      {/* Top-left specular */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[60%] w-[70%]"
        style={{
          background:
            "radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.03) 0%, transparent 60%)",
        }}
      />
      {/* Top edge highlight */}
      <div
        className="pointer-events-none absolute inset-x-[15%] top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)",
        }}
      />
      {/* Chrome gradient def */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="chrome-lib-hero" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="18%" stopColor="rgba(215,220,235,0.65)" />
            <stop offset="38%" stopColor="rgba(150,160,185,0.35)" />
            <stop offset="55%" stopColor="rgba(180,190,215,0.5)" />
            <stop offset="72%" stopColor="rgba(52,211,153,0.35)" />
            <stop offset="88%" stopColor="rgba(52,211,153,0.55)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0.4)" />
          </linearGradient>
        </defs>
      </svg>
      <FolderMusicIcon className="relative z-10 h-14 w-14 sm:h-16 sm:w-16" gradId="chrome-lib-hero" />
      {/* Bottom accent glow — emerald */}
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(52,211,153,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {/* Bottom edge accent line — emerald */}
      <div
        className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.25) 30%, rgba(52,211,153,0.4) 50%, rgba(52,211,153,0.25) 70%, transparent 100%)",
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
      {/* Border overlay fading to bottom */}
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
      {/* Top glow line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[inherit]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
        }}
      />
      {/* Top glow orb */}
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
/*  Mock Pack View Card                                                */
/* ------------------------------------------------------------------ */

function MockPackViewCard() {
  const tracks = [
    { title: "Midnight Chase", bpm: 142, key: "Cm", date: "Mar 28, 2026" },
    { title: "Velvet Shadows", bpm: 138, key: "F#m", date: "Mar 27, 2026" },
    { title: "Neon Drift", bpm: 155, key: "Am", date: "Mar 26, 2026" },
    { title: "Hollow Crown", bpm: 130, key: "Dm", date: "Mar 25, 2026" },
    { title: "Ghost Protocol", bpm: 148, key: "Gm", date: "Mar 24, 2026" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        {/* Pack header */}
        <div className="flex items-start gap-4">
          <div
            className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20"
            style={{
              background: "linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-white/85">
              Dark Melodies Vol.3
            </p>
            <p className="text-[11px] text-white/35">
              Melody Pack &middot; 5 tracks &middot; by Kodaa
            </p>
            <div className="mt-2 flex gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                style={{ background: "rgba(52,211,153,0.1)", color: "rgba(52,211,153,0.7)" }}
              >
                Published
              </span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}
              >
                Tracked link
              </span>
            </div>
          </div>
        </div>

        {/* Track list header */}
        <div className="mt-6 flex items-center justify-between border-b border-white/[0.06] pb-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/20">
            Track
          </span>
          <div className="flex gap-8">
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/20 w-12 text-right">
              BPM
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/20 w-10 text-right">
              Key
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-white/20 sm:block w-20 text-right">
              Date
            </span>
          </div>
        </div>

        {/* Track rows */}
        <div className="space-y-0">
          {tracks.map((t, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-white/[0.04] py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] tabular-nums text-white/20 w-4">
                  {i + 1}
                </span>
                <span className="text-[13px] font-medium text-white/70">
                  {t.title}
                </span>
              </div>
              <div className="flex gap-8">
                <span className="text-[12px] tabular-nums text-white/40 w-12 text-right">
                  {t.bpm}
                </span>
                <span className="text-[12px] font-mono text-white/40 w-10 text-right">
                  {t.key}
                </span>
                <span className="hidden text-[11px] text-white/25 sm:block w-20 text-right">
                  {t.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock Storage Panel Card                                            */
/* ------------------------------------------------------------------ */

function MockStoragePanelCard() {
  const files = [
    { title: "Midnight Chase.wav", date: "Mar 28", bpm: 142, key: "Cm", visibility: "Public" },
    { title: "Velvet Shadows.wav", date: "Mar 27", bpm: 138, key: "F#m", visibility: "Public" },
    { title: "Neon Drift.mp3", date: "Mar 26", bpm: 155, key: "Am", visibility: "Private" },
    { title: "Hollow Crown.wav", date: "Mar 25", bpm: 130, key: "Dm", visibility: "Public" },
    { title: "stems_ghost_protocol.zip", date: "Mar 24", bpm: 148, key: "Gm", visibility: "Link" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/25">
            Uploaded files
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/30">
              24 files
            </span>
            <span className="text-[11px] text-white/20">&middot;</span>
            <span className="text-[11px] text-white/30">
              1.8 GB used
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-0">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-white/[0.04] py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-white/20">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 2h6l4 4v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
                    <path d="M9 2v4h4" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-white/70">
                    {f.title}
                  </p>
                  <p className="text-[10px] text-white/25">
                    {f.date} &middot; {f.bpm} BPM &middot; {f.key}
                  </p>
                </div>
              </div>
              <span
                className="shrink-0 ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                style={{
                  background:
                    f.visibility === "Public"
                      ? "rgba(52,211,153,0.1)"
                      : f.visibility === "Private"
                      ? "rgba(239,68,68,0.1)"
                      : "rgba(96,165,250,0.06)",
                  color:
                    f.visibility === "Public"
                      ? "rgba(52,211,153,0.7)"
                      : f.visibility === "Private"
                      ? "rgba(239,68,68,0.6)"
                      : "rgba(96,165,250,0.55)",
                }}
              >
                {f.visibility}
              </span>
            </div>
          ))}
        </div>

        {/* Storage bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/25">Storage</span>
            <span className="text-[10px] text-white/30">1.8 GB &middot; Unlimited (Pro)</span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full"
              style={{
                width: "8%",
                background: "linear-gradient(90deg, rgba(52,211,153,0.5), rgba(52,211,153,0.3))",
              }}
            />
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock Organization Card                                             */
/* ------------------------------------------------------------------ */

function MockOrganizationCard() {
  const tree = [
    { name: "My Library", type: "root", depth: 0, icon: "folder" },
    { name: "Melody Packs", type: "Folder", depth: 1, icon: "folder" },
    { name: "Dark Melodies Vol.1", type: "Pack", depth: 2, icon: "pack" },
    { name: "Dark Melodies Vol.2", type: "Pack", depth: 2, icon: "pack" },
    { name: "Dark Melodies Vol.3", type: "Pack", depth: 2, icon: "pack", active: true },
    { name: "Drum Kits", type: "Folder", depth: 1, icon: "folder" },
    { name: "808 Essentials", type: "Soundkit", depth: 2, icon: "kit" },
    { name: "Trap Percussion Kit", type: "Soundkit", depth: 2, icon: "kit" },
    { name: "Beat Tapes", type: "Series", depth: 1, icon: "series" },
    { name: "Late Night Sessions #1", type: "Pack", depth: 2, icon: "pack" },
    { name: "Late Night Sessions #2", type: "Pack", depth: 2, icon: "pack" },
    { name: "Singles", type: "Folder", depth: 1, icon: "folder" },
  ];

  const typeColors: Record<string, string> = {
    Folder: "rgba(96,165,250,0.6)",
    Pack: "rgba(52,211,153,0.6)",
    Soundkit: "rgba(251,191,36,0.6)",
    Series: "rgba(168,85,247,0.6)",
    root: "rgba(255,255,255,0.5)",
  };

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/25">
          Library structure
        </p>
        <div className="mt-5 space-y-0.5">
          {tree.map((node, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg py-1.5 transition-colors ${
                node.active ? "bg-white/[0.04]" : ""
              }`}
              style={{ paddingLeft: `${node.depth * 20 + 8}px` }}
            >
              {/* Icon */}
              <span style={{ color: typeColors[node.type] || "rgba(255,255,255,0.3)" }}>
                {node.icon === "folder" ? (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 4.5V3a1 1 0 0 1 1-1h3.17a1 1 0 0 1 .7.29l.83.83a1 1 0 0 0 .71.29H13a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4.5Z" />
                  </svg>
                ) : node.icon === "pack" ? (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="12" height="12" rx="2" />
                    <path d="M6 5v6M10 5v6M6 8h4" />
                  </svg>
                ) : node.icon === "kit" ? (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="12" height="12" rx="2" />
                    <circle cx="8" cy="8" r="2.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3v10h10" />
                    <path d="M6 10V7M9 10V5M12 10V8" />
                  </svg>
                )}
              </span>
              <span
                className={`text-[12px] font-medium ${
                  node.active ? "text-white/80" : "text-white/55"
                }`}
              >
                {node.name}
              </span>
              {node.type !== "root" && (
                <span
                  className="ml-auto mr-2 text-[9px] font-medium uppercase tracking-wider"
                  style={{ color: typeColors[node.type] || "rgba(255,255,255,0.2)" }}
                >
                  {node.type}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function FeatureLibraryPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === "fr"
      ? "vvault | Ta bibliothèque musicale"
      : "vvault | Your music library";
  }, [locale]);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      {/* Plasma hero background — fixed, full-width, emerald accent */}
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
            color="#34d399"
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
              background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {locale === "fr" ? "Ta bibliothèque musicale" : "Your music library"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {locale === "fr"
              ? "Upload, organise et gère ton catalogue entier au même endroit. Chaque beat, pack et stem — toujours accessible, toujours à toi. Une interface épurée pensée pour te laisser te concentrer sur ta musique."
              : "Upload, organize, and manage your entire catalog in one place. Every beat, pack, and stem\u00a0\u2014 always accessible, always yours. A refined interface designed to let you focus on your music."}
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

        {/* Section 1: Pack View */}
        <Reveal className="mt-40 sm:mt-52">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Des packs qui ont un look pro" : "Packs that look professional"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Regroupe tes tracks en packs avec cover art, métadonnées et tracklist. Chaque pack a sa propre page avec BPM, tonalité et date de sortie pour chaque track — prêt à partager en un clic."
              : "Group your tracks into packs with cover art, metadata, and track listings. Each pack gets its own page with BPM, key, and release date for every track\u00a0\u2014 ready to share with one click."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockPackViewCard />
          </div>
        </Reveal>

        {/* Section 2: Storage Panel */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Tous tes fichiers, en un coup d'oeil" : "All your files, at a glance"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Vois chaque fichier uploadé avec son format, ses métadonnées et son statut de visibilité. Contrôle ce qui est public, privé ou encore en brouillon — et suis ton utilisation de stockage."
              : "See every file you have uploaded with format, metadata, and visibility status. Control what is public, private, or still in draft\u00a0\u2014 and track how much storage you are using."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockStoragePanelCard />
          </div>
        </Reveal>

        {/* Section 3: Organization */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Organise tout à ta façon" : "Organize everything your way"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Imbrique des dossiers dans des dossiers. Regroupe tes beats en packs, sound kits ou séries en cours. vvault reflète la façon dont tu penses vraiment ton catalogue — pas la façon dont un système de fichiers fonctionne."
              : "Nest folders inside folders. Group beats into packs, sound kits, or ongoing series. vvault mirrors the way you actually think about your catalog\u00a0\u2014 not the way a file system does."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockOrganizationCard />
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
                title: locale === "fr" ? "Upload multi-format" : "Multi-format upload",
                desc: locale === "fr"
                  ? "Dépose des MP3, WAV, stems ou ZIPs complets. vvault accepte tout et stocke sur un CDN global pour une lecture instantanée partout dans le monde."
                  : "Drop MP3, WAV, stems, or full ZIPs. vvault accepts everything and stores it on a global CDN for instant playback worldwide.",
              },
              {
                title: locale === "fr" ? "Organisation automatique" : "Auto-organization",
                desc: locale === "fr"
                  ? "Les fichiers ZIP sont dézippés et organisés automatiquement. La structure de dossiers est préservée pour que tes packs arrivent prêts à publier."
                  : "ZIP files are auto-unpacked and organized. Folder structure is preserved so your packs arrive ready to publish.",
              },
              {
                title: locale === "fr" ? "Métadonnées riches" : "Rich metadata",
                desc: locale === "fr"
                  ? "BPM, tonalité, tags, cover art et co-auteurs par track. Tout ce dont tes auditeurs et collaborateurs ont besoin, attaché à chaque fichier."
                  : "BPM, key, tags, cover art, and co-authors per track. Everything your listeners and collaborators need, attached to every file.",
              },
              {
                title: locale === "fr" ? "Partage instantané" : "Instant sharing",
                desc: locale === "fr"
                  ? "Génère des liens trackés pour n'importe quel pack ou dossier. Sache exactement qui l'a ouvert, écouté et téléchargé — en temps réel."
                  : "Generate tracked links for any pack or folder. Know exactly who opened it, listened, and downloaded\u00a0\u2014 in real time.",
              },
              {
                title: locale === "fr" ? "Commentaires horodatés" : "Timestamped comments",
                desc: locale === "fr"
                  ? "Laisse des commentaires sur des passages précis de tes tracks. Idéal pour donner du feedback, discuter avec des collaborateurs ou pointer un moment clé à un artiste."
                  : "Drop comments on specific moments of your tracks. Perfect for giving feedback, discussing arrangements with collaborators, or pointing an artist to a key section.",
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
                <p
                  className="mt-1.5 text-[13px] leading-relaxed text-white/35"
                  dangerouslySetInnerHTML={{ __html: item.desc }}
                />
              </div>
            ))}
          </div>
        </Reveal>

        {/* Final CTA */}
        <Reveal className="mt-28 sm:mt-36">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-white sm:text-3xl">
              {locale === "fr" ? "Commence à construire ta Library" : "Start building your library"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {locale === "fr"
                ? "Inscris-toi gratuitement et upload ton premier pack en quelques minutes. Ton catalogue mérite un vrai chez-soi."
                : "Sign up for free and upload your first pack in minutes. Your catalog deserves a proper home."}
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
