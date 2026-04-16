"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Locale } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";

const Beams = dynamic(() => import("@/components/landing/Beams"), { ssr: false });

type HomeConversionCtaProps = {
  locale?: Locale;
};

type LandingStatsResponse = {
  emailsSentTotal: number;
  usersTotal: number;
  tracksTotal: number;
  moneyPaidTotalCents: number;
  appStoreReviewLabel: string;
  avatarUrls: string[];
};

const FALLBACK_USERS = 1300;

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <path d="M5 10.5l3.5 3.5L15 7" />
    </svg>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3l8 3v6c0 4.5-3.2 8.5-8 9.5-4.8-1-8-5-8-9.5V6l8-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 19V5M4 19h16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M8 15l3-3 3 2 4-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CashIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 9v.01M18 15v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
    </svg>
  );
}

type BenefitProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  glow: string;
};

function BenefitCard({ icon, title, description, accent, glow }: BenefitProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-6 sm:p-7"
      style={{
        background:
          "linear-gradient(180deg, rgba(14,14,18,0.92) 0%, rgba(6,6,9,1) 100%)",
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
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accent}30 15%, ${accent}99 50%, ${accent}30 85%, transparent 100%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -top-12 left-1/2 h-[140px] w-[280px] -translate-x-1/2"
        style={{
          background: `radial-gradient(ellipse at center, ${glow} 0%, transparent 70%)`,
        }}
      />
      <div
        className="relative flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          background: `${accent}10`,
          border: `1px solid ${accent}25`,
          color: accent,
        }}
      >
        <span className="block h-5 w-5">{icon}</span>
      </div>
      <h4 className="relative mt-4 text-[15px] font-semibold text-white/90">
        {title}
      </h4>
      <p className="relative mt-1.5 text-[13px] leading-relaxed text-white/45">
        {description}
      </p>
    </div>
  );
}

