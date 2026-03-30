"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";

type FeaturePageShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  docTitle?: string;
};

export function FeaturePageShell({
  title,
  subtitle,
  children,
  docTitle,
}: FeaturePageShellProps) {
  const content = getLandingContent("en");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (docTitle) document.title = docTitle;
  }, [docTitle]);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale="en" content={content} showPrimaryLinks={true} />

      <main className="relative z-10 mx-auto max-w-[720px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">
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
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {subtitle}
          </p>
        </Reveal>

        <div className="mt-16 sm:mt-20">{children}</div>
      </main>

      <LandingFooter
        locale="en"
        content={content}
        showColumns={false}
        inlineLegalWithBrand
      />
    </div>
  );
}
