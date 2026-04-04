"use client";

import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import type { Locale } from "@/components/landing/content";

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

export function CertificateTeaser({ locale = "en" }: { locale?: Locale }) {
  return (
    <section className="pt-36 sm:pt-52">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          {/* Section emblem */}
          <div className="mb-6 flex justify-center">
            <div
              className="relative flex h-[80px] w-[80px] items-center justify-center overflow-hidden rounded-[22px] sm:h-[96px] sm:w-[96px] sm:rounded-[26px]"
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
              {/* Top-left specular highlight */}
              <div
                className="pointer-events-none absolute left-0 top-0 h-[60%] w-[70%]"
                style={{
                  background:
                    "radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.03) 0%, transparent 60%)",
                }}
              />
              {/* Top edge highlight line */}
              <div
                className="pointer-events-none absolute inset-x-[15%] top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)",
                }}
              />
              {/* Bottom accent glow — prominent diffused spill */}
              <div
                className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
                style={{
                  background:
                    "radial-gradient(ellipse 100% 60% at 50% 80%, #facc15 0%, transparent 70%)",
                  opacity: 0.12,
                  filter: "blur(20px)",
                }}
              />
              {/* Bottom edge accent line */}
              <div
                className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, #facc1540 30%, #facc1570 50%, #facc1540 70%, transparent 100%)",
                }}
              />
              {/* Left edge subtle highlight */}
              <div
                className="pointer-events-none absolute inset-y-[15%] left-0 w-px"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, #facc1520 80%, transparent 100%)",
                }}
              />
              {/* Icon with chrome gradient */}
              <div className="relative z-10">
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="chrome-cert-teaser" x1="0.5" y1="0" x2="0.5" y2="1">
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
                <CheckBadgeIcon className="h-9 w-9 sm:h-10 sm:w-10" gradId="chrome-cert-teaser" />
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-[1.55rem] font-medium leading-tight text-white sm:text-3xl lg:text-[2.2rem]">
              {locale === "fr" ? (
                <>
                  Protège ta musique.{" "}
                  <span className="text-white/40">Légalement.</span>
                </>
              ) : (
                <>
                  Protect your music.{" "}
                  <span className="text-white/40">Legally.</span>
                </>
              )}
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {locale === "fr"
                ? "Chaque track que tu uploades reçoit un certificat de dépôt certifié par hash \u2014 un document légal infalsifiable qui établit l'antériorité et protège tes droits."
                : <>Every track you upload gets a hash-certified deposit certificate &mdash; a tamper-proof legal document that establishes anteriority and protects your rights.</>}
            </p>
            <div className="mt-5 flex justify-center">
              <Link
                href="/certificate"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
              >
                {locale === "fr" ? "Découvrir la fonctionnalité" : "View new feature"}
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 fill-none stroke-current stroke-[1.8]"
                >
                  <path d="M4 10h11M11 6l4 4-4 4" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Fully revealed certificate preview */}
          <div className="mt-10 sm:mt-14">
            <div
              className="relative mx-auto max-w-[780px] overflow-hidden rounded-2xl sm:rounded-3xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(8,8,10,0.98) 0%, rgba(4,4,5,1) 100%)",
              }}
            >
              {/* Smooth border overlay */}
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
              {/* top glow line */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[inherit]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
                }}
              />
              {/* top center glow orb */}
              <div
                className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[140px] w-[520px]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
                }}
              />

              <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
                {/* Certificate header */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{
                      background: "rgba(250,204,21,0.08)",
                      border: "1px solid rgba(250,204,21,0.15)",
                    }}
                  >
                    <CheckBadgeIcon className="h-5 w-5 text-yellow-400/80" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white/85">
                      {locale === "fr" ? "Certificat de dépôt" : "Certificate of deposit"}
                    </p>
                    <p className="text-[11px] text-white/35">
                      {locale === "fr" ? "Certifié par hash · Infalsifiable · Horodaté" : <>Hash-certified &middot; Tamper-proof &middot; Timestamped</>}
                    </p>
                  </div>
                </div>

                {/* Certificate body */}
                <div className="mt-6 space-y-0">
                  {[
                    { label: locale === "fr" ? "Morceau" : "Track", value: "Dark Melodies Vol.3 — Melody Pack" },
                    { label: locale === "fr" ? "Hash du fichier (SHA-256)" : "File hash (SHA-256)", value: "a7f3...9b2e", mono: true },
                    { label: locale === "fr" ? "Déposé le" : "Deposited at", value: locale === "fr" ? "28 mars 2026 · 14h14" : "Mar 28, 2026 · 2:14 PM" },
                    { label: locale === "fr" ? "Titulaire des droits" : "Rights holder", value: "Kodaa" },
                    { label: "Splits", value: "100% — Kodaa" },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-white/[0.04] py-3"
                    >
                      <span className="text-[12px] text-white/35">
                        {row.label}
                      </span>
                      <span
                        className={`text-[13px] font-medium text-white/70 ${
                          row.mono ? "font-mono text-[11px] text-white/40" : ""
                        }`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Seal */}
                <div className="mt-6 flex items-center justify-center gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-yellow-400/60" />
                  <span className="text-[11px] font-medium text-yellow-400/50">
                    {locale === "fr" ? "Vérifié par vvault" : "Verified by vvault"}
                  </span>
                </div>
              </div>

              {/* Bottom fade */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
                style={{
                  background:
                    "linear-gradient(to top, rgba(4,4,5,1) 0%, transparent 100%)",
                }}
              />
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}
