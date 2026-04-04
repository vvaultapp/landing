"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

const Plasma = dynamic(() => import("@/components/landing/Plasma"), {
  ssr: false,
});

const MACOS_URL =
  "https://drive.google.com/drive/folders/17xVBvBqpaKViPEyrEAXw9MyADMpEPH3x?usp=sharing";
const WINDOWS_URL =
  "https://drive.google.com/drive/folders/17xVBvBqpaKViPEyrEAXw9MyADMpEPH3x?usp=sharing";

function useIsMac() {
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(!/Win/i.test(navigator.userAgent));
  }, []);
  return isMac;
}

export default function DownloadPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);
  const isMac = useIsMac();
  const fr = locale === "fr";

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      {/* Plasma hero background — white accent */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-screen"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.55] max-lg:opacity-[0.2]">
          <Plasma
            color="#ffffff"
            speed={0.3}
            direction="forward"
            scale={1.2}
            opacity={0.5}
            mouseInteractive={false}
          />
        </div>
      </div>

      <main className="relative z-10 pb-32 pt-40 sm:pt-48">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center px-5 sm:px-8 lg:px-10">
          {/* App icon */}
          <div className="mb-8 flex items-center justify-center">
            <Image
              src="/vvault-iOS-Default-1024x1024@1x.png"
              alt="vvault app icon"
              width={96}
              height={96}
              className="rounded-[22px] shadow-2xl shadow-black/60"
            />
          </div>

          {/* Title */}
          <h1
            className="text-center font-display text-4xl font-semibold sm:text-5xl lg:text-6xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {fr ? "Telecharge vvault" : "Download vvault"}
          </h1>

          <p className="mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/50 sm:text-base">
            {fr
              ? "Disponible sur macOS et Windows. Importe, envoie et suis ta musique depuis ton bureau."
              : "Available on macOS and Windows. Upload, send, and track your music from your desktop."}
          </p>

          {/* Version badge */}
          <span className="mt-4 rounded-full bg-white/[0.06] px-3 py-1 text-[12px] font-medium text-white/40">
            v0.1.0
          </span>

          {/* Download buttons */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            {/* Primary button — based on platform */}
            <a
              href={isMac ? MACOS_URL : WINDOWS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
              style={{
                border: "1px solid rgba(0,0,0,0.1)",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.06)",
              }}
            >
              {/* Download icon */}
              <svg
                viewBox="0 0 20 20"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 17h12" />
              </svg>
              {isMac
                ? fr
                  ? "Telecharger pour macOS"
                  : "Download for macOS"
                : fr
                  ? "Telecharger pour Windows"
                  : "Download for Windows"}
            </a>

            {/* Secondary button — the other platform */}
            <a
              href={isMac ? WINDOWS_URL : MACOS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 rounded-xl px-6 py-3 text-[15px] font-medium text-white/50 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white/70"
            >
              <svg
                viewBox="0 0 20 20"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 17h12" />
              </svg>
              {isMac
                ? fr
                  ? "Telecharger pour Windows"
                  : "Download for Windows"
                : fr
                  ? "Telecharger pour macOS"
                  : "Download for macOS"}
            </a>
          </div>

          {/* System requirements */}
          <div className="mt-20 grid w-full max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
            {/* macOS */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-white/40">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
                </svg>
                <h3 className="text-[14px] font-semibold text-white/70">macOS</h3>
              </div>
              <p className="mt-2 text-[13px] text-white/35">
                {fr ? "macOS 12 Monterey ou plus recent" : "macOS 12 Monterey or later"}
              </p>
              <p className="mt-1 text-[13px] text-white/35">
                Apple Silicon & Intel
              </p>
            </div>

            {/* Windows */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-white/40">
                  <path d="M3 5.548l7.286-1.004v7.03H3V5.548zm0 12.904l7.286 1.004v-6.88H3v5.876zm8.143 1.129L21 21v-7.424h-9.857v6.005zM21 3L11.143 4.424v5.95H21V3z" />
                </svg>
                <h3 className="text-[14px] font-semibold text-white/70">Windows</h3>
              </div>
              <p className="mt-2 text-[13px] text-white/35">
                Windows 10 {fr ? "ou plus recent" : "or later"}
              </p>
              <p className="mt-1 text-[13px] text-white/35">
                64-bit (x64)
              </p>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter locale={locale} content={content} />
    </div>
  );
}
