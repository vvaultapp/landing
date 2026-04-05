"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

const Plasma = dynamic(() => import("@/components/landing/Plasma"), {
  ssr: false,
});

const WINDOWS_URL =
  "/api/download/windows";

export default function DownloadWindowsPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);
  const fr = locale === "fr";

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
            {fr ? "vvault pour Windows" : "vvault for Windows"}
          </h1>

          <p className="mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/50 sm:text-base">
            {fr
              ? "Importe, envoie et suis ta musique depuis ton PC."
              : "Upload, send, and track your music from your PC."}
          </p>

          <span className="mt-4 rounded-full bg-white/[0.06] px-3 py-1 text-[12px] font-medium text-white/40">
            v0.1.0
          </span>

          <div className="mt-10 flex flex-col items-center gap-3">
            <a
              href={WINDOWS_URL}
              className="inline-flex items-center gap-2.5 rounded-2xl px-6 py-3 text-[15px] font-semibold text-[#0e0e0e] transition-all duration-200 hover:opacity-90"
              style={{
                background: "linear-gradient(to bottom, #ffffff 0%, #d4d4d4 100%)",
                boxShadow:
                  "0 4px 24px 0 rgba(255,255,255,0.10), 0 1px 4px 0 rgba(255,255,255,0.06)",
              }}
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
              {fr ? "Télécharger pour Windows" : "Download for Windows"}
            </a>
          </div>

          {/* System requirements */}
          <div className="mt-20 w-full max-w-sm">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-white/40">
                  <path d="M3 12V6.5l8-1.1V12H3zm9-6.8V12h9V3L12 5.2zM12 13v6.7L21 22v-9H12zm-1 0H3v5.5l8 1.1V13z" />
                </svg>
                <h3 className="text-[14px] font-semibold text-white/70">Windows</h3>
              </div>
              <p className="mt-2 text-[13px] text-white/35">
                Windows 10 {fr ? "ou plus récent" : "or later"}
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
