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

/* ── Link chain icon ── */
function LinkChainIcon({ className = "", gradId }: { className?: string; gradId?: string }) {
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
        d="M13.544 10.456a4.368 4.368 0 0 0-6.176 0l-3.089 3.088a4.367 4.367 0 1 0 6.176 6.176l1.544-1.544"
      />
      <path
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M10.456 13.544a4.368 4.368 0 0 0 6.176 0l3.089-3.088a4.367 4.367 0 1 0-6.176-6.176l-1.544 1.544"
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
          <linearGradient id="chrome-link-hero" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="18%" stopColor="rgba(215,220,235,0.65)" />
            <stop offset="38%" stopColor="rgba(150,160,185,0.35)" />
            <stop offset="55%" stopColor="rgba(180,190,215,0.5)" />
            <stop offset="72%" stopColor="rgba(56,189,248,0.35)" />
            <stop offset="88%" stopColor="rgba(56,189,248,0.55)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.4)" />
          </linearGradient>
        </defs>
      </svg>
      <LinkChainIcon className="relative z-10 h-14 w-14 sm:h-16 sm:w-16" gradId="chrome-link-hero" />
      {/* Bottom accent glow */}
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(56,189,248,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {/* Bottom edge accent line */}
      <div
        className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.25) 30%, rgba(56,189,248,0.4) 50%, rgba(56,189,248,0.25) 70%, transparent 100%)",
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

/* ── Mock Bio Page Preview Card ── */
function MockBioPreviewCard() {
  const items = [
    { label: "Dark Melodies Vol.3", sub: "14 tracks", kind: "pack" },
    { label: "808 Essentials Kit", sub: "Sound kit", kind: "kit" },
    { label: "Summer Vibes Vol.2", sub: "22 tracks", kind: "pack" },
    { label: "Lo-fi Textures", sub: "8 tracks", kind: "pack" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        {/* Profile area */}
        <div className="flex flex-col items-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white/80"
            style={{
              background: "linear-gradient(135deg, hsl(200,50%,22%) 0%, hsl(210,45%,18%) 100%)",
              border: "1px solid rgba(56,189,248,0.15)",
            }}
          >
            K
          </div>
          <p className="mt-3 text-[15px] font-semibold text-white/85">Kodaa</p>
          <p className="text-[11px] text-white/35">@kodaa</p>

          {/* Social icons row */}
          <div className="mt-3 flex items-center gap-3">
            {["IG", "YT", "TT"].map((s) => (
              <span
                key={s}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-white/40"
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Content items */}
        <div className="mt-6 space-y-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors duration-200 hover:bg-white/[0.03]"
              style={{
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="h-10 w-10 shrink-0 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, hsla(${200 + i * 30},40%,20%,0.6) 0%, hsla(${200 + i * 30},30%,10%,0.8) 100%)`,
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              />
              <div className="flex-1">
                <span className="text-[13px] font-medium text-white/70">{item.label}</span>
                <p className="text-[10px] text-white/25">{item.sub}</p>
              </div>
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white/25" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5">
          <LinkChainIcon className="h-3.5 w-3.5 text-sky-400/50" />
          <span className="text-[10px] font-medium text-sky-400/40">
            vvault.app/kodaa
          </span>
        </div>
      </div>
    </GlowCard>
  );
}

/* ── Mock Placements Card ── */
function MockPlacementsCard() {
  const placements = [
    { title: "Midnight Drive", artist: "Jay Loren", platform: "Spotify", year: "2025" },
    { title: "Neon Lights EP", artist: "Melo", platform: "Apple Music", year: "2025" },
    { title: "Westside Tape", artist: "ProdByKai", platform: "YouTube", year: "2024" },
    { title: "Echoes", artist: "Snoozegod", platform: "SoundCloud", year: "2024" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold text-white/25">
          Placements
        </p>

        <div className="mt-5 space-y-0">
          {placements.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-white/[0.04] py-3"
            >
              <div>
                <span className="text-[13px] font-medium text-white/70">{p.title}</span>
                <span className="ml-2 text-[11px] text-white/30">by {p.artist}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] text-white/25">{p.platform}</span>
                <span className="text-[10px] text-white/15">{p.year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ── Page ── */
export default function FeatureLinkInBioPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === "fr" ? "vvault | Lien en bio" : "vvault | Link in Bio";
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
        <div className="absolute inset-0 opacity-[0.55] max-lg:opacity-[0.25]">
          <Plasma
            color="#38bdf8"
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
            {locale === "fr" ? "Lien en bio" : "Link in Bio"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {locale === "fr"
              ? "Ton profil public avec tes packs, soundkits, tracks et placements."
              : "Your public profile with packs, soundkits, tracks, and placements."}
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

        {/* Section 1: Bio Page Preview */}
        <Reveal className="mt-40 sm:mt-52">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Ta page, ta marque" : "Your page, your brand"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Ton profil public sur vvault.app/@pseudo met en avant tes packs, soundkits, tracks et crédits de placement. Partage un seul lien partout — les visiteurs peuvent écouter, streamer et acheter directement."
              : "Your public profile at vvault.app/@handle showcases your packs, soundkits, tracks, and placement credits. Share one link everywhere \u2014 visitors can preview, stream, and purchase directly."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockBioPreviewCard />
          </div>
        </Reveal>

        {/* Section 2: Placements */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Mets en avant tes placements" : "Showcase your placements"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Affiche tes crédits et placements directement sur ton profil. Lie vers Spotify, Apple Music, YouTube et SoundCloud pour que les visiteurs puissent écouter ton travail en contexte."
              : "Display your credits and placements directly on your profile. Link to Spotify, Apple Music, YouTube, and SoundCloud so visitors can hear your work in context."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockPlacementsCard />
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
                title: locale === "fr" ? "Un seul lien pour tout" : "One link for everything",
                desc: locale === "fr"
                  ? "Ton profil vvault affiche tes packs, soundkits, tracks et placements sur une seule page brandée. Partage un seul lien partout."
                  : "Your vvault profile shows packs, soundkits, tracks, and placements in a single branded page. Share one link everywhere.",
              },
              {
                title: locale === "fr" ? "Lecteur audio intégré" : "Built-in audio player",
                desc: locale === "fr"
                  ? "Les visiteurs peuvent écouter tes beats directement sur ton profil. Pas besoin de liens externes pour découvrir ton travail."
                  : "Visitors can preview your beats directly on your profile. No external links needed to hear your work.",
              },
              {
                title: locale === "fr" ? "Personnalisation du thème" : "Theme customization",
                desc: locale === "fr"
                  ? "Choisis parmi des thèmes prédéfinis ou personnalise les couleurs et arrière-plans pour coller à ton image d'artiste."
                  : "Pick from theme presets or customize colors and backgrounds to match your artist brand.",
              },
              {
                title: locale === "fr" ? "Crédits de placement" : "Placement credits",
                desc: locale === "fr"
                  ? "Affiche tes crédits avec des liens vers Spotify, Apple Music, YouTube et SoundCloud. Laisse ton travail parler de lui-même."
                  : "Show your credits with links to Spotify, Apple Music, YouTube, and SoundCloud. Let your work speak for itself.",
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
              {locale === "fr" ? "Réclame ta page" : "Claim your link page"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {locale === "fr"
                ? "Inscris-toi gratuitement et commence à partager tout ton contenu depuis une seule page."
                : "Sign up for free and start sharing all your content from one beautiful page."}
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
