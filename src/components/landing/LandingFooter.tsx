import { landingContent } from "@/components/landing/content";

export function LandingFooter() {
  return (
    <footer className="mt-20 border-t border-white/10 pb-14 pt-10 sm:pt-12">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <img
              src="/Integrity%20Full%20Logo.png"
              alt="Integrity"
              className="h-7 w-auto object-contain opacity-95 select-none"
              loading="lazy"
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
            />
          </div>

          {landingContent.footer.columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white/80">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="rounded-md px-1 py-1 text-sm text-white/50 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
          {landingContent.footer.legalLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md px-2 py-1 text-sm text-white/52 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
