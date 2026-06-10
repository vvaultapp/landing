"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { LoopingVideo } from "@/components/landing/LoopingVideo";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

/* ─────────────────────────────────────────────────────────────
   Shared feature-page shell. Every feature page is pure DATA
   (FeaturePageData) rendered through this one component: a black
   headline, one short line, pill buttons, and ONE real product
   clip — no eyebrow, no glow, no fake UIs, no outlined frame.
   ───────────────────────────────────────────────────────────── */

type Copy = { en: string; fr: string };
const t = (c: Copy, locale: string) => (locale === "fr" ? c.fr : c.en);

export type FeatureMedia = "phone" | "wide" | "square";

export type FeaturePageData = {
  /** data-track-id prefix, e.g. "features_analytics" */
  track: string;
  docTitle: Copy;
  title: Copy;
  subtitle: Copy;
  /** video base path (no extension), e.g. "/landing/features/analytics" */
  video: string;
  /** exact intrinsic aspect of the clip, e.g. "1280 / 2610" — the frame
      matches it so the video fills edge-to-edge (no letterbox, no still
      photo peeking out behind it). */
  aspect: string;
  /** docs-style copy blocks shown under the clip */
  sections: { title: Copy; body: Copy }[];
  whyTitle: Copy;
  why: { title: Copy; desc: Copy }[];
  finalTitle: Copy;
  finalSubtitle: Copy;
  /** primary CTA → app signup */
  ctaLabel: Copy;
  ctaHref: string;
  /** legacy/optional — no longer rendered */
  eyebrow?: Copy;
  media?: FeatureMedia;
  poster?: string;
};

/* pill button base — matches the hero CTAs */
const PILL =
  "inline-flex items-center justify-center rounded-full px-7 py-3 text-[14px] font-semibold";

function AppleGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" className={className} fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

export function FeaturePage({ data }: { data: FeaturePageData }) {
  const [locale] = useLocale();
  const content = getLandingContent(locale);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = t(data.docTitle, locale);
  }, [locale, data.docTitle]);

  // Constrain width by orientation so tall phone clips don't dominate.
  const ratio = (() => {
    const [w, h] = data.aspect.split("/").map((n) => parseFloat(n));
    return h ? w / h : 1.6;
  })();
  const maxW = ratio < 0.9 ? "380px" : ratio < 1.7 ? "760px" : "960px";

  const IPhoneCta = ({ id }: { id: string }) => (
    <a
      href="/download/ios"
      data-track-id={id}
      className={`${PILL} gap-2 border border-[rgb(var(--ov)_/_0.16)] text-[rgb(var(--fg))] hover:bg-[rgb(var(--ov)_/_0.05)]`}
    >
      <AppleGlyph className="h-[15px] w-[15px] -translate-y-px" />
      {locale === "fr" ? "Télécharger sur iPhone" : "Download on iPhone"}
    </a>
  );

  return (
    <div className="landing-root min-h-screen bg-[rgb(var(--bg))] font-sans text-[rgb(var(--fg))]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      <main className="relative z-10 mx-auto max-w-[760px] px-5 pb-32 pt-32 sm:px-8 sm:pt-40">
        {/* ── Hero: headline + one short line + pills ── */}
        <Reveal>
          <h1 className="mx-auto max-w-[16ch] text-balance text-center text-[2.2rem] font-semibold leading-[1.04] tracking-[-0.025em] text-[rgb(var(--fg))] sm:text-[3.25rem]">
            {t(data.title, locale)}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-balance text-center text-[16px] leading-relaxed text-[rgb(var(--fg)_/_0.5)] sm:text-[18px]">
            {t(data.subtitle, locale)}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href={data.ctaHref}
              data-track-id={`${data.track}.hero_cta`}
              className={`${PILL} bg-[rgb(var(--inv))] text-[rgb(var(--inv-fg))] hover:opacity-90`}
            >
              {t(data.ctaLabel, locale)}
            </a>
            <IPhoneCta id={`${data.track}.hero_ios`} />
          </div>
        </Reveal>

        {/* ── Primary product clip — rounded, edge-to-edge, no frame ── */}
        <Reveal className="mt-14 sm:mt-16">
          <div
            className="relative mx-auto w-full overflow-hidden rounded-[24px]"
            style={{ aspectRatio: data.aspect, maxWidth: maxW }}
          >
            <LoopingVideo
              src={data.video}
              poster={`${data.video}-poster.webp`}
              eager
              mp4Only
              className="absolute inset-0 h-full w-full object-cover"
              fitOverride=" "
            />
          </div>
        </Reveal>

        {/* ── Docs-style copy ── */}
        {data.sections.map((s, i) => (
          <Reveal key={i} className="mt-20 sm:mt-28">
            <h2 className="mx-auto max-w-[20ch] text-balance text-center text-[1.4rem] font-semibold leading-tight tracking-[-0.015em] text-[rgb(var(--fg))] sm:text-[1.7rem]">
              {t(s.title, locale)}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-center text-[15px] leading-relaxed text-[rgb(var(--fg)_/_0.5)] sm:text-[16px]">
              {t(s.body, locale)}
            </p>
          </Reveal>
        ))}

        {/* ── Why it matters ── */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-[1.4rem] font-semibold tracking-[-0.015em] text-[rgb(var(--fg))] sm:text-[1.7rem]">
            {t(data.whyTitle, locale)}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {data.why.map((item) => (
              <div
                key={item.title.en}
                className="rounded-2xl border border-[rgb(var(--ov)_/_0.08)] bg-[rgb(var(--ov)_/_0.02)] px-5 py-5 hover:bg-[rgb(var(--ov)_/_0.04)]"
              >
                <p className="text-[14px] font-semibold text-[rgb(var(--fg)_/_0.85)]">
                  {t(item.title, locale)}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[rgb(var(--fg)_/_0.45)]">
                  {t(item.desc, locale)}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── Final CTA ── */}
        <Reveal className="mt-28 sm:mt-36">
          <div className="text-center">
            <h2 className="mx-auto max-w-[18ch] text-balance text-2xl font-semibold tracking-[-0.02em] text-[rgb(var(--fg))] sm:text-[2rem]">
              {t(data.finalTitle, locale)}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-balance text-[15px] leading-relaxed text-[rgb(var(--fg)_/_0.5)] sm:text-[16px]">
              {t(data.finalSubtitle, locale)}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={data.ctaHref}
                data-track-id={`${data.track}.final_cta`}
                className={`${PILL} bg-[rgb(var(--inv))] text-[rgb(var(--inv-fg))] hover:opacity-90`}
              >
                {t(data.ctaLabel, locale)}
              </a>
              <IPhoneCta id={`${data.track}.final_ios`} />
            </div>
          </div>
        </Reveal>
      </main>

      <LandingFooter locale={locale} content={content} />
    </div>
  );
}
