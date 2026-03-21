"use client";

import Link from "next/link";

export function BlogNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0e0e0e]/85 pt-[env(safe-area-inset-top)] backdrop-blur-[20px] sm:pt-0">
      <div className="mx-auto flex h-[74px] w-full max-w-[1320px] items-center gap-3 px-5 sm:h-[66px] sm:px-8 lg:px-10">
        <Link
          href="/"
          className="shrink-0 rounded-xl text-[13px] font-semibold tracking-[0.18em] uppercase text-white"
          aria-label="vvault homepage"
        >
          vvault
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-5 lg:flex">
          <Link
            href="/blog"
            className="rounded-full px-3 py-1.5 text-sm text-white/30 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            Blog
          </Link>
          <Link
            href="/for/producers"
            className="rounded-full px-3 py-1.5 text-sm text-white/30 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            For Producers
          </Link>
          <Link
            href="/compare"
            className="rounded-full px-3 py-1.5 text-sm text-white/30 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            Compare
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="https://vvault.app/signup"
            className="inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          >
            Sign up
          </a>
          <a
            href="https://vvault.app/login"
            className="inline-flex items-center rounded-full px-3 py-1.5 text-sm text-white/30 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            Login
          </a>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <a
            href="https://vvault.app/signup"
            className="inline-flex items-center rounded-2xl bg-white px-4 py-2 text-[12px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          >
            Sign up
          </a>
          <a
            href="https://vvault.app/login"
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs text-white/64 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/84 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            Login
          </a>
        </div>
      </div>
    </header>
  );
}

export function BlogFooter() {
  const columns = [
    {
      title: "Product",
      links: [
        { label: "Homepage", href: "/" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Contact", href: "/#contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "For Producers", href: "/for/producers" },
        { label: "For Artists", href: "/for/artists" },
        { label: "For Managers & Labels", href: "/for/managers-and-labels" },
        { label: "Compare", href: "/compare" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Start free", href: "https://vvault.app/signup" },
        { label: "Support", href: "https://www.vvault.app/support" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-white/10 pb-14 pt-10 sm:pt-12">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="rounded-xl text-[13px] font-semibold tracking-[0.18em] uppercase text-white/95"
              aria-label="vvault homepage"
            >
              vvault
            </Link>
          </div>
          {columns.map((column) => (
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
          <a
            href="/privacy"
            className="rounded-md px-2 py-1 text-sm text-white/52 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/78"
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="rounded-md px-2 py-1 text-sm text-white/52 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/78"
          >
            Terms
          </a>
          <a
            href="mailto:vvaultapp@gmail.com"
            className="rounded-md px-2 py-1 text-sm text-white/52 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/78"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export function BottomCta() {
  return (
    <div className="sticky bottom-0 z-40 border-t border-white/10 bg-[#0e0e0e]/95 backdrop-blur-[12px]">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10">
        <p className="text-sm text-white/70">Ready to send music like a pro?</p>
        <a
          href="https://vvault.app/signup"
          className="inline-flex shrink-0 items-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
        >
          Start free
        </a>
      </div>
    </div>
  );
}

export function ArticleHeader({
  title,
  description,
  readingTime,
  publishedDate,
}: {
  title: string;
  description: string;
  readingTime: string;
  publishedDate: string;
}) {
  return (
    <header className="mb-10">
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/80"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.5]">
          <path d="M13 15l-5-5 5-5" />
        </svg>
        Back to blog
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
        {title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-white/60 sm:text-lg">{description}</p>
      <div className="mt-4 flex items-center gap-3 text-sm text-white/40">
        <time dateTime={publishedDate}>
          {new Date(publishedDate + "T00:00:00").toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <span className="text-white/20">·</span>
        <span>{readingTime} read</span>
      </div>
    </header>
  );
}

export function RelatedArticles({
  articles,
}: {
  articles: { slug: string; title: string; description: string }[];
}) {
  return (
    <section className="mt-16 border-t border-white/10 pt-10">
      <h2 className="mb-6 text-xl font-semibold">Related articles</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
          >
            <h3 className="text-sm font-semibold leading-snug text-white/90 group-hover:text-white">
              {article.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/50">
              {article.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
