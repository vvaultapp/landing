import { landingContent } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";

export function SocialProofSection() {
  return (
    <section id="customers" className="pt-28 sm:pt-36">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="rounded-[20px] border border-white/10 bg-transparent p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-white/44">Teams using Integrity</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {landingContent.logoStrip.map((logo) => (
                <div
                  key={logo}
                  className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-transparent px-2 text-center text-[11px] font-medium uppercase tracking-[0.1em] text-white/52"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
