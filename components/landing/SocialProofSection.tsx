"use client";

import { useEffect, useState, useCallback } from "react";
import { Reveal } from "@/components/landing/Reveal";
import type { Locale } from "@/components/landing/content";

const REVIEWS_EN = [
  {
    name: "Hugo",
    body: "Best beat selling / stocking / sending app. Game changer.",
    rating: 5,
  },
  {
    name: "la croix",
    body: "It's the best platform for producers. It allows you to have your productions listened to and to sell them as well.",
    rating: 5,
  },
  {
    name: "Adrien D.",
    body: "An app for beatmakers, designed by a beatmaker! I highly recommend it.",
    rating: 5,
  },
  {
    name: "Alexandre G.",
    body: "A really good app for your beats management and track mail sending. 10/10 recommended!",
    rating: 5,
  },
  {
    name: "Sacha S.",
    body: "Best app. I use it all the time, everyday.",
    rating: 5,
  },
  {
    name: "Miko",
    body: "Best app for beatmakers.",
    rating: 5,
  },
  {
    name: "Saili",
    body: "This app is very useful if you want to have all your beats and songs in one place. It helps me schedule and send beats to artists more easily.",
    rating: 5,
  },
  {
    name: "Prostel A.",
    body: "That's a good app. I think it's the best on the market.",
    rating: 5,
  },
];

const REVIEWS_FR = [
  {
    name: "Hugo",
    body: "La meilleure app pour vendre / stocker / envoyer ses beats. Un game changer.",
    rating: 5,
  },
  {
    name: "la croix",
    body: "C'est la meilleure plateforme pour les producteurs. Elle permet de faire écouter et vendre ses prods.",
    rating: 5,
  },
  {
    name: "Adrien D.",
    body: "Une app pour les beatmakers, conçue par un beatmaker ! Je recommande vivement.",
    rating: 5,
  },
  {
    name: "Alexandre G.",
    body: "Une super app pour gérer tes beats et envoyer tes track mails. 10/10 !",
    rating: 5,
  },
  {
    name: "Sacha S.",
    body: "La meilleure app. Je l'utilise tout le temps, tous les jours.",
    rating: 5,
  },
  {
    name: "Miko",
    body: "La meilleure app pour les beatmakers.",
    rating: 5,
  },
  {
    name: "Saili",
    body: "Cette app est super utile pour avoir tous tes beats et morceaux au même endroit. Ça m'aide à planifier et envoyer mes beats aux artistes plus facilement.",
    rating: 5,
  },
  {
    name: "Prostel A.",
    body: "C'est une bonne app. Je pense que c'est la meilleure du marché.",
    rating: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-[#00b67a]">
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 13.27l-4.77 2.51.91-5.33L2.27 6.68l5.34-.78L10 1z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review, state }: { review: typeof REVIEWS_EN[0]; state: "entering" | "visible" | "exiting" }) {
  return (
    <div
      className="flex w-full flex-col items-center gap-3 rounded-2xl px-6 py-5 text-center transition-all duration-700 ease-in-out sm:px-8 sm:py-6"
      style={{
        opacity: state === "visible" ? 1 : 0,
        filter: state === "visible" ? "blur(0px)" : "blur(8px)",
        transform: state === "entering" ? "translateY(8px)" : state === "exiting" ? "translateY(-8px)" : "translateY(0)",
      }}
    >
      <Stars count={review.rating} />
      <p className="text-[13px] leading-relaxed text-white/70 sm:text-[14px]">
        &ldquo;{review.body}&rdquo;
      </p>
      <p className="text-[11px] font-medium text-white/40 sm:text-xs">
        {review.name}
      </p>
    </div>
  );
}

export function SocialProofSection({ locale = "en" }: { locale?: Locale }) {
  const REVIEWS = locale === "fr" ? REVIEWS_FR : REVIEWS_EN;
  const [pairIndex, setPairIndex] = useState(0);
  const [state, setState] = useState<"visible" | "exiting" | "entering">("visible");
  const [trustpilotScore, setTrustpilotScore] = useState("4.4");

  useEffect(() => {
    let active = true;
    fetch("/api/trustpilot-score")
      .then((res) => res.json())
      .then((data: { score?: string }) => {
        if (active && data.score) setTrustpilotScore(data.score);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const pairCount = Math.ceil(REVIEWS.length / 3);

  const cycle = useCallback(() => {
    setState("exiting");
    setTimeout(() => {
      setPairIndex((prev) => (prev + 1) % pairCount);
      setState("entering");
      setTimeout(() => {
        setState("visible");
      }, 50);
    }, 700);
  }, [pairCount]);

  useEffect(() => {
    const interval = setInterval(cycle, 5000);
    return () => clearInterval(interval);
  }, [cycle]);

  const currentPair = [
    REVIEWS[(pairIndex * 3) % REVIEWS.length],
    REVIEWS[(pairIndex * 3 + 1) % REVIEWS.length],
    REVIEWS[(pairIndex * 3 + 2) % REVIEWS.length],
  ];

  return (
    <section id="customers" className="pt-28 sm:pt-40">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          {/* Outer container */}
          <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px]">
            {/* Top center glow — bigger, lower opacity */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[160px] w-[500px] sm:h-[200px] sm:w-[650px]"
              style={{
                background: "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 45%, transparent 70%)",
              }}
            />

            {/* Top border line — bright center, fading to corners */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 10%, rgba(255,255,255,0.18) 35%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.18) 65%, rgba(255,255,255,0.06) 90%, transparent 100%)",
              }}
            />


            {/* Content */}
            <div className="relative px-6 pb-10 pt-12 sm:px-10 sm:pb-12 sm:pt-14">
              {/* Trustpilot label */}
              <a
                href="https://www.trustpilot.com/review/vvault.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2.5 mx-auto w-full transition-colors duration-200"
              >
                {/* Trustpilot green star logo */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 271.3 258" className="h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]" style={{ position: "relative", top: "-1px" }}>
                  <path fill="#00b67a" d="M271.3 98.6H167.7L135.7 0l-32.1 98.6L0 98.5l83.9 61L51.8 258l83.9-60.9 83.8 60.9-32-98.5 83.8-60.9z"/>
                  <path fill="#005128" d="M194.7 181.8l-7.2-22.3-51.8 37.6z"/>
                </svg>
                <span className="text-sm text-white/50 transition-colors duration-200 group-hover:text-white group-hover:underline sm:text-base">
                  {locale === "fr" ? "Adoré sur Trustpilot" : "Loved on Trustpilot"}
                </span>
                <span className="text-sm font-semibold text-white/50 sm:text-base">
                  {trustpilotScore}/5
                </span>
              </a>

              {/* Review cards */}
              <div className="mt-8 grid h-[180px] grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                {currentPair.map((review) => (
                  <ReviewCard key={`${pairIndex}-${review.name}`} review={review} state={state} />
                ))}
              </div>

              {/* Dot indicators */}
              <div className="mt-6 flex items-center justify-center gap-1.5">
                {Array.from({ length: pairCount }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width: i === pairIndex ? 16 : 4,
                      backgroundColor: i === pairIndex ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
