"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";

export default function DocsPage() {
  const content = getLandingContent("en");
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "vvault | Documentation";
  }, []);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale="en" content={content} showPrimaryLinks={true} />
      <main className="relative z-10 mx-auto max-w-[720px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">
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
            Documentation
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            Coming soon.
          </p>
        </Reveal>

        {/* Placeholder */}
        <Reveal delayMs={100}>
          <div className="mt-16 text-center">
            <p className="mx-auto max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              We&apos;re working on comprehensive documentation. In the meantime, visit our Help
              Center or join our Discord community.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/help"
                className="inline-flex items-center rounded-full bg-white/[0.08] px-6 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/[0.12] sm:text-[14px]"
              >
                Help Center
              </Link>
              <a
                href="https://discord.gg/QGGEZR5KhB"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-6 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/[0.12] sm:text-[14px]"
              >
                Discord
                <svg
                  className="h-3 w-3 text-white/30"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3.5 1.5h7v7M10.5 1.5L1.5 10.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </Reveal>
      </main>
      <LandingFooter locale="en" content={content} showColumns={false} inlineLegalWithBrand />
    </div>
  );
}
