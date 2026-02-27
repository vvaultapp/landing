"use client";

import Image from "next/image";
import { landingContent } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="pt-20 sm:pt-28">
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

        <div className="mt-10 grid gap-6">
          {landingContent.howItWorks.map((step, index) => (
            <Reveal key={step.title} delayMs={index * 36}>
              <article className="landing-panel overflow-hidden rounded-[18px] border border-white/10 bg-transparent min-h-[280px] md:h-[320px] md:min-h-0">
                <div className="grid h-full md:grid-cols-2 md:items-stretch">
                  <div className="p-6 sm:p-8">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">Step {index + 1}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white/90">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/58">{step.description}</p>
                    <p className="mt-4 text-sm leading-7 text-white/45">
                      {step.detail}
                    </p>
                  </div>

                  <div className="relative min-h-[220px] h-full self-stretch overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.04))]">
                    {index === 0 ? (
                      <Image
                        src="/step-1-upload.jpg"
                        alt="Step 1 upload interface"
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-[0.14em] text-white/45">
                        Step image placeholder
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0e0e0e] to-transparent" />
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
