"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";

const Plasma = dynamic(() => import("@/components/landing/Plasma"), {
  ssr: false,
});

function CheckBadgeIcon({ className = "", gradId }: { className?: string; gradId?: string }) {
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
        d="M15.75 9.749 11.769 15.057c-.0645.086-.1467.157-.241.208a.726.726 0 0 1-.306.09.737.737 0 0 1-.315-.046.727.727 0 0 1-.268-.172L8.25 12.749"
        strokeWidth="1.5"
      />
      <path
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.73 1.357a1.75 1.75 0 0 1 2.54 0l1.512 1.881c.171.213.393.38.646.485.253.105.528.144.8.115l2.4-.261a1.75 1.75 0 0 1 1.72 1.72l-.261 2.4c-.03.272.01.547.115.8.105.253.272.475.485.646l1.881 1.512a1.75 1.75 0 0 1 0 2.54l-1.887 1.505a1.75 1.75 0 0 0-.6 1.447l.261 2.4a1.75 1.75 0 0 1-1.72 1.72l-2.4-.261a1.75 1.75 0 0 0-1.446.6L13.27 22.64a1.75 1.75 0 0 1-2.54 0l-1.511-1.88a1.75 1.75 0 0 0-1.447-.6l-2.4.261a1.75 1.75 0 0 1-1.72-1.72l.261-2.4a1.75 1.75 0 0 0-.6-1.447l-1.88-1.511a1.75 1.75 0 0 1 0-2.54l1.88-1.512a1.75 1.75 0 0 0 .6-1.446l-.261-2.4a1.75 1.75 0 0 1 1.72-1.72l2.4.261a1.75 1.75 0 0 0 1.447-.6l1.511-1.869Z"
        strokeWidth="1.5"
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
          <linearGradient id="chrome-cert-hero" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="18%" stopColor="rgba(215,220,235,0.65)" />
            <stop offset="38%" stopColor="rgba(150,160,185,0.35)" />
            <stop offset="55%" stopColor="rgba(180,190,215,0.5)" />
            <stop offset="72%" stopColor="rgba(250,204,21,0.35)" />
            <stop offset="88%" stopColor="rgba(250,204,21,0.55)" />
            <stop offset="100%" stopColor="rgba(250,204,21,0.4)" />
          </linearGradient>
        </defs>
      </svg>
      <CheckBadgeIcon className="relative z-10 h-14 w-14 sm:h-16 sm:w-16" gradId="chrome-cert-hero" />
      {/* Bottom accent glow — yellow */}
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(250,204,21,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {/* Bottom edge accent line — yellow */}
      <div
        className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(250,204,21,0.25) 30%, rgba(250,204,21,0.4) 50%, rgba(250,204,21,0.25) 70%, transparent 100%)",
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

function MockCertificateCard() {
  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.15)",
            }}
          >
            <CheckBadgeIcon className="h-5 w-5 text-emerald-400/80" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white/85">
              Certificate of deposit
            </p>
            <p className="text-[11px] text-white/35">
              Hash-certified &middot; Tamper-proof &middot; Timestamped
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-0">
          {[
            { label: "Track", value: "Dark Melodies Vol.3 — Melody Pack" },
            { label: "File hash (SHA-256)", value: "a7f3b8c1...d4e59b2e", mono: true },
            { label: "Deposited at", value: "Mar 28, 2026 · 2:14 PM" },
            { label: "Rights holder", value: "Kodaa" },
            { label: "Splits", value: "100% — Kodaa" },
            { label: "SACEM ID", value: "T-302.847.192-8", mono: true },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-white/[0.04] py-3"
            >
              <span className="text-[12px] text-white/35">{row.label}</span>
              <span
                className={`text-[13px] font-medium ${
                  row.mono
                    ? "font-mono text-[11px] text-white/40"
                    : "text-white/70"
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <CheckBadgeIcon className="h-4 w-4 text-emerald-400/60" />
          <span className="text-[11px] font-medium text-emerald-400/50">
            Verified &middot; Legally binding
          </span>
        </div>
      </div>
    </GlowCard>
  );
}

function MockTimelineCard() {
  const events = [
    {
      action: "File uploaded",
      time: "2:14 PM",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 10V2m0 0L5 5m3-3l3 3" />
          <path d="M2 12v2h12v-2" />
        </svg>
      ),
      color: "text-blue-400/70",
      dotColor: "bg-blue-400/70",
    },
    {
      action: "SHA-256 hash generated",
      time: "2:14 PM",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="12" height="12" rx="2" />
          <path d="M5 6h6M5 8h4M5 10h5" />
        </svg>
      ),
      color: "text-purple-400/70",
      dotColor: "bg-purple-400/70",
    },
    {
      action: "Anteriority established",
      time: "2:14 PM",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 4v4l3 2" />
        </svg>
      ),
      color: "text-amber-400/70",
      dotColor: "bg-amber-400/70",
    },
    {
      action: "Certificate generated",
      time: "2:14 PM",
      icon: <CheckBadgeIcon className="h-3.5 w-3.5" />,
      color: "text-emerald-400/70",
      dotColor: "bg-emerald-400/70",
    },
    {
      action: "PDF available for download",
      time: "2:15 PM",
      icon: (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v8m0 0l-3-3m3 3l3-3" />
          <path d="M2 12v2h12v-2" />
        </svg>
      ),
      color: "text-sky-400/70",
      dotColor: "bg-sky-400/70",
    },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold text-white/25">
          Certification timeline
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
                <span className="text-[11px] text-white/25">{e.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

function MockSplitsCard() {
  const collaborators = [
    { name: "Kodaa", role: "Producer", split: "50%", color: "hsl(25,50%,22%)" },
    { name: "Jay", role: "Songwriter", split: "30%", color: "hsl(220,45%,25%)" },
    { name: "Melo", role: "Topliner", split: "20%", color: "hsl(160,45%,25%)" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold text-white/25">
          Splits &amp; rights management
        </p>
        <div className="mt-5 space-y-2">
          {collaborators.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl px-4 py-3 transition-colors duration-200 hover:bg-white/[0.03]"
              style={{
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white/80"
                  style={{ background: c.color }}
                >
                  {c.name[0]}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-white/75">{c.name}</p>
                  <p className="text-[10px] text-white/30">{c.role}</p>
                </div>
              </div>
              <span className="text-[14px] font-semibold tabular-nums text-white/60">
                {c.split}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 px-4">
          <span className="text-[10px] text-white/25">SACEM ID:</span>
          <span className="font-mono text-[10px] text-white/35">T-302.847.192-8</span>
        </div>
      </div>
    </GlowCard>
  );
}

export default function CertificatePage() {
  const content = getLandingContent("en");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "vvault | Music protection certificates";
  }, []);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale="en" content={content} showPrimaryLinks={true} />

      {/* Plasma hero background — fixed, full-width, yellow accent */}
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
            color="#facc15"
            speed={0.3}
            direction="forward"
            scale={1.2}
            opacity={0.6}
            mouseInteractive={false}
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[680px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">

        {/* Emblem */}
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
            Protect your music
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            Hash-certified deposit certificates that prove ownership and establish anteriority from day one.
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="https://vvault.app/signup"
              className="inline-flex items-center rounded-2xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
            >
              Get started
            </a>
          </div>
        </Reveal>

        {/* Section 1: Certificate card */}
        <Reveal className="mt-40 sm:mt-52">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            A legal certificate for every track
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            When you upload a track, vvault generates a SHA-256 hash of your
            file and locks it in a certificate with a precise timestamp. This
            creates an unalterable record that proves you held the file at that
            exact date &mdash; your anteriority is established, and the
            certificate can never be modified.
          </p>
          <div className="mt-8 sm:mt-10">
            <MockCertificateCard />
          </div>
        </Reveal>

        {/* Section 2: Timeline */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            Instant certification
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            The entire process happens the moment you upload. Your file is
            hashed, timestamped, and a downloadable PDF certificate is
            generated automatically &mdash; no extra steps.
          </p>
          <div className="mt-8 sm:mt-10">
            <MockTimelineCard />
          </div>
        </Reveal>

        {/* Section 3: Splits & rights */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            Manage splits and rights
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            Attach collaborators, define royalty splits, add your SACEM or
            collecting society IDs, and upload DAW project files or screenshots
            as additional proof &mdash; all stored alongside your certificate.
          </p>
          <div className="mt-8 sm:mt-10">
            <MockSplitsCard />
          </div>
        </Reveal>

        {/* Section 4: Why it matters */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            Why it matters
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Prove anteriority",
                desc: "Your certificate timestamp legally establishes when you created or deposited the file. If a dispute arises, you have proof.",
              },
              {
                title: "Tamper-proof records",
                desc: "SHA-256 hashing ensures the file cannot be altered after deposit. Any change would invalidate the hash.",
              },
              {
                title: "Downloadable PDF",
                desc: "Each certificate is a proper legal document you can download, print, and present to labels, publishers, or in legal proceedings.",
              },
              {
                title: "Fully automatic",
                desc: "No forms to fill, no extra steps. Every upload is certified the moment it hits vvault.",
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
              Start protecting your music
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              Sign up for free and get automatic hash-certified deposit
              certificates on every track you upload.
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
