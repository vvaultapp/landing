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
/*  Emblem icon — user / profile                                       */
/* ------------------------------------------------------------------ */
function UserIcon({ className = "", gradId }: { className?: string; gradId?: string }) {
  const strokeColor = gradId ? `url(#${gradId})` : "currentColor";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="8" r="4" stroke={strokeColor} strokeWidth="1.5" />
      <path
        d="M5.338 18.32C5.999 15.528 8.772 14 12 14s6.001 1.528 6.662 4.32c.09.38.135.57.045.738a.55.55 0 0 1-.24.243C18.296 19.4 18.1 19.4 17.706 19.4H6.294c-.394 0-.59 0-.76-.099a.55.55 0 0 1-.241-.243c-.09-.168-.046-.358.045-.738Z"
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
          <linearGradient id="chrome-profile-hero" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="18%" stopColor="rgba(215,220,235,0.65)" />
            <stop offset="38%" stopColor="rgba(150,160,185,0.35)" />
            <stop offset="55%" stopColor="rgba(180,190,215,0.5)" />
            <stop offset="72%" stopColor="rgba(167,139,250,0.35)" />
            <stop offset="88%" stopColor="rgba(167,139,250,0.55)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0.4)" />
          </linearGradient>
        </defs>
      </svg>
      <UserIcon className="relative z-10 h-14 w-14 sm:h-16 sm:w-16" gradId="chrome-profile-hero" />
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(167,139,250,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.25) 30%, rgba(167,139,250,0.4) 50%, rgba(167,139,250,0.25) 70%, transparent 100%)",
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
/*  Mock: Profile Preview Card                                         */
/* ------------------------------------------------------------------ */
function MockProfilePreviewCard() {
  const stats = [
    { label: "Packs", value: "47" },
    { label: "Tracks", value: "312" },
    { label: "Kits", value: "8" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default">
        {/* Banner */}
        <div
          className="h-28 w-full rounded-t-2xl sm:h-32 sm:rounded-t-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(99,102,241,0.08) 50%, rgba(167,139,250,0.05) 100%)",
          }}
        />

        <div className="px-6 pb-8 sm:px-10 sm:pb-10">
          {/* Avatar + name row */}
          <div className="-mt-8 flex items-end gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white/90"
              style={{
                background: "linear-gradient(135deg, rgba(167,139,250,0.3) 0%, rgba(99,102,241,0.2) 100%)",
                border: "3px solid rgba(4,4,5,1)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}
            >
              K
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <p className="text-[16px] font-semibold text-white/90">Kodaa</p>
                <span
                  className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    background: "rgba(167,139,250,0.12)",
                    color: "rgba(167,139,250,0.8)",
                    border: "1px solid rgba(167,139,250,0.15)",
                  }}
                >
                  Pro
                </span>
              </div>
              <p className="text-[12px] text-white/30">@kodaa</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 flex gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <span className="text-[16px] font-semibold tabular-nums text-white/70">{s.value}</span>
                <span className="ml-1.5 text-[11px] text-white/30">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Social links */}
          <div className="mt-4 flex gap-2">
            {["Instagram", "YouTube", "TikTok"].map((s) => (
              <span
                key={s}
                className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/30 transition-colors hover:bg-white/[0.06]"
                style={{ border: "1px solid rgba(255,255,255,0.04)" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock: Latest Packs Grid Card                                       */
/* ------------------------------------------------------------------ */
function MockLatestPacksCard() {
  const packs = [
    { title: "Dark Melodies Vol.3", tracks: 14, price: "\u20ac24.99", hue: 280 },
    { title: "808 Essentials", tracks: 22, price: "\u20ac19.99", hue: 220 },
    { title: "Lo-fi Textures", tracks: 8, price: "\u20ac14.99", hue: 160 },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold text-white/25">Latest packs</p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {packs.map((p, i) => (
            <div key={i} className="group">
              {/* Thumbnail */}
              <div
                className="aspect-square w-full rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, hsla(${p.hue},40%,20%,0.6) 0%, hsla(${p.hue},30%,10%,0.8) 100%)`,
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              />
              <p className="mt-2 truncate text-[12px] font-medium text-white/60">{p.title}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25">{p.tracks} tracks</span>
                <span className="text-[11px] font-semibold tabular-nums text-violet-400/60">{p.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock: Credits Card                                                 */
/* ------------------------------------------------------------------ */
function MockCreditsCard() {
  const credits = [
    { title: "Midnight Drive", artist: "Jay Loren", role: "Producer", source: "Spotify", year: "2025" },
    { title: "Neon Lights EP", artist: "Melo", role: "Producer", source: "Apple Music", year: "2025" },
    { title: "Echoes", artist: "Snoozegod", role: "Mix engineer", source: "SoundCloud", year: "2025" },
    { title: "Westside Tape", artist: "ProdByKai", role: "Producer", source: "YouTube", year: "2024" },
    { title: "Velvet Room", artist: "nvzion", role: "Co-producer", source: "Spotify", year: "2024" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold text-white/25">Credits</p>

        <div className="mt-5 space-y-0">
          {credits.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-white/[0.04] py-2.5"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[13px] font-medium text-white/70">{c.title}</span>
                <span className="ml-2 text-[11px] text-white/30">{c.artist}</span>
                <span className="ml-2 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-white/25">
                  {c.role}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <span className="text-[10px] text-white/20">{c.source}</span>
                <span className="text-[11px] tabular-nums text-white/25">{c.year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */
export default function FeatureProfilePage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === "fr"
      ? "vvault | Ta page publique"
      : "vvault | Your public page";
  }, [locale]);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      {/* Plasma hero background — fixed, full-width, violet accent */}
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
            color="#a78bfa"
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
            {locale === "fr" ? "Ta page publique" : "Your public page"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {locale === "fr"
              ? "Une vitrine professionnelle pour ta musique."
              : "A professional storefront for your music."}
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

        {/* Section 1: Profile Preview */}
        <Reveal className="mt-40 sm:mt-52">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Ta marque, au premier plan" : "Your brand, front and center"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Un profil public soigné avec ta bannière, ton avatar, ta bio, tes stats et tes liens sociaux. Les artistes qui visitent voient une page pro qui inspire confiance et facilite l'achat."
              : "A polished public profile with your banner, avatar, bio, stats, and social links. Artists who visit see a professional page that builds credibility and makes buying easy."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockProfilePreviewCard />
          </div>
        </Reveal>

        {/* Section 2: Latest Packs */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Mets en avant ton catalogue" : "Showcase your catalog"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Tes derniers packs affichés dans une grille visuelle avec cover art, nombre de tracks et prix. Les visiteurs peuvent parcourir et acheter sans quitter ta page."
              : "Your latest packs displayed in a visual grid with cover art, track counts, and pricing. Visitors can browse and buy without leaving your page."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockLatestPacksCard />
          </div>
        </Reveal>

        {/* Section 3: Credits */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Affiche tes crédits" : "Display your credits"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Montre tes crédits de producteur et d'enregistrement avec des releases liées. Construis la confiance en prouvant ton track record directement sur ton profil."
              : "Show your producer and recording credits with linked releases. Build trust by proving your track record right on your profile."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockCreditsCard />
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
                title: locale === "fr" ? "Personnalisation du thème" : "Theme customization",
                desc: locale === "fr"
                  ? "Choisis parmi des presets de thèmes ou personnalise les couleurs et fonds pour correspondre à ton identité de marque."
                  : "Pick from theme presets or customize accent colors and backgrounds to match your brand identity.",
              },
              {
                title: locale === "fr" ? "Packs, kits et séries" : "Packs, kits, and series",
                desc: locale === "fr"
                  ? "Affiche ton catalogue complet sur une page. Packs, soundkits, séries et tracks individuelles, le tout organisé avec soin."
                  : "Showcase your full catalog on one page. Packs, soundkits, series, and individual tracks all organized beautifully.",
              },
              {
                title: locale === "fr" ? "Crédits de placement" : "Placement credits",
                desc: locale === "fr"
                  ? "Affiche tes crédits de producteur et d'enregistrement avec des releases liées sur Spotify, YouTube, SoundCloud et Apple Music."
                  : "Display your producer and recording credits with linked releases on Spotify, YouTube, SoundCloud, and Apple Music.",
              },
              {
                title: locale === "fr" ? "Liens sociaux" : "Social links",
                desc: locale === "fr"
                  ? "Connecte ton Instagram, YouTube et TikTok pour que les visiteurs puissent te suivre partout depuis une seule page."
                  : "Connect your Instagram, YouTube, and TikTok so visitors can follow you everywhere from one page.",
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
              {locale === "fr" ? "Crée ta page publique" : "Build your public page"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {locale === "fr"
                ? "Inscris-toi gratuitement et crée une vitrine professionnelle pour ta musique."
                : "Sign up for free and create a professional storefront for your music."}
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
