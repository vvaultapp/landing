"use client";

import { landingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";

export function UpdatesSection() {
  return (
    <section id="updates" className="pt-0">
      <div className="mx-auto w-full max-w-[clamp(1320px,92vw,2400px)] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-[rgb(var(--fg))] sm:text-5xl">{landingContent.updates.title}</h2>
            </div>
            <LandingCtaLink
              loggedInHref="https://vvault.app/login"
              loggedOutHref="https://vvault.app/login"
              className="group inline-flex items-center gap-2 text-base text-[rgb(var(--fg))]"
            >
              <span>Open vvault</span>
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current text-[rgb(var(--fg)_/_0.42)] stroke-[1.8] transition-transform duration-300 ease-out group-hover:translate-x-1">
                <path d="M4 10h11M11 6l4 4-4 4" />
              </svg>
            </LandingCtaLink>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {landingContent.updates.items.map((item, index) => (
            <Reveal key={item.title} delayMs={index * 34}>
              <article className="landing-panel rounded-[18px] border border-[rgb(var(--ov)_/_0.1)] bg-transparent p-5">
                <p className="text-xs tracking-[0.1em] text-[rgb(var(--fg)_/_0.42)]">{item.date}</p>
                <h3 className="mt-3 text-lg font-semibold text-[rgb(var(--fg)_/_0.88)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[rgb(var(--fg)_/_0.58)]">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
