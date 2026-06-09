"use client";

import React from "react";
import { motion } from "motion/react";

/* Review card structure — matches the LandingReview shape from
   /lib/landing-reviews, plus an optional `source` so we can tag App
   Store vs Trustpilot. The card chrome is the same dark gradient +
   1px hairline outline as the Free / Ultra pricing-page cards, so
   the /reviews page reads as part of the pricing-page design system. */
export type ReviewCard = {
  name: string;
  body: string;
  rating: number;
  source?: "App Store" | "Trustpilot";
};

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: ReviewCard[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-5 pb-5"
      >
        {[
          ...Array.from({ length: 2 }).map((_, idx) => (
            <React.Fragment key={idx}>
              {props.testimonials.map((review, i) => (
                <div
                  key={`${idx}-${i}`}
                  className="relative w-full max-w-xs overflow-hidden rounded-2xl p-6 sm:p-7"
                  style={{
                    /* Solid very-dark-grey fill — no gradient, no halo. */
                    background: "#0d0d0f",
                    outline: "1px solid rgba(255, 255, 255, 0.08)",
                    outlineOffset: "-1px",
                  }}
                >
                  {/* Trustpilot-style green stars row */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.rating || 5 }).map((_, s) => (
                      <svg
                        key={s}
                        viewBox="0 0 20 20"
                        className="h-3.5 w-3.5 fill-[#00b67a]"
                        aria-hidden="true"
                      >
                        <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 13.27l-4.77 2.51.91-5.33L2.27 6.68l5.34-.78L10 1z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-4 text-[13.5px] leading-relaxed text-[rgb(var(--fg)_/_0.85)]">
                    &ldquo;{review.body}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-2">
                    <span className="truncate text-[12.5px] font-medium text-[rgb(var(--fg))]">
                      {review.name}
                    </span>
                    {review.source ? (
                      <span className="shrink-0 text-[11px] font-medium text-[rgb(var(--fg)_/_0.45)]">
                        {review.source}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};
