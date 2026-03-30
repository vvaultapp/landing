"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";

const contactCards = [
  {
    title: "Discord",
    description: "Join our community. Ask questions, share feedback, and connect with other producers.",
    href: "https://discord.gg/QGGEZR5KhB",
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
        <path
          fill="currentColor"
          d="M20.156725 4.427875c-1.5212 -0.711725 -3.147725 -1.228975 -4.848225 -1.523525 -0.20885 0.377575 -0.452825 0.885425 -0.62105 1.289425 -1.807675 -0.27185 -3.598725 -0.27185 -5.37315 0 -0.168175 -0.404 -0.417725 -0.91185 -0.628425 -1.289425 -1.702325 0.29455 -3.33075 0.8137 -4.851925 1.5273C0.76567 9.0682 -0.066086 13.5896 0.3497925 18.046775c2.0350375 1.519725 4.0072325 2.4429 5.9461575 3.047 0.478725 -0.658875 0.905675 -1.35925 1.2735 -2.0974 -0.700525 -0.266175 -1.371475 -0.594675 -2.00545 -0.976 0.1682 -0.124625 0.332725 -0.254875 0.49165 -0.388925 3.86675 1.808575 8.068075 1.808575 11.8886 0 0.160825 0.13405 0.3253 0.2643 0.49165 0.388925 -0.635825 0.3832 -1.3086 0.711675 -2.009125 0.9779 0.3678 0.73625 0.792925 1.43855 1.2735 2.097375 1.940775 -0.6041 3.9148 -1.52725 5.94985 -3.048875 0.487975 -5.167025 -0.8336 -9.646875 -3.4934 -13.6189Zm-12.0605 10.877775c-1.16075 0 -2.112675 -1.08365 -2.112675 -2.40325 0 -1.3196 0.9316 -2.4051 2.112675 -2.4051 1.181125 0 2.133 1.0836 2.112675 2.4051 0.00185 1.3196 -0.93155 2.40325 -2.112675 2.40325Zm7.80745 0c-1.16075 0 -2.112675 -1.08365 -2.112675 -2.40325 0 -1.3196 0.931575 -2.4051 2.112675 -2.4051 1.1811 0 2.133 1.0836 2.112675 2.4051 0 1.3196 -0.931575 2.40325 -2.112675 2.40325Z"
        />
      </svg>
    ),
  },
  {
    title: "Instagram",
    description: "Follow us for updates, tips, and behind-the-scenes content.",
    href: "https://instagram.com/vvault.app",
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
        <path
          fill="currentColor"
          d="M11.999975 2.36716c3.1374 0 3.509 0.01194 4.747975 0.06847 1.145625 0.052285 1.767775 0.243695 2.181875 0.40457 0.5484 0.21315 0.939875 0.467825 1.351 0.878975 0.41115 0.411125 0.665825 0.8026 0.878925 1.351 0.160925 0.4141 0.352325 1.03625 0.404625 2.181825 0.056525 1.239025 0.068475 1.610625 0.068475 4.748025 0 3.1374 -0.01195 3.509 -0.068475 4.747975 -0.0523 1.145625 -0.2437 1.767775 -0.404625 2.18185 -0.2131 0.548425 -0.467775 0.939875 -0.878925 1.351025 -0.411125 0.41115 -0.8026 0.665825 -1.351 0.878925 -0.4141 0.160925 -1.03625 0.352325 -2.181875 0.404625 -1.2388 0.056525 -1.610375 0.06845 -4.747975 0.06845 -3.137575 0 -3.509175 -0.011925 -4.747975 -0.06845 -1.145625 -0.0523 -1.767775 -0.2437 -2.181825 -0.404625 -0.54845 -0.2131 -0.9399 -0.467775 -1.35105 -0.878925 -0.41115 -0.41115 -0.665825 -0.8026 -0.878925 -1.351025 -0.160925 -0.414075 -0.3523325 -1.036225 -0.4046175 -2.1818 -0.05653 -1.239025 -0.06847 -1.610625 -0.06847 -4.748025 0 -3.1374 0.01194 -3.509 0.06847 -4.747975 0.052285 -1.145625 0.2436925 -1.767775 0.4046175 -2.181875 0.2131 -0.5484 0.467775 -0.939875 0.878925 -1.351 0.41115 -0.41115 0.8026 -0.665825 1.35105 -0.878975 0.41405 -0.160875 1.0362 -0.352285 2.181775 -0.40457 1.239025 -0.05653 1.610625 -0.06847 4.748025 -0.06847Zm0 -2.11716c-3.191125 0 -3.591225 0.013525 -4.844475 0.07071 -1.2507 0.0570875 -2.1048 0.2556875 -2.85225 0.5461725 -0.77265 0.30028 -1.427925 0.7020525 -2.081145 1.3552675 -0.6532175 0.653225 -1.05499 1.308475 -1.3552675 2.08115 -0.290485 0.747425 -0.489085 1.60155 -0.546175 2.852225C0.26348 8.40875 0.25 8.8089 0.25 12.000025s0.01348 3.591275 0.0706625 4.844475c0.05709 1.2507 0.25569 2.1048 0.546175 2.85225 0.3002775 0.7726 0.70205 1.427925 1.3552675 2.08115 0.65322 0.6532 1.308495 1.054975 2.081145 1.355275 0.74745 0.290475 1.60155 0.489075 2.85225 0.546175 1.25325 0.057175 1.65335 0.07065 4.844475 0.07065s3.591275 -0.013475 4.8445 -0.07065c1.250675 -0.0571 2.1048 -0.2557 2.852225 -0.546175 0.772675 -0.3003 1.427925 -0.702075 2.08115 -1.355275 0.653225 -0.653225 1.054975 -1.3085 1.355275 -2.08115 0.290475 -0.74745 0.489075 -1.60155 0.546175 -2.85225 0.057175 -1.2532 0.0707 -1.65335 0.0707 -4.844475s-0.013525 -3.591275 -0.0707 -4.8445c-0.0571 -1.250675 -0.2557 -2.1048 -0.546175 -2.852225 -0.3003 -0.772675 -0.70205 -1.427925 -1.355275 -2.08115 -0.653225 -0.653215 -1.308475 -1.0549875 -2.08115 -1.3552675 -0.747425 -0.290485 -1.60155 -0.489085 -2.852225 -0.5461725C15.59125 0.263525 15.1911 0.25 11.999975 0.25Zm0 5.716225c-3.33235 0 -6.0338 2.701425 -6.0338 6.0338 0 3.33235 2.70145 6.0338 6.0338 6.0338 3.332375 0 6.0338 -2.70145 6.0338 -6.0338 0 -3.332375 -2.701425 -6.0338 -6.0338 -6.0338Zm0 9.9505c-2.1631 0 -3.9167 -1.7536 -3.9167 -3.9167s1.7536 -3.9167 3.9167 -3.9167 3.9167 1.7536 3.9167 3.9167 -1.7536 3.9167 -3.9167 3.9167Zm7.682175 -10.1889c0 0.77875 -0.63125 1.410025 -1.409975 1.410025 -0.77875 0 -1.410025 -0.631275 -1.410025 -1.410025 0 -0.778725 0.631275 -1.409975 1.410025 -1.409975 0.778725 0 1.409975 0.63125 1.409975 1.409975Z"
        />
      </svg>
    ),
  },
  {
    title: "Email",
    description: "Send us an email. We typically respond within 24 hours.",
    href: "mailto:vvaultapp@gmail.com",
    external: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  const content = getLandingContent("en");
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "vvault | Contact Us";
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
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            We&apos;d love to hear from you.
          </p>
        </Reveal>

        {/* Contact Cards */}
        <div className="mt-16 space-y-4">
          {contactCards.map((card, i) => (
            <Reveal key={i} delayMs={i * 80}>
              <a
                href={card.href}
                target={card.external ? "_blank" : undefined}
                rel={card.external ? "noopener noreferrer" : undefined}
                className="group block rounded-2xl p-6 transition-[filter] duration-200 hover:brightness-125"
                style={{
                  border: "1px solid rgba(255,255,255,0.04)",
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-white/50">
                    {card.icon}
                  </div>
                  <div>
                    <h2 className="text-[15px] font-medium text-white/80 sm:text-[16px]">
                      {card.title}
                      {card.external && (
                        <svg
                          className="ml-1.5 inline-block h-3 w-3 text-white/30"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M3.5 1.5h7v7M10.5 1.5L1.5 10.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </h2>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/35 sm:text-[14px]">
                      {card.description}
                    </p>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </main>
      <LandingFooter locale="en" content={content} showColumns={false} inlineLegalWithBrand />
    </div>
  );
}