function useUsersTotal() {
  const [users, setUsers] = useState<number>(FALLBACK_USERS);

  useEffect(() => {
    let active = true;
    fetch("/api/landing-stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Partial<LandingStatsResponse> | null) => {
        if (!active || !data) return;
        const n = Number(data.usersTotal);
        if (Number.isFinite(n) && n > 0) {
          setUsers(Math.max(FALLBACK_USERS, Math.floor(n)));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return users;
}

export function HomeConversionCta({ locale = "en" }: HomeConversionCtaProps) {
  const fr = locale === "fr";
  const users = useUsersTotal();

  // Round down to nearest 100 for a cleaner social-proof number
  const usersDisplay = `${Math.floor(users / 100) * 100}+`;

  const benefits = [
    {
      icon: <ShieldIcon className="h-5 w-5" />,
      title: fr ? "Tes droits, certifiés" : "Your rights, certified",
      description: fr
        ? "Chaque upload reçoit un certificat de dépôt par hash. Antériorité prouvée, légalement opposable."
        : "Every upload gets a hash-certified deposit. Prove anteriority, defend your rights — legally.",
      accent: "rgba(250,204,21,1)",
      glow: "rgba(250,204,21,0.10)",
    },
    {
      icon: <ChartIcon className="h-5 w-5" />,
      title: fr ? "Vois ce qui se passe" : "See what actually happens",
      description: fr
        ? "Sache qui ouvre, qui écoute, qui télécharge. Plus de devinettes après l'envoi."
        : "Know who opens, who plays, who downloads. No more sending into the void.",
      accent: "rgba(125,200,255,1)",
      glow: "rgba(125,200,255,0.10)",
    },
    {
      icon: <CashIcon className="h-5 w-5" />,
      title: fr ? "Sois payé directement" : "Get paid, directly",
      description: fr
        ? "Vente de beats, packs, exclus. Stripe intégré, paiement direct sur ton compte."
        : "Sell beats, packs, exclusives. Stripe built in — money lands straight in your bank.",
      accent: "rgba(168,130,255,1)",
      glow: "rgba(168,130,255,0.10)",
    },
  ];

  const headline = fr
    ? "Le studio derrière le studio."
    : "The workspace behind the music.";
  const headlineAccent = fr ? "le studio." : "the music.";
  const subhead = fr
    ? "Remplace Drive, Mailchimp et Beatstars par un seul outil pensé pour la façon dont tu travailles vraiment."
    : "Replace Drive, Mailchimp and Beatstars with one tool built for the way you actually work.";

  const ctaTitle = fr ? "Commence en 30 secondes." : "Start in 30 seconds.";
  const ctaSub = fr
    ? "Plan gratuit pour toujours. Aucune carte requise. Upgrade quand t'es prêt."
    : "Free forever plan. No credit card. Upgrade when you're ready.";

  const primaryLabel = fr ? "Commencer gratuitement" : "Start free";
  const secondaryLabel = fr ? "Voir les tarifs" : "See pricing";

  const trustLine = fr
    ? `${usersDisplay} producteurs · 4.9★ sur Trustpilot · Plan gratuit pour toujours`
    : `${usersDisplay} producers · 4.9★ on Trustpilot · Free forever plan`;

  return (
    <section
      id="get-started"
      className="relative overflow-hidden pt-36 sm:pt-52"
    >
      {/* Soft global glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(168,130,255,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        {/* Eyebrow + heading */}
        <Reveal>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/80"
                style={{ boxShadow: "0 0 8px rgba(52,211,153,0.7)" }}
              />
              {fr ? "Prêt à commencer ?" : "Ready when you are"}
            </div>
            <h2 className="mx-auto mt-6 max-w-[820px] font-display text-[2.25rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-[3.4rem] lg:text-[4rem]">
              {headline.replace(headlineAccent, "")}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(170,170,185,0.55) 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {headlineAccent}
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-relaxed text-white/45 sm:text-[16px]">
              {subhead}
            </p>
          </div>
        </Reveal>

        {/* Benefit grid */}
        <div className="mx-auto mt-12 grid max-w-[1080px] gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-5">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delayMs={i * 80} className="h-full">
              <BenefitCard {...b} />
            </Reveal>
          ))}
        </div>

        {/* Centerpiece CTA card */}
        <div className="mt-10 sm:mt-14">
          <Reveal>
            <div
              className="relative mx-auto max-w-[1080px] overflow-hidden rounded-[28px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,18,28,0.98) 0%, rgba(6,5,10,1) 100%)",
              }}
            >
              {/* Animated beams (very subtle) */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
                <Beams
                  beamWidth={3.2}
                  beamHeight={20}
                  beamNumber={14}
                  lightColor="#a882ff"
                  speed={1.2}
                  noiseIntensity={1.4}
                  scale={0.18}
                  rotation={28}
                />
              </div>

              {/* Border overlay */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderBottom: "none",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
                }}
              />
              {/* Top edge highlight */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.20) 50%, rgba(255,255,255,0.06) 85%, transparent 100%)",
                }}
              />
              {/* Top center radial glow */}
              <div
                className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[760px] -translate-x-1/2 -translate-y-1/3"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(168,130,255,0.18) 0%, rgba(250,204,21,0.06) 35%, transparent 70%)",
                }}
              />
              {/* Bottom soft fade */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
                style={{
                  background:
                    "linear-gradient(to top, rgba(6,5,10,1) 0%, transparent 100%)",
                }}
              />

              <div className="relative px-6 py-14 text-center sm:px-12 sm:py-20">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/65 backdrop-blur-sm">
                  <CheckIcon className="h-3.5 w-3.5 fill-none stroke-emerald-400/90 stroke-[2.5]" />
                  {fr ? "Plan gratuit pour toujours" : "Free forever plan"}
                </div>

                <h3 className="mx-auto mt-6 max-w-[680px] font-display text-[1.85rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-[2.6rem] lg:text-[3rem]">
                  {ctaTitle}
                </h3>
                <p className="mx-auto mt-4 max-w-[520px] text-[14px] leading-relaxed text-white/55 sm:text-[15px]">
                  {ctaSub}
                </p>

                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <LandingCtaLink
                    loggedInHref="https://vvault.app/billing"
                    loggedOutHref="https://vvault.app/signup"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-white px-6 py-3 text-[14px] font-semibold text-[#0e0e0e] transition-all duration-200 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 sm:text-[15px]"
                    style={{
                      boxShadow:
                        "0 0 0 1px rgba(255,255,255,0.4), 0 12px 40px -12px rgba(168,130,255,0.45), 0 8px 24px -8px rgba(250,204,21,0.25)",
                    }}
                  >
                    <span className="relative z-10">{primaryLabel}</span>
                    <svg
                      viewBox="0 0 20 20"
                      className="relative z-10 h-4 w-4 fill-none stroke-current stroke-[1.8] transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      <path d="M4 10h11M11 6l4 4-4 4" />
                    </svg>
                  </LandingCtaLink>
                  <a
                    href={fr ? "/fr/pricing" : "/pricing"}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-[14px] font-medium text-white/80 transition-colors duration-200 hover:bg-white/[0.07] hover:text-white sm:text-[15px]"
                  >
                    {secondaryLabel}
                    <svg
                      viewBox="0 0 20 20"
                      className="h-4 w-4 fill-none stroke-current stroke-[1.8]"
                    >
                      <path d="M7 4l6 6-6 6" />
                    </svg>
                  </a>
                </div>

                {/* Trust line */}
                <div className="mt-9 flex flex-col items-center gap-2 sm:mt-10">
                  <div
                    className="flex items-center gap-1 text-emerald-400/90"
                    aria-label="4.9 out of 5 stars"
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <StarIcon key={i} className="h-3.5 w-3.5" />
                    ))}
                  </div>
                  <p className="text-[12px] font-medium text-white/45 sm:text-[13px]">
                    {trustLine}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
