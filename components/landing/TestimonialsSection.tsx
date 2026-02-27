"use client";

import { Reveal } from "@/components/landing/Reveal";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="pt-20 sm:pt-24">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="rounded-[20px] border border-white/10 bg-transparent p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-white/44">Testimonials</p>
            <h3 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Used daily by 600+ producers</h3>
            <p className="mt-2 text-sm text-white/62">
              Real creators showing how they use vvault to send, track, and convert.
            </p>
            <div className="mt-5 overflow-hidden rounded-[16px] border border-white/10 bg-[#090909]">
              <div className="relative w-full pb-[56.25%]">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/diDvzeYv_TE?start=21"
                  title="vvault testimonial video"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
