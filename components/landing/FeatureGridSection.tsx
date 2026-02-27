"use client";

import { landingContent } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";

export function FeatureGridSection() {
  return (
    <section id="product" className="pt-14 sm:pt-20">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="max-w-[900px]">
            <h2 className="font-display text-3xl leading-tight text-white sm:text-5xl">
              Built for inbox operations, not inbox chaos.
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {landingContent.features.map((feature, index) => (
            <Reveal key={feature.title} delayMs={index * 34}>
              <article className="landing-panel rounded-[18px] border border-white/10 bg-transparent p-5 transition-transform duration-200 hover:-translate-y-[2px]">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/12 bg-transparent text-xs text-white/50">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white/90">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{feature.description}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.1em] text-white/48">{feature.stat}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
