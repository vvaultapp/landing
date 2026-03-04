"use client";

import { useEffect } from "react";
import Image from "next/image";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { trackLandingView } from "@/lib/analytics/client";

const benefits = [
  "Mets tes morceaux en ligne en quelques secondes.",
  "Partage un lien propre et pro, sans pièces jointes.",
  "Vois qui ouvre, écoute et télécharge pour relancer au bon moment.",
];

export function FrSignupPage() {
  useEffect(() => {
    document.documentElement.lang = "fr";
    void trackLandingView("get");
  }, []);

  return (
    <div className="landing-root min-h-screen bg-[#0e0e0e] text-[#f0f0f0]">
      <main className="pb-40 pt-32 sm:pb-44 sm:pt-40 lg:pt-48">
        <section className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          <div className="max-w-[1280px] sm:pl-4 lg:pl-8">
            <h1 className="font-display text-[2.35rem] font-normal leading-[0.98] tracking-tight text-white sm:text-[3.35rem] lg:text-[4rem]">
              <span className="hero-line-reveal" style={{ animationDelay: "80ms" }}>
                Crée ton compte gratuit.
              </span>
            </h1>
            <p className="mt-7 max-w-[980px] text-sm leading-6 text-white/30 sm:text-base sm:leading-7">
              <span className="hero-line-reveal" style={{ animationDelay: "260ms" }}>
                Envoie ta musique avec un lien pro, suis les écoutes en temps réel et relance les bons contacts plus
                vite.
              </span>
            </p>

            <ul className="hero-seq-item mt-8 space-y-3 text-sm leading-6 text-white/84 sm:text-base sm:leading-7" style={{ animationDelay: "420ms" }}>
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#f2b84a]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="hero-seq-item mt-7 flex items-center gap-2" style={{ animationDelay: "560ms" }}>
              <span className="text-sm tracking-[0.08em] text-[#f2b84a]">★★★★★</span>
              <span className="text-xs font-medium text-white/78 sm:text-sm">Used by 600+ producers daily</span>
            </div>
            <p className="hero-seq-item mt-2 text-sm text-white/56 sm:text-base" style={{ animationDelay: "640ms" }}>
              “Finally one link that looks clean and tells me who is actually listening.”
            </p>

            <div className="hero-seq-item mt-8 flex items-center gap-4" style={{ animationDelay: "760ms" }}>
              <LandingCtaLink
                loggedInHref="https://vvault.app/signup"
                loggedOutHref="https://vvault.app/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-base"
              >
                Créer mon compte gratuit
              </LandingCtaLink>

              <p className="text-xs text-white/52 sm:text-sm">
                <LandingCtaLink
                  loggedInHref="https://vvault.app/login"
                  loggedOutHref="https://vvault.app/login"
                  className="underline decoration-white/26 underline-offset-4 transition-colors hover:text-white"
                >
                  Déjà un compte ? Se connecter
                </LandingCtaLink>
              </p>
            </div>
          </div>

          <div className="hero-seq-item mt-14 -ml-[18px] w-[calc(100%+36px)] sm:-ml-[32px] sm:mt-16 sm:w-[calc(100%+64px)] lg:-ml-[72px] lg:w-[calc(100%+144px)]" style={{ animationDelay: "900ms" }}>
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
            className="inline-flex w-full max-w-[460px] items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:text-base"
          >
            Créer mon compte gratuit
          </LandingCtaLink>
        </div>
      </div>
    </div>
  );
}
