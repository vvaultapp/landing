"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";

export default function AboutPage() {
  const content = getLandingContent("en");
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "vvault | About";
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
            About vvault
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            Built by producers, for producers.
          </p>
        </Reveal>

        <div className="mt-20 space-y-16">
          {/* Mission */}
          <Reveal>
            <h2 className="text-xl font-medium text-white sm:text-2xl">Our Mission</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              vvault exists because sending music shouldn&apos;t be a guessing game. For too long,
              producers have relied on blind emails, scattered files, and hope. No way to know if
              anyone listened, no way to follow up intelligently, no way to turn interest into real
              placements.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              We set out to change that. vvault gives every producer the same visibility and tools
              that major labels take for granted — without the complexity or the cost.
            </p>
          </Reveal>

          {/* What We Do */}
          <Reveal>
            <h2 className="text-xl font-medium text-white sm:text-2xl">What We Do</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              vvault is an all-in-one platform that combines file management, email campaigns,
              real-time analytics, CRM, and sales — built specifically for music producers. Upload
              your beats, send targeted campaigns, track who opens and listens, manage your contacts
              and pipeline, and sell licenses directly through your profile or our marketplace.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              Every feature is designed around how producers actually work. From tagging beats with
              BPM and key to scheduling sends at the perfect time, vvault fits naturally into your
              creative workflow.
            </p>
          </Reveal>

          {/* Team */}
          <Reveal>
            <h2 className="text-xl font-medium text-white sm:text-2xl">Our Team</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              We&apos;re a small team of music producers and developers based in France. We
              understand the frustration of sending hundreds of beats into the void because
              we&apos;ve lived it ourselves. That firsthand experience drives every decision we make
              — from the features we build to the way we design our interface.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              We&apos;re passionate about helping independent creators succeed on their own terms,
              without needing a label deal or a marketing budget to get heard.
            </p>
          </Reveal>

          {/* Values */}
          <Reveal>
            <h2 className="text-xl font-medium text-white sm:text-2xl">Our Values</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-[14px] font-medium text-white/70 sm:text-[15px]">
                  Transparency
                </h3>
                <p className="mt-1 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
                  No hidden fees, no shady data practices. You always know what you&apos;re paying
                  for and what happens with your data.
                </p>
              </div>
              <div>
                <h3 className="text-[14px] font-medium text-white/70 sm:text-[15px]">
                  Simplicity
                </h3>
                <p className="mt-1 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
                  Powerful tools don&apos;t have to be complicated. We obsess over making every
                  feature intuitive so you can focus on making music, not learning software.
                </p>
              </div>
              <div>
                <h3 className="text-[14px] font-medium text-white/70 sm:text-[15px]">
                  Creator-First
                </h3>
                <p className="mt-1 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
                  Every decision starts with one question: does this help producers get placements
                  and grow their careers? If the answer isn&apos;t yes, we don&apos;t build it.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
      <LandingFooter locale="en" content={content} showColumns={false} inlineLegalWithBrand />
    </div>
  );
}
