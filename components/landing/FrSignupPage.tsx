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
      <main className="relative overflow-hidden pb-40 pt-20 sm:pb-44 sm:pt-24">
        <div className="pointer-events-none absolute -top-36 left-1/2 h-96 w-[min(92vw,900px)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_72%)] blur-2xl" />
        <div className="pointer-events-none absolute inset-x-0 top-[48%] mx-auto h-px w-[min(100%,1200px)] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <section className="mx-auto w-full max-w-[1100px] px-5 sm:px-8">
          <div className="rounded-[30px] border border-white/12 bg-white/[0.03] p-6 shadow-[0_18px_64px_rgba(0,0,0,0.35)] sm:p-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
            <div>
              <h1 className="font-display text-[2.25rem] leading-[1.02] tracking-tight text-white sm:text-[3rem] lg:text-[3.55rem]">
                Transforme tes envois en placements.
              </h1>
              <p className="mt-5 max-w-[54ch] text-sm leading-6 text-white/72 sm:text-base sm:leading-7">
                Crée ton compte gratuit pour envoyer tes tracks avec un lien pro et savoir exactement qui écoute
                vraiment.
              </p>

              <ul className="mt-7 space-y-3 text-sm leading-6 text-white/84 sm:text-base">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span className="mt-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#f2b84a]" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl border border-white/12 bg-black/25 p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/46">Preuve rapide</p>
                <p className="mt-2 text-sm text-white/92 sm:text-base">
                  Utilisé chaque jour par <span className="font-semibold">600+ producteurs</span>.
                </p>
                <p className="mt-1 text-sm text-white/60">Studios, managers et équipes A&amp;R.</p>
              </div>

              <div className="mt-7">
                <LandingCtaLink
                  loggedInHref="https://vvault.app/signup"
                  loggedOutHref="https://vvault.app/signup"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-base"
                >
                  Créer mon compte gratuit
                </LandingCtaLink>
              </div>

              <p className="mt-4 text-xs text-white/52 sm:text-sm">
                <LandingCtaLink
                  loggedInHref="https://vvault.app/login"
                  loggedOutHref="https://vvault.app/login"
                  className="underline decoration-white/26 underline-offset-4 transition-colors hover:text-white"
                >
                  Déjà un compte ? Se connecter
                </LandingCtaLink>
              </p>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="rounded-2xl border border-white/10 bg-[#111111] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                <Image
                  src="/app show-off-cropped.png"
                  alt="Apercu de l'application vvault"
                  width={1620}
                  height={880}
                  priority
                  className="block h-auto w-full rounded-xl"
                />
              </div>
            </div>
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
