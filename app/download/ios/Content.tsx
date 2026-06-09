"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LoopingVideo } from "@/components/landing/LoopingVideo";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

const APPSTORE_URL = "https://apps.apple.com/app/id6759256796";

export default function DownloadIOSPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);
  const fr = locale === "fr";

  useEffect(() => {
    document.title = "Download vvault for iPhone";
  }, []);

  return (
    <div className="landing-root min-h-screen bg-[rgb(var(--bg))] font-sans text-[rgb(var(--fg))]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      <main className="relative pb-32">
        <div className="mx-auto w-full max-w-[clamp(1320px,92vw,2400px)] px-4 pt-[140px] sm:px-8 sm:pt-48 lg:px-10">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-center lg:gap-[clamp(3.5rem,7vw,8.5rem)]">
            {/* LEFT — headline, subhead, App Store button */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h1 className="font-display text-[2.4rem] font-normal leading-[1.05] tracking-tight text-[rgb(var(--fg))] sm:text-[2.6rem] lg:text-[2.75rem]">
                {fr ? "vvault, dans ta poche." : "vvault, in your pocket."}
              </h1>

              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-[rgb(var(--fg)_/_0.55)]">
                {fr
                  ? "Envoie, vends et suis tes beats depuis n'importe où. Gratuit sur l'App Store."
                  : "Send, sell and track your beats from anywhere. Free on the App Store."}
              </p>

              <a
                href={APPSTORE_URL}
                target="_blank"
                rel="noreferrer"
                data-track-id="download.app_store"
                className="mt-9 inline-flex items-center justify-center gap-2.5 rounded-full bg-[rgb(var(--inv))] px-6 py-4 text-[16px] font-semibold text-[rgb(var(--inv-fg))] transition-colors duration-200 hover:opacity-90"
              >
                <svg viewBox="0 0 384 512" className="h-5 w-5 -translate-y-px" fill="currentColor" aria-hidden="true">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                {fr ? "Télécharger sur l'App Store" : "Download on the App Store"}
              </a>
            </div>

            {/* RIGHT — big iPhone playing the app video */}
            <div className="w-full max-w-[440px] lg:w-[min(40vw,560px)] lg:max-w-none lg:shrink-0">
              <div className="relative mx-auto aspect-[420/856] w-[clamp(240px,70vw,320px)] overflow-hidden rounded-[44px] bg-[rgb(var(--ov)_/_0.04)] [outline:2px_solid_rgb(var(--ov)/0.16)]">
                <LoopingVideo
                  src="/landing/features/phone"
                  poster="/landing/features/phone.webp"
                  className="absolute inset-0 block h-full w-full object-cover rounded-[44px]"
                  eager
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter locale={locale} content={content} />
    </div>
  );
}
