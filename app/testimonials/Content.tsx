"use client";

import { useEffect, useState } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";
import type { Locale } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

type LandingStats = {
  emailsSentTotal: number;
  usersTotal: number;
  tracksTotal: number;
  moneyPaidTotalCents: number;
  appStoreReviewLabel: string;
};

function useLandingStats() {
  const [stats, setStats] = useState<LandingStats | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/landing-stats", { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = await res.json();
        if (!active) return;
        setStats({
          emailsSentTotal: Math.max(0, Math.floor(Number(data.emailsSentTotal) || 0)),
          usersTotal: Math.max(0, Math.floor(Number(data.usersTotal) || 0)),
          tracksTotal: Math.max(0, Math.floor(Number(data.tracksTotal) || 0)),
          moneyPaidTotalCents: Math.max(0, Math.floor(Number(data.moneyPaidTotalCents) || 0)),
          appStoreReviewLabel:
            typeof data.appStoreReviewLabel === "string" && data.appStoreReviewLabel.trim()
              ? data.appStoreReviewLabel.trim()
              : "4.9/5",
        });
      } catch {
        // keep null — show loading state
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  return stats;
}

function fmt(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US").format(n);
}

export default function TestimonialsPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);
  const stats = useLandingStats();
  const fr = locale === "fr";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    document.title = fr ? "vvault | Témoignages" : "vvault | Testimonials";
  }, [fr]);

  const sponsoredVideos = content.pricingUi.sponsoredVideos;
  const testimonialVideoUrl = content.pricingUi.testimonialVideoUrl;

  const numberItems = stats
    ? [
        { stat: `${fmt(stats.usersTotal, locale)}+`, label: fr ? "Producteurs sur la plateforme" : "Producers on the platform" },
        { stat: fmt(stats.tracksTotal, locale), label: fr ? "Tracks uploadés" : "Tracks uploaded" },
        { stat: fmt(stats.emailsSentTotal, locale), label: fr ? "Emails de campagne envoyés" : "Campaigns emails sent" },
        { stat: stats.appStoreReviewLabel, label: fr ? "Note App Store" : "App Store rating" },
        { stat: "0%", label: fr ? "Frais marketplace sur Ultra" : "Marketplace fees on Ultra" },
        { stat: "100%", label: fr ? "Gratuit, sans carte bancaire" : "Free to start, no credit card" },
      ]
    : null;

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />
      <main className="relative z-10 mx-auto max-w-[900px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">
        {/* Header */}
        <Reveal>
          <h1
            className="text-center text-3xl font-medium leading-tight tracking-tight sm:text-[2.8rem]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {fr ? "Ils parlent de nous" : "They talk about us"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {stats
              ? (fr
                  ? `Utilisé par ${fmt(stats.usersTotal, locale)}+ producteurs. Regarde de vrais créateurs partager comment ils utilisent vvault pour envoyer, tracker et convertir.`
                  : `Used by ${fmt(stats.usersTotal, locale)}+ producers. Watch real creators share how they use vvault to send, track, and convert.`)
              : (fr
                  ? "Regarde de vrais créateurs partager comment ils utilisent vvault pour envoyer, tracker et convertir."
                  : "Watch real creators share how they use vvault to send, track, and convert.")}
          </p>
        </Reveal>

        {/* Featured testimonial video */}
        <Reveal className="mt-16">
          <h2 className="text-xl font-medium text-white sm:text-2xl">
            {fr ? "Avis à la une" : "Featured Review"}
          </h2>
          <p className="mt-2 text-[14px] text-white/40">
            {fr ? "Un walkthrough complet par un vrai utilisateur de vvault." : "A full walkthrough from a real vvault user."}
          </p>
          <div className="mt-6 aspect-video overflow-hidden rounded-2xl">
            <iframe
              src={testimonialVideoUrl}
              className="h-full w-full"
              allowFullScreen
              title={content.pricingUi.testimonialVideoTitle}
            />
          </div>
        </Reveal>

        {/* Sponsored / community videos */}
        <section id="videos" className="mt-24">
          <Reveal>
            <h2 className="text-xl font-medium text-white sm:text-2xl">
              {fr ? "Vidéos de la communauté" : "Community Videos"}
            </h2>
            <p className="mt-2 text-[14px] text-white/40">
              {fr ? "Highlights de campagnes et reviews de créateurs qui utilisent vvault." : "Campaign highlights and reviews from creators using vvault."}
            </p>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {sponsoredVideos.map((video, i) => (
              <Reveal key={i} delayMs={i * 60}>
                <div className="aspect-video overflow-hidden rounded-2xl">
                  <iframe
                    src={video.url}
                    className="h-full w-full"
                    allowFullScreen
                    title={video.title}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Stats / social proof */}
        <section id="wall-of-love" className="mt-24">
          <Reveal>
            <h2 className="text-xl font-medium text-white sm:text-2xl">
              {fr ? "vvault en chiffres" : "vvault in numbers"}
            </h2>
            <p className="mt-2 text-[14px] text-white/40">
              {fr ? "Données d'utilisation réelles de la plateforme." : "Real usage data from the platform."}
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {numberItems
              ? numberItems.map((item, i) => (
                  <Reveal key={i} delayMs={i * 40}>
                    <div
                      className="rounded-2xl p-6 text-center"
                      style={{
                        border: "1px solid rgba(255,255,255,0.04)",
                        background: "rgba(255,255,255,0.01)",
                      }}
                    >
                      <p className="text-2xl font-semibold tabular-nums text-white">
                        {item.stat}
                      </p>
                      <p className="mt-1.5 text-[13px] text-white/40">
                        {item.label}
                      </p>
                    </div>
                  </Reveal>
                ))
              : Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-6 text-center"
                    style={{
                      border: "1px solid rgba(255,255,255,0.04)",
                      background: "rgba(255,255,255,0.01)",
                    }}
                  >
                    <p className="text-2xl font-semibold text-white/30 animate-pulse">
                      &hellip;
                    </p>
                    <p className="mt-1.5 text-[13px] text-white/20 animate-pulse">
                      {fr ? "Chargement" : "Loading"}
                    </p>
                  </div>
                ))}
          </div>
        </section>

        {/* What producers say */}
        <section id="what-producers-say" className="mt-24">
          <Reveal>
            <h2 className="text-xl font-medium text-white sm:text-2xl">
              {fr ? "Ce que les producteurs nous disent" : "What producers say"}
            </h2>
            <p className="mt-2 text-[14px] text-white/40">
              {fr
                ? "Quelques retours récurrents qu'on entend des beatmakers qui sont passés à vvault pour gérer leurs envois et leurs ventes."
                : "Recurring feedback we hear from beatmakers who switched to vvault to manage their sends and sales."}
            </p>
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6">
                <p className="text-[14.5px] leading-relaxed text-white/70">
                  {fr
                    ? "« Avant vvault j'envoyais mes beats par WeTransfer sans savoir si quelqu'un les écoutait. Maintenant je vois qui ouvre, qui play, qui revient. Je sais sur qui relancer. »"
                    : "\u201CBefore vvault I was sending beats through WeTransfer with no idea if anyone listened. Now I see who opens, who plays, who comes back. I know who to follow up with.\u201D"}
                </p>
                <p className="mt-4 text-[12.5px] text-white/35">
                  {fr ? "— Producteur indépendant" : "\u2014 Independent producer"}
                </p>
              </div>
            </Reveal>
            <Reveal delayMs={80}>
              <div className="h-full rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6">
                <p className="text-[14.5px] leading-relaxed text-white/70">
                  {fr
                    ? "« J'ai uploadé 200 beats en une après-midi avec l'app Mac. Le drag & drop depuis Logic Pro est instantané et les tags sont auto-détectés. Énorme gain de temps. »"
                    : "\u201CI uploaded 200 beats in one afternoon with the Mac app. Drag and drop from Logic Pro is instant and tags get auto-detected. Massive time-saver.\u201D"}
                </p>
                <p className="mt-4 text-[12.5px] text-white/35">
                  {fr ? "— Beatmaker hip-hop" : "\u2014 Hip-hop beatmaker"}
                </p>
              </div>
            </Reveal>
            <Reveal delayMs={160}>
              <div className="h-full rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6">
                <p className="text-[14.5px] leading-relaxed text-white/70">
                  {fr
                    ? "« 0% de frais sur les ventes Ultra, c'est ce qui m'a convaincu de quitter BeatStars. Sur 1500€ de ventes ce mois-ci, je garde tout. »"
                    : "\u201C0% fees on Ultra sales is what made me leave BeatStars. On $1,500 in sales this month, I keep all of it.\u201D"}
                </p>
                <p className="mt-4 text-[12.5px] text-white/35">
                  {fr ? "— Producteur trap" : "\u2014 Trap producer"}
                </p>
              </div>
            </Reveal>
            <Reveal delayMs={240}>
              <div className="h-full rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6">
                <p className="text-[14.5px] leading-relaxed text-white/70">
                  {fr
                    ? "« J'ai importé 800 contacts depuis mon Gmail en 30 secondes. Première campagne envoyée le lendemain, deux placements signés dans la semaine. »"
                    : "\u201CI imported 800 contacts from my Gmail in 30 seconds. First campaign went out the next day, two placements signed within the week.\u201D"}
                </p>
                <p className="mt-4 text-[12.5px] text-white/35">
                  {fr ? "— Producteur R&B" : "\u2014 R&B producer"}
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Why producers choose vvault */}
        <section className="mt-24">
          <Reveal>
            <h2 className="text-xl font-medium text-white sm:text-2xl">
              {fr ? "Pourquoi les producteurs choisissent vvault" : "Why producers choose vvault"}
            </h2>
            <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-white/45">
              {fr
                ? "vvault remplace trois ou quatre outils qu'utilisent les beatmakers chaque semaine : un service de transfert pour envoyer les beats, un outil d'emailing pour les campagnes, une marketplace pour les ventes, et un tableur pour gérer les contacts. En centralisant tout, on rend le tracking précis et la conversion mesurable, et on supprime les frais de marketplace qui rongent les revenus."
                : "vvault replaces three or four tools beatmakers use every week: a file-transfer service for sending beats, an email tool for campaigns, a marketplace for sales, and a spreadsheet to manage contacts. By centralizing everything, we make tracking precise, conversion measurable, and remove the marketplace fees that eat into producer revenue."}
            </p>
          </Reveal>
        </section>

        {/* CTA */}
        <Reveal className="mt-24">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-white sm:text-3xl">
              {fr ? "Rejoins la communauté" : "Join the community"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {stats
                ? (fr
                    ? `Inscris-toi gratuitement et découvre pourquoi ${fmt(stats.usersTotal, locale)}+ producteurs font confiance à vvault chaque jour.`
                    : `Sign up for free and see why ${fmt(stats.usersTotal, locale)}+ producers trust vvault every day.`)
                : (fr
                    ? "Inscris-toi gratuitement et commence à envoyer dès aujourd'hui."
                    : "Sign up for free and start sending today.")}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <a
                href="https://vvault.app/signup"
                className="inline-flex items-center rounded-xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
              >
                {fr ? "Commencer gratuitement" : "Start for free"}
              </a>
              <a
                href="https://discord.gg/QGGEZR5KhB"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-2xl bg-white/[0.06] px-6 py-2.5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-white/[0.1]"
              >
                {fr ? "Rejoindre Discord" : "Join Discord"}
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
