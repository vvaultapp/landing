"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";

const Plasma = dynamic(() => import("@/components/landing/Plasma"), {
  ssr: false,
});

/* ------------------------------------------------------------------ */
/*  Grid icon for the emblem                                          */
/* ------------------------------------------------------------------ */
function GridIcon({ className = "", gradId }: { className?: string; gradId?: string }) {
  const strokeColor = gradId ? `url(#${gradId})` : "currentColor";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={strokeColor} strokeWidth="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={strokeColor} strokeWidth="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={strokeColor} strokeWidth="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={strokeColor} strokeWidth="1.5" />
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
      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
      {/* Highlight */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[60%] w-[70%]"
        style={{
          background:
            "radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.03) 0%, transparent 60%)",
        }}
      />
      {/* Top edge line */}
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
          <linearGradient id="chrome-features-hero" x1="0.5" y1="0" x2="0.5" y2="1">
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
      <GridIcon className="relative z-10 h-14 w-14 sm:h-16 sm:w-16" gradId="chrome-features-hero" />
      {/* Bottom accent glow */}
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(52,211,153,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {/* Bottom edge accent line */}
      <div
        className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.25) 30%, rgba(52,211,153,0.4) 50%, rgba(52,211,153,0.25) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature data                                                      */
/* ------------------------------------------------------------------ */
const features = [
  {
    title: "Library",
    href: "/features/library",
    description:
      "Upload, organize, and distribute your sounds from one central hub.",
    bullets: [
      "Drag-and-drop uploads with ZIP auto-unpack",
      "Metadata, cover art, and waveform previews",
      "Folders, packs, and series organization",
      "Instant streaming links for every file",
    ],
  },
  {
    title: "Analytics",
    href: "/features/analytics",
    description:
      "Know exactly how your audience engages with every beat you send.",
    bullets: [
      "Opens, clicks, play duration, and downloads",
      "Sales and purchase tracking",
      "Saves and engagement scoring",
      "Best time to send recommendations",
    ],
  },
  {
    title: "Campaigns",
    href: "/features/campaigns",
    description:
      "Send professional beat emails that land in the primary inbox.",
    bullets: [
      "Create, schedule, and send email campaigns",
      "Email, Instagram, and Messages channels",
      "Gmail integration for delivery",
      "Track opens, clicks, plays, downloads, and saves",
    ],
  },
  {
    title: "Contacts",
    href: "/features/contacts",
    description:
      "A CRM built for the music industry, not another generic spreadsheet.",
    bullets: [
      "Full contact timeline with every interaction",
      "Custom groups and color-coded tags",
      "Engagement scoring based on real activity",
      "Import contacts from any source",
    ],
  },
  {
    title: "Opportunities",
    href: "/features/opportunities",
    description:
      "A community request board where artists post what they need.",
    bullets: [
      "Browse and submit to open requests",
      "Paid and free submission options",
      "Reference tracks for each opportunity",
      "Submission tracking and limits",
    ],
  },
  {
    title: "Sales",
    href: "/features/sales",
    description:
      "Sell beats, kits, and licenses directly with built-in checkout.",
    bullets: [
      "Stripe-powered instant checkout",
      "License types: basic, premium, stems, exclusive",
      "5% fee on Pro, 0% on Ultra",
      "Multi-currency support (EUR, USD, GBP)",
    ],
  },
  {
    title: "Profile",
    href: "/features/profile",
    description:
      "Your public-facing producer page, fully branded to you.",
    bullets: [
      "Customizable public page with theme presets",
      "Packs, soundkits, series, and tracks showcase",
      "Placement credits with linked releases",
      "Social links: Instagram, YouTube, TikTok",
    ],
  },
  {
    title: "Link in Bio",
    href: "/features/link-in-bio",
    description:
      "Your public profile with packs, tracks, and placements.",
    bullets: [
      "Public profile with packs, soundkits, and tracks",
      "Theme presets and custom backgrounds",
      "Placement credits with platform links",
      "Built-in audio player for visitors",
    ],
  },
  {
    title: "Studio",
    href: "/features/studio",
    description:
      "Automated video posting for your beats. Schedule, template, publish.",
    bullets: [
      "Auto-generate 1280×720 videos from your pack tracks",
      "Customizable templates with BPM, key, and social tokens",
      "Flexible scheduling: post daily, weekly, or custom intervals",
      "Cover art modes: track artwork, pack default, or custom",
    ],
  },
  {
    title: "Certificate",
    href: "/certificate",
    description:
      "Protect your music with hash-certified deposit certificates.",
    bullets: [
      "SHA-256 hash deposit with precise timestamps",
      "Legally binding anteriority proof",
      "Downloadable PDF certificates",
      "Splits and rights management built in",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Feature card                                                      */
/* ------------------------------------------------------------------ */
function FeatureCard({
  title,
  href,
  description,
  bullets,
}: {
  title: string;
  href: string;
  description: string;
  bullets: string[];
}) {
  return (
    <Link href={href} className="group block">
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 transition-colors duration-200 hover:brightness-125"
        style={{
          background:
            "linear-gradient(180deg, rgba(12,12,15,0.98) 0%, rgba(4,4,5,1) 100%)",
        }}
      >
        {/* Border overlay */}
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
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <svg
              className="h-4 w-4 text-white/20 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-white/50">
            {description}
          </p>
          <ul className="mt-4 space-y-2">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400/50" />
                <span className="text-[13px] leading-relaxed text-white/40">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function FeaturesPage() {
  const content = getLandingContent("en");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "vvault | All Features";
  }, []);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale="en" content={content} showPrimaryLinks={true} />

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
        <div className="absolute inset-0 opacity-[0.3]">
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

      <main className="relative z-10 mx-auto max-w-[880px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">
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
            All Features
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            The complete platform for music producers. Upload, promote, sell,
            and protect your sounds — all from one place.
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="https://vvault.app/signup"
              className="inline-flex items-center rounded-2xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
            >
              Get started for free
            </a>
          </div>
        </Reveal>

        {/* Feature cards grid */}
        <Reveal className="mt-28 sm:mt-36">
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </Reveal>

        {/* Final CTA */}
        <Reveal className="mt-28 sm:mt-36">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-white sm:text-3xl">
              Ready to level up?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              Join thousands of producers already using vvault to manage their
              beats, grow their audience, and close more placements.
            </p>
            <div className="mt-6 flex justify-center">
              <a
                href="https://vvault.app/signup"
                className="inline-flex items-center rounded-2xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
              >
                Start for free
              </a>
            </div>
          </div>
        </Reveal>
      </main>

      <LandingFooter
        locale="en"
        content={content}
        showColumns={false}
        inlineLegalWithBrand
      />
    </div>
  );
}
