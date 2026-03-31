"use client";

import Link from "next/link";
import { articles } from "@/components/blog/blogData";
import { useLocale } from "@/lib/useLocale";

const guides = articles.filter((a) => a.category === "guide");
const comparisons = articles.filter((a) => a.category === "comparison");

export default function BlogIndexPage() {
  const [locale] = useLocale();
  const fr = locale === "fr";

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
        {fr ? "Ressources pour les producteurs de musique" : "Resources for Music Producers"}
      </h1>
      <p className="mt-5 text-base leading-relaxed text-white/60 sm:text-lg">
        {fr
          ? "Des guides pratiques pour les producteurs, artistes, managers et labels qui veulent arrêter d'envoyer de la musique à l'aveugle et commencer un workflow professionnel. De l'organisation de ton catalogue à l'envoi avec tracking jusqu'à la stratégie de relance — tout ce dont tu as besoin pour envoyer plus intelligemment et décrocher plus de placements."
          : "Practical guides for producers, artists, managers and labels who want to stop sending music blindly and start running a professional workflow. From beat catalog organization to tracked sending to follow-up strategy \u2014 everything you need to send smarter and land more placements."}
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-white/90">{fr ? "Guides" : "Guides"}</h2>
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
        <h2 className="text-xl font-semibold text-white/90">{fr ? "Comparatifs" : "Comparisons"}</h2>
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
        <h2 className="text-xl font-semibold text-white/90">vvault {fr ? "pour..." : "for..."}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Link
            href="/for/producers"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
          >
            <h3 className="text-base font-semibold text-white/90 group-hover:text-white">
              {fr ? "Producteurs" : "Producers"}
            </h3>
            <p className="mt-2 text-sm text-white/50">{fr ? "Organise, envoie et traque tes beats." : "Organize, send, and track your beats."}</p>
          </Link>
          <Link
            href="/for/artists"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
          >
            <h3 className="text-base font-semibold text-white/90 group-hover:text-white">
              {fr ? "Artistes" : "Artists"}
            </h3>
            <p className="mt-2 text-sm text-white/50">
              {fr ? "Organise tes sorties, collabore et partage ta musique." : "Organize releases, collaborate, and share music."}
            </p>
          </Link>
          <Link
            href="/for/managers-and-labels"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
          >
            <h3 className="text-base font-semibold text-white/90 group-hover:text-white">
              {fr ? "Managers & Labels" : "Managers & Labels"}
            </h3>
            <p className="mt-2 text-sm text-white/50">
              {fr ? "Centralise ta musique, tes contacts et tes campagnes." : "Centralize music, contacts, and campaigns."}
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
