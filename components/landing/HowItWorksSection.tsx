"use client";

import { landingContent } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="pt-40 sm:pt-56">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="grid gap-8 py-14 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <h2 className="font-display text-3xl leading-tight text-white sm:text-5xl">
              Move every release through a clear operating path.
            </h2>
            <p className="max-w-[620px] text-base leading-7 text-white/26 sm:text-lg">
              vvault keeps the workflow readable: upload, package, distribute, track, and monetize. Every action
              stays attached to the same content and contact history.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4">
          {landingContent.howItWorks.map((step, index) => (
            <Reveal key={step.title} delayMs={index * 36}>
              <article className="landing-panel h-full rounded-[18px] border border-white/10 bg-transparent p-4 sm:p-5">
                <div className="grid gap-4 md:grid-cols-[1fr_260px] md:items-center">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">Step {index + 1}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white/90">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/58">{step.description}</p>
                    <div className="mt-4 rounded-xl border border-white/10 bg-transparent px-3 py-2.5 text-xs leading-5 text-white/56">
                      {step.detail}
                    </div>
                  </div>

                  <div className="relative h-28 overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))]">
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-[0.14em] text-white/45">
                      Step image placeholder
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0e0e0e] to-transparent" />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
