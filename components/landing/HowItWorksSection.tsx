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

        <div className="mt-10 grid gap-4 lg:grid-cols-5">
          {landingContent.howItWorks.map((step, index) => (
            <Reveal key={step.title} delayMs={index * 36}>
              <article className="landing-panel h-full rounded-[18px] border border-white/10 bg-transparent p-4 sm:p-5">
                <div className="mb-4">
                  <span className="rounded-md border border-white/12 bg-transparent px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-white/50">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white/90">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{step.description}</p>
                <div className="mt-4 rounded-xl border border-white/10 bg-transparent px-3 py-2.5 text-xs leading-5 text-white/56">
                  {step.detail}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
