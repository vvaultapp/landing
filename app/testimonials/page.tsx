"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";

export default function TestimonialsPage() {
  const content = getLandingContent("en");
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "vvault | Testimonials";
  }, []);

  const sponsoredVideos = content.pricingUi.sponsoredVideos;
  const testimonialVideoUrl = content.pricingUi.testimonialVideoUrl;

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale="en" content={content} showPrimaryLinks={true} />
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
            They talk about us
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            Used daily by 600+ producers. Watch real creators share how they use
            vvault to send, track, and convert.
          </p>
        </Reveal>

        {/* Featured testimonial video */}
        <Reveal className="mt-16">
          <h2 className="text-xl font-medium text-white sm:text-2xl">
            Featured Review
          </h2>
          <p className="mt-2 text-[14px] text-white/40">
            A full walkthrough from a real vvault user.
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
              Community Videos
            </h2>
            <p className="mt-2 text-[14px] text-white/40">
              Campaign highlights and reviews from creators using vvault.
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
              vvault in numbers
            </h2>
            <p className="mt-2 text-[14px] text-white/40">
              Real usage data from the platform.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { stat: "600+", label: "Producers using vvault daily" },
              { stat: "1,355+", label: "Artists and beatmakers on the platform" },
              { stat: "3", label: "Plans to fit every stage" },
              { stat: "6", label: "Video reviews and counting" },
              { stat: "0%", label: "Marketplace fees on Ultra" },
              { stat: "100%", label: "Free to start, no credit card" },
            ].map((item, i) => (
              <Reveal key={i} delayMs={i * 40}>
                <div
                  className="rounded-2xl p-6 text-center"
                  style={{
                    border: "1px solid rgba(255,255,255,0.04)",
                    background: "rgba(255,255,255,0.01)",
                  }}
                >
                  <p className="text-2xl font-semibold text-white">
                    {item.stat}
                  </p>
                  <p className="mt-1.5 text-[13px] text-white/40">
                    {item.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Reveal className="mt-24">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-white sm:text-3xl">
              Join the community
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              Sign up for free and see why 600+ producers trust vvault every
              day.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <a
                href="https://vvault.app/signup"
                className="inline-flex items-center rounded-2xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
              >
                Start for free
              </a>
              <a
                href="https://discord.gg/QGGEZR5KhB"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-2xl bg-white/[0.06] px-6 py-2.5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-white/[0.1]"
              >
                Join Discord
              </a>
            </div>
          </div>
        </Reveal>
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
