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
  "https://drive.google.com/uc?export=download&id=1whlyYxL4aAEp-jIdn7m3SUeKO-3oBHeq";
const WINDOWS_URL =
  "https://drive.google.com/uc?export=download&id=1-Lmqxkx1q9xBnrkfLW5y7qQoRmq8INvf";
const APPSTORE_URL = "https://apps.apple.com/app/id6759256796";

function useIsMac() {
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(!/Win/i.test(navigator.userAgent));
  }, []);
  return isMac;
}

const downloadIcon = (
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
);

const buttonStyle = {
  boxShadow:
    "0 4px 24px 0 rgba(255,255,255,0.10), 0 1px 4px 0 rgba(255,255,255,0.06)",
  maskImage:
    "linear-gradient(to bottom, black 60%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, black 60%, transparent 100%)",
} as const;

export default function DownloadPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);
  const isMac = useIsMac();
  const fr = locale === "fr";

  // Order: user's platform first
  const macButton = (
    <a
      href={MACOS_URL}
      className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-6 py-3 text-[15px] font-semibold text-[#0e0e0e] transition-all duration-200 hover:bg-white/90"
      style={buttonStyle}
    >
      {downloadIcon}
      {fr ? "Télécharger pour macOS" : "Download for macOS"}
    </a>
  );

  const winButton = (
    <a
      href={WINDOWS_URL}
      className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-6 py-3 text-[15px] font-semibold text-[#0e0e0e] transition-all duration-200 hover:bg-white/90"
      style={buttonStyle}
    >
      {downloadIcon}
      {fr ? "Télécharger pour Windows" : "Download for Windows"}
    </a>
  );

  const iosButton = (
    <a
      href={APPSTORE_URL}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-6 py-3 text-[15px] font-semibold text-[#0e0e0e] transition-all duration-200 hover:bg-white/90"
      style={buttonStyle}
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
      </svg>
      {fr ? "Télécharger sur l'App Store" : "Download on App Store"}
    </a>
  );

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

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
          <div className="mb-8 flex items-center justify-center">
            <Image
              src="/vvault-iOS-Default-1024x1024@1x.png"
              alt="vvault app icon"
              width={96}
              height={96}
              className="rounded-[22px] shadow-2xl shadow-black/60"
            />
          </div>

          <h1
            className="text-center font-display text-4xl font-semibold sm:text-5xl lg:text-6xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {fr ? "Télécharger vvault" : "Download vvault"}
          </h1>

          <p className="mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/50 sm:text-base">
            {fr
              ? "Disponible sur macOS, Windows et iOS. Importe, envoie et suis ta musique depuis n'importe quel appareil."
              : "Available on macOS, Windows, and iOS. Upload, send, and track your music from any device."}
          </p>

          <span className="mt-4 rounded-full bg-white/[0.06] px-3 py-1 text-[12px] font-medium text-white/40">
            v0.1.0
          </span>

          {/* Download buttons — all three, user's platform first */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            {isMac ? (
              <>
                {macButton}
                {winButton}
              </>
            ) : (
              <>
                {winButton}
                {macButton}
              </>
            )}
            {iosButton}
          </div>
        </div>
      </main>

      <LandingFooter locale={locale} content={content} />
    </div>
  );
}
