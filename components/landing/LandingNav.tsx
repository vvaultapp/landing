import { useEffect, useState } from "react";
import { landingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileItems = landingContent.nav.filter((item) =>
    ["Product", "Pricing", "Contact"].includes(item.label)
  );
  const systemItems = mobileItems.filter((item) => item.label !== "Contact");
  const contactItem = mobileItems.find((item) => item.label === "Contact");

  useEffect(() => {
    if (!menuOpen) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#080808]/85 pt-[env(safe-area-inset-top)] backdrop-blur-[20px] sm:pt-0">
      <div className="mx-auto flex h-[74px] w-full max-w-[1320px] items-center gap-3 px-5 sm:h-[66px] sm:px-8 lg:px-10">
        <a href="/homepage" className="shrink-0" aria-label="Integrity homepage">
          <img
            src="/Integrity%20Full%20Logo.png"
            alt="Integrity"
            className="h-[22px] w-auto object-contain select-none sm:h-[24px]"
            loading="eager"
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
          />
        </a>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-5 lg:flex">
          {landingContent.nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md px-2 py-1 text-sm text-white/30 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <span className="text-sm text-white/30 select-none" aria-hidden="true">
            |
          </span>
          <a
            href="/auth"
            className="rounded-md px-3 py-2 text-sm text-white/30 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            Log in
          </a>
          <LandingCtaLink
            loggedInHref="/dashboard"
            className="inline-flex items-center bg-white px-4 py-2 text-sm font-semibold text-black rounded-none transition-[border-radius,background-color] duration-200 hover:rounded-md hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          >
            Book a demo
          </LandingCtaLink>
        </div>

        <LandingCtaLink
          loggedInHref="/dashboard"
          className="ml-auto inline-flex items-center bg-white px-3.5 py-2 text-[12px] font-semibold text-black rounded-none transition-[border-radius,background-color] duration-200 hover:rounded-md hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 lg:hidden"
        >
          Book a demo
        </LandingCtaLink>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-transparent text-white/74 transition-colors duration-200 hover:text-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 lg:hidden"
        >
          <svg viewBox="0 0 20 20" className="h-[22px] w-[22px] fill-none stroke-current stroke-[1.8]">
            {menuOpen ? (
              <path d="M5 5l10 10M15 5L5 15" />
            ) : (
              <path d="M3.5 5.25h13M3.5 10h13M3.5 14.75h13" />
            )}
          </svg>
        </button>
      </div>

      <nav
        aria-label="Mobile primary"
        className={`fixed inset-0 z-[70] transition-[opacity,visibility] duration-300 ease-out lg:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 z-0 bg-[#080808]/88 backdrop-blur-[22px] transition-opacity duration-300 ease-out ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`relative z-10 flex h-full flex-col transition-[opacity,transform] duration-320 ease-out ${
            menuOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          }`}
        >
          <div className="border-b border-white/10 pt-[env(safe-area-inset-top)]">
            <div className="mx-auto flex h-[74px] w-full max-w-[1320px] items-center gap-3 px-5 sm:px-8">
              <a href="/homepage" onClick={() => setMenuOpen(false)} className="shrink-0" aria-label="Integrity homepage">
                <img
                  src="/Integrity%20Full%20Logo.png"
                  alt="Integrity"
                  className="h-[22px] w-auto object-contain select-none"
                  loading="eager"
                  draggable={false}
                  onDragStart={(event) => event.preventDefault()}
                />
              </a>
              <a
                href="/auth"
                onClick={() => setMenuOpen(false)}
                className="ml-auto rounded-md px-3 py-2 text-[12px] text-white/58 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/76"
              >
                Log in
              </a>
              <LandingCtaLink
                loggedInHref="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center bg-white px-3.5 py-2 text-[12px] font-semibold text-black rounded-none transition-[border-radius,background-color] duration-200 hover:rounded-md hover:bg-white/95"
              >
                Book a demo
              </LandingCtaLink>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-transparent text-white/74 transition-colors duration-200 hover:text-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                <svg viewBox="0 0 20 20" className="h-[22px] w-[22px] fill-none stroke-current stroke-[1.8]">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-8 sm:px-8">
            <div>
              <p className="text-[13px] uppercase tracking-[0.14em] text-white/34">System</p>
              <div className="mt-4 flex flex-col gap-4">
                {systemItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-[3rem] leading-[1.02] tracking-tight text-white/92 transition-colors duration-200 hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {contactItem ? (
              <div className="mt-10">
                <p className="text-[13px] uppercase tracking-[0.14em] text-white/34">Resources</p>
                <a
                  href={contactItem.href}
                  onClick={() => setMenuOpen(false)}
                  className="mt-4 block text-[3rem] leading-[1.02] tracking-tight text-white/92 transition-colors duration-200 hover:text-white"
                >
                  {contactItem.label}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
}
