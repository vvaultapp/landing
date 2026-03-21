import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/components/blog/blogData";

export const metadata: Metadata = {
  title: "Resources for Music Producers — vvault Blog",
  description:
    "Guides, comparisons, and strategies for music producers who want to send beats professionally, track engagement, organize their catalog, and land more placements.",
  openGraph: {
    title: "Resources for Music Producers — vvault Blog",
    description:
      "Guides, comparisons, and strategies for music producers who want to send beats professionally, track engagement, organize their catalog, and land more placements.",
    url: "https://get.vvault.app/blog",
    type: "website",
  },
  alternates: { canonical: "https://get.vvault.app/blog" },
};

const guides = articles.filter((a) => a.category === "guide");
const comparisons = articles.filter((a) => a.category === "comparison");

export default function BlogIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "vvault Blog — Resources for Music Producers",
            url: "https://get.vvault.app/blog",
            description:
              "Guides, comparisons, and strategies for music producers who want to send beats professionally, track engagement, and land more placements.",
            publisher: {
              "@type": "Organization",
              name: "vvault",
              url: "https://get.vvault.app",
            },
          }),
        }}
      />

      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
        Resources for Music Producers
      </h1>
      <p className="mt-5 text-base leading-relaxed text-white/60 sm:text-lg">
        Practical guides for producers, artists, managers and labels who want to stop sending music
        blindly and start running a professional workflow. From beat catalog organization to tracked
        sending to follow-up strategy — everything you need to send smarter and land more placements.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-white/90">Guides</h2>
        <div className="mt-5 grid gap-4">
          {guides.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <h3 className="text-base font-semibold text-white/90 group-hover:text-white">
                {article.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{article.description}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-white/35">
                <span>{article.readingTime} read</span>
                <span className="text-white/20">·</span>
                <time dateTime={article.publishedDate}>{article.publishedDate}</time>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-white/90">Comparisons</h2>
        <div className="mt-5 grid gap-4">
          {comparisons.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <h3 className="text-base font-semibold text-white/90 group-hover:text-white">
                {article.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{article.description}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-white/35">
                <span>{article.readingTime} read</span>
                <span className="text-white/20">·</span>
                <time dateTime={article.publishedDate}>{article.publishedDate}</time>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-white/90">vvault for...</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Link
            href="/for/producers"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
          >
            <h3 className="text-base font-semibold text-white/90 group-hover:text-white">
              Producers
            </h3>
            <p className="mt-2 text-sm text-white/50">Organize, send, and track your beats.</p>
          </Link>
          <Link
            href="/for/artists"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
          >
            <h3 className="text-base font-semibold text-white/90 group-hover:text-white">
              Artists
            </h3>
            <p className="mt-2 text-sm text-white/50">
              Organize releases, collaborate, and share music.
            </p>
          </Link>
          <Link
            href="/for/managers-and-labels"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
          >
            <h3 className="text-base font-semibold text-white/90 group-hover:text-white">
              Managers & Labels
            </h3>
            <p className="mt-2 text-sm text-white/50">
              Centralize music, contacts, and campaigns.
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
