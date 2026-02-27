import { landingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";

function ComparisonCard({
  title,
  bullets,
  cost,
  costNote,
  symbol,
}: {
  title: string;
  bullets: string[];
  cost: string;
  costNote: string;
  symbol: "check" | "cross";
}) {
  const marker = symbol === "check" ? "✓" : "✕";

  return (
    <article className="landing-panel rounded-[18px] border border-white/10 bg-transparent p-5 sm:p-6">
      <p className="text-[13px] uppercase tracking-[0.2em] text-white/50">{title}</p>
      <ul className="mt-5 space-y-2.5">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5 text-sm text-white/66">
            <span className="mt-[2px] inline-flex w-4 shrink-0 text-white/72">{marker}</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="text-4xl font-semibold text-white">{cost}</p>
        <p className="mt-1 text-sm text-white/46">{costNote}</p>
      </div>
    </article>
  );
}

function FullBleedDivider() {
  return (
    <div className="relative left-1/2 my-40 w-screen -translate-x-1/2 border-t border-white/10" />
  );
}

export function PricingSection() {
  const { human } = landingContent.pricingComparison;
  const plan = landingContent.singlePlan;

  return (
    <section id="pricing" className="pt-0">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="max-w-[980px]">
            <h2 className="font-display text-3xl text-white sm:text-5xl">A setter that costs less and executes more.</h2>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <ComparisonCard
            title={human.title}
            bullets={human.bullets}
            cost={human.cost}
            costNote={human.costNote}
            symbol={human.symbol}
          />
        </Reveal>

        <Reveal className="mt-8 rounded-[18px] bg-[#dcdcdc] p-6 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.15em] text-[#080808]">One Plan</p>
              <h3 className="mt-2 text-2xl font-semibold text-[#080808]">{plan.name}</h3>
            </div>
            <p className="text-4xl font-semibold text-[#080808]">{plan.price}</p>
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {plan.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-sm text-[#080808]">
                <span className="mt-[2px] inline-flex w-4 shrink-0 text-[#080808]">✓</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <LandingCtaLink
            loggedInHref="/dashboard"
            className="mt-6 inline-flex items-center rounded-none bg-[#080808] px-5 py-2.5 text-sm font-semibold text-[#dcdcdc] transition-[border-radius,background-color] duration-200 hover:rounded-md hover:bg-[#080808]/94 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
          >
            {plan.cta} →
          </LandingCtaLink>
        </Reveal>

        <FullBleedDivider />

        <Reveal className="rounded-[20px] border border-white/10 bg-transparent p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-white/88">FAQs</h3>
          <div className="mt-2 divide-y divide-white/10">
            {landingContent.faq.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm text-white/84 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span className="inline-flex h-5 w-5 items-center justify-center text-white/55 transition-transform duration-200 group-open:rotate-180" aria-hidden="true">
                    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                      <path d="M5 8l5 5 5-5" />
                    </svg>
                  </span>
                </summary>
                <div className="faq-answer">
                  <p className="pt-2 text-sm leading-7 text-white/58">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
