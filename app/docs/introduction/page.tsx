"use client";

import Link from "next/link";
import { useDocsLocale } from "../DocsLocaleContext";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DocsIntroductionPage() {
  const locale = useDocsLocale();

  const features = [
    {
      name: "Library",
      description: locale === "fr"
        ? "Importe et organise tes morceaux, packs et sound kits"
        : "Upload and organize your tracks, packs, and sound kits",
      href: "/docs/library",
    },
    {
      name: "Campaigns",
      description: locale === "fr"
        ? "Envoie ta musique par email, Instagram ou messages"
        : "Send music via email, Instagram, or messages",
      href: "/docs/campaigns",
    },
    {
      name: "Analytics",
      description: locale === "fr"
        ? "Suis les ouvertures, clics, lectures, téléchargements et favoris"
        : "Track opens, clicks, plays, downloads, and saves",
      href: "/docs/analytics",
    },
    {
      name: "Contacts",
      description: locale === "fr"
        ? "CRM avec scoring d'engagement et gestion des contacts"
        : "CRM with engagement scoring and contact management",
      href: "/docs/contacts",
    },
    {
      name: "Sales",
      description: locale === "fr"
        ? "Vends tes beats et packs avec un checkout Stripe"
        : "Sell beats and packs with Stripe-powered checkout",
      href: "/docs/sales",
    },
    {
      name: "Opportunities",
      description: locale === "fr"
        ? "Parcours les demandes d'artistes et soumets ta musique"
        : "Browse and submit to artist requests",
      href: "/docs/opportunities",
    },
    {
      name: "Profile",
      description: locale === "fr"
        ? "Ta page publique avec ton branding personnalisé"
        : "Your public page with custom branding",
      href: "/docs/profile",
    },
    {
      name: "Link in Bio",
      description: locale === "fr"
        ? "Un lien unique pour tout ton contenu"
        : "One smart link for all your content",
      href: "/docs/link-in-bio",
    },
    {
      name: "Studio",
      description: locale === "fr"
        ? "Publication automatique de vidéos sur les réseaux sociaux"
        : "Automated video posting to social platforms",
      href: "/docs/studio",
    },
    {
      name: "Certificate",
      description: locale === "fr"
        ? "Protège la propriété de ta musique"
        : "Protect ownership of your music",
      href: "/docs/certificate",
    },
  ];

  return (
    <>
      {/* Breadcrumb */}
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Pour commencer" : "Getting Started"}
      </p>

      {/* Title */}
      <h1 className="mt-3 text-[1.75rem] font-semibold text-[#111]">
        Introduction
      </h1>

      {/* Intro paragraph */}
      <p className="mt-4 text-[15px] leading-relaxed text-[#777]">
        {locale === "fr"
          ? "vvault est une plateforme sécurisée conçue pour les producteurs de musique et les beatmakers pour importer, envoyer, suivre et vendre leur musique. Elle combine une bibliothèque privée et chiffrée, des campagnes email avec analytics, un CRM, une marketplace et la publication automatisée sur les réseaux sociaux — le tout dans une seule app."
          : "vvault is a secure platform built for music producers and beatmakers to upload, send, track, and sell their music. It combines a private, encrypted library, email campaigns with analytics, a CRM, a marketplace, and automated social posting — all in one app."}
      </p>

      {/* ------------------------------------------------------------ */}
      {/*  What is vvault?                                              */}
      {/* ------------------------------------------------------------ */}
      <section className="mt-14">
        <h2 id="what-is-vvault" className="text-lg font-semibold text-[#111]">
          {locale === "fr" ? "Qu'est-ce que vvault ?" : "What is vvault?"}
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          {locale === "fr"
            ? "vvault est la plateforme tout-en-un pour les producteurs de musique. Importe tes morceaux, organise-les en packs, envoie ta musique à tes contacts, suis l'engagement et vends via une marketplace intégrée — tout ce dont tu as besoin dans un seul espace de travail."
            : "vvault is the all-in-one platform for music producers. Upload tracks, organize them into packs, send music to your contacts, track engagement, and sell through a built-in marketplace — everything you need in a single workspace."}
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          {locale === "fr"
            ? "Disponible en tant qu'application web, vvault offre aux producteurs une boîte à outils professionnelle pour gérer leur catalogue, développer leur audience et monétiser leurs beats sans jongler entre plusieurs services."
            : "Available as a web app, vvault gives producers a professional toolkit to manage their catalog, grow their audience, and monetize their beats without juggling multiple services."}
        </p>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  Key features                                                 */}
      {/* ------------------------------------------------------------ */}
      <section className="mt-14">
        <h2 id="key-features" className="text-lg font-semibold text-[#111]">
          {locale === "fr" ? "Fonctionnalités clés" : "Key features"}
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          {locale === "fr"
            ? "Explore chaque fonctionnalité en détail en cliquant sur une carte ci-dessous."
            : "Explore each feature in detail by clicking a card below."}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <Link
              key={f.name}
              href={f.href}
              className="group flex flex-col justify-between rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4 transition hover:bg-[#f5f5f5]"
            >
              <div>
                <p className="text-[14px] font-medium text-[#222] group-hover:text-[#111]">
                  {f.name}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-[#999]">
                  {f.description}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[12px] text-[#bbb] group-hover:text-[#666]">
                <span>{locale === "fr" ? "Lire la doc" : "Read docs"}</span>
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.5 6h7M6.5 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  Plans                                                        */}
      {/* ------------------------------------------------------------ */}
      <section className="mt-14">
        <h2 id="plans" className="text-lg font-semibold text-[#111]">
          {locale === "fr" ? "Offres" : "Plans"}
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          {locale === "fr"
            ? "vvault propose trois offres pour que tu puisses commencer gratuitement et évoluer à ton rythme."
            : "vvault offers three plans so you can start free and scale as you grow."}
        </p>

        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
            <p className="text-[14px] font-medium text-[#222]">Free</p>
            <p className="mt-1 text-[13px] leading-snug text-[#999]">
              {locale === "fr"
                ? "100 Mo de stockage, 1 campagne par jour (5 destinataires) et analytics de base. Tout ce qu'il faut pour démarrer."
                : "100 MB storage, 1 campaign per day (5 recipients), and basic analytics. Everything you need to get started."}
            </p>
          </div>

          <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
            <div className="flex items-baseline gap-2">
              <p className="text-[14px] font-medium text-[#222]">Pro</p>
              <span className="text-[12px] text-[#999]">&euro;8.99/mo</span>
            </div>
            <p className="mt-1 text-[13px] leading-snug text-[#999]">
              {locale === "fr"
                ? "Stockage et campagnes illimités, analytics complets, CRM et accès à la marketplace avec 5 % de commission."
                : "Unlimited storage and campaigns, full analytics, CRM, and marketplace access with a 5% transaction fee."}
            </p>
          </div>

          <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
            <div className="flex items-baseline gap-2">
              <p className="text-[14px] font-medium text-[#222]">Ultra</p>
              <span className="text-[12px] text-[#999]">&euro;24.99/mo</span>
            </div>
            <p className="mt-1 text-[13px] leading-snug text-[#999]">
              {locale === "fr"
                ? "Tout ce qui est dans Pro plus les thèmes personnalisés, Studio pour la publication automatique sur les réseaux, analytics avancés et 0 % de commission marketplace."
                : "Everything in Pro plus custom themes, Studio for automated social posting, advanced analytics, and 0% marketplace fees."}
            </p>
          </div>
        </div>

        <p className="mt-4 text-[13px] text-[#999]">
          {locale === "fr" ? "Voir" : "See"}{" "}
          <Link
            href="/docs/plans"
            className="text-[#555] underline decoration-[#ccc] underline-offset-2 transition hover:text-[#222]"
          >
            {locale === "fr" ? "Offres et tarifs" : "Plans & pricing"}
          </Link>{" "}
          {locale === "fr" ? "pour une comparaison complète." : "for a full comparison."}
        </p>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  Security & privacy                                           */}
      {/* ------------------------------------------------------------ */}
      <section className="mt-14">
        <h2 id="security" className="text-lg font-semibold text-[#111]">
          {locale === "fr" ? "Sécurité et confidentialité" : "Security & privacy"}
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          {locale === "fr"
            ? "Ta musique est privée par défaut. Les fichiers sont stockés sur une infrastructure chiffrée, et rien n'est partagé ni rendu public à moins que tu ne le choisisses explicitement. Les liens de partage utilisent des tokens uniques que tu peux révoquer à tout moment."
            : "Your music is private by default. Files are stored on encrypted infrastructure, and nothing is shared or made public unless you explicitly choose to. Share links use unique tokens that you can revoke at any time."}
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          {locale === "fr"
            ? "Les paiements sont traités via le checkout PCI-compliant de Stripe, l'intégration Gmail utilise OAuth (vvault ne stocke jamais ton mot de passe), et nous n'accédons jamais à tes données, ne les vendons ni ne les partageons. Tu es propriétaire de tout ce que tu importes."
            : "Payments are processed through Stripe\u2019s PCI-compliant checkout, Gmail integration uses OAuth (vvault never stores your password), and we never access, sell, or share your data. You own everything you upload."}
        </p>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  Getting help                                                 */}
      {/* ------------------------------------------------------------ */}
      <section className="mt-14">
        <h2 id="getting-help" className="text-lg font-semibold text-[#111]">
          {locale === "fr" ? "Obtenir de l'aide" : "Getting help"}
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          {locale === "fr"
            ? "Si tu as des questions ou rencontres un problème, on est là pour t'aider."
            : "If you have questions or run into any issues, we are here to help."}
        </p>

        <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-[#666]">
          <li className="flex items-start gap-2">
            <span className="mt-[3px] block h-1.5 w-1.5 shrink-0 rounded-full bg-[#ccc]" />
            <span>
              <a
                href="https://discord.gg/QGGEZR5KhB"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#555] underline decoration-[#ccc] underline-offset-2 transition hover:text-[#222]"
              >
                {locale === "fr" ? "Communauté Discord" : "Discord community"}
              </a>{" "}
              {locale === "fr"
                ? "— pose tes questions, partage ton feedback et connecte-toi avec d'autres producteurs."
                : "— ask questions, share feedback, and connect with other producers."}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[3px] block h-1.5 w-1.5 shrink-0 rounded-full bg-[#ccc]" />
            <span>
              <a
                href="mailto:vvaultapp@gmail.com"
                className="text-[#555] underline decoration-[#ccc] underline-offset-2 transition hover:text-[#222]"
              >
                vvaultapp@gmail.com
              </a>{" "}
              {locale === "fr"
                ? "— contacte-nous directement par email."
                : "— reach us directly by email."}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[3px] block h-1.5 w-1.5 shrink-0 rounded-full bg-[#ccc]" />
            <span>
              <strong className="font-medium text-[#555]">
                {locale === "fr" ? "Support intégré" : "In-app support"}
              </strong>{" "}
              {locale === "fr"
                ? "— utilise le bouton d'aide dans vvault pour une assistance contextuelle."
                : "— use the help button inside vvault for contextual assistance."}
            </span>
          </li>
        </ul>
      </section>
    </>
  );
}
