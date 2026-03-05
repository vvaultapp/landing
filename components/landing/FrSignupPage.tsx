"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingContent } from "@/components/landing/content";
import { trackLandingView } from "@/lib/analytics/client";

const benefits = [
  "Envoie tes morceaux avec un lien propre et pro.",
  "Suis qui ouvre, écoute et télécharge en temps réel.",
  "Relance les bons contacts plus vite pour closer plus de placements.",
];

const frictionKillers = ["100% gratuit", "Sans carte bancaire", "30 sec pour commencer", "Annule quand tu veux"];

export function FrSignupPage() {
  const content = getLandingContent("fr");

  useEffect(() => {
    document.documentElement.lang = "fr";
    void trackLandingView("get");
  }, []);

  return (
    <div className="landing-root min-h-screen bg-[#0e0e0e] font-sans text-[#f0f0f0]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-[#0e0e0e]"
      >
        {content.skipToContentLabel}
      </a>
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[70px] w-full max-w-[1320px] items-center px-5 sm:px-8 lg:px-10">
          <Link
            href="/fr"
            className="rounded-xl text-[13px] font-semibold uppercase tracking-[0.18em] text-white"
            aria-label={content.ui.homepageAriaLabel}
          >
            vvault
          </Link>
        </div>
      </header>

      <main id="main-content" className="pb-32 pt-12 sm:pt-16">
        <section className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          <div className="max-w-[980px]">
            <h1 className="font-display text-[2.3rem] leading-[1.02] tracking-tight text-white sm:text-[3.2rem] lg:text-[3.8rem]">
              Crée ton compte gratuit.
            </h1>
            <p className="mt-5 max-w-[70ch] text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
              Envoie ta musique, vois qui écoute vraiment, et transforme chaque envoi en opportunité concrète.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <span className="text-sm tracking-[0.08em] text-[#f2b84a]">★★★★★</span>
              <span className="text-xs font-medium text-white/86 sm:text-sm">Used by 600+ producers daily</span>
            </div>

            <ul className="mt-6 space-y-3 text-sm leading-6 text-white/88 sm:text-base sm:leading-7">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#f2b84a]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {frictionKillers.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/86 sm:text-sm"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <LandingCtaLink
                loggedInHref="https://vvault.app/signup"
                loggedOutHref="https://vvault.app/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-base"
              >
                Créer mon compte gratuit
              </LandingCtaLink>
              <LandingCtaLink
                loggedInHref="https://vvault.app/login"
                loggedOutHref="https://vvault.app/login"
                className="text-xs text-white/62 underline decoration-white/28 underline-offset-4 transition-colors hover:text-white sm:text-sm"
              >
                Déjà un compte ? Se connecter
              </LandingCtaLink>
            </div>
          </div>

          <div className="mt-12 -ml-[18px] w-[calc(100%+36px)] sm:-ml-[32px] sm:w-[calc(100%+64px)] lg:-ml-[72px] lg:w-[calc(100%+144px)]">
            <Image
              src="/app show-off.png"
              alt="Aperçu de l'application vvault"
              width={1800}
              height={950}
              priority
              className="block h-auto w-full max-w-none"
            />
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/12 bg-[#0e0e0e]/94 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-center">
          <LandingCtaLink
            loggedInHref="https://vvault.app/signup"
            loggedOutHref="https://vvault.app/signup"
            className="inline-flex w-full max-w-[520px] items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:text-base"
          >
            Créer mon compte gratuit
          </LandingCtaLink>
        </div>
      </div>

      <LandingFooter locale="fr" content={content} showColumns={false} />
    </div>
  );
}
