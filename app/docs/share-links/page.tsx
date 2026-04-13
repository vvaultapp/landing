"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function ShareLinksDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Liens de partage" : "Share Links"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Génère, suis et gère des liens de partage pour tout ton contenu."
          : "Generate, track, and manage share links for all content."}
      </p>

      {/* Overview */}
      <h2 id="overview" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Vue d'ensemble" : "Overview"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "vvault fournit un système complet pour générer des liens de partage suivis et des pages de téléchargement. Chaque lien est unique, traçable et conçu pour maximiser l'engagement avec ta musique."
          : "vvault provides a comprehensive system for generating tracked share links and download pages. Every link is unique, trackable, and designed to maximize engagement with your music."}
      </p>

      {/* Share pages */}
      <h2 id="share-pages" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Pages de partage" : "Share pages"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Chaque type de contenu dispose de sa propre page de partage dédiée, optimisée pour la conversion :"
          : "Each content type gets its own dedicated share page, optimized for conversion:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">{locale === "fr" ? "Partage de pack" : "Pack share"}</strong> — {locale === "fr" ? "Page avec tracklist, pochette et téléchargement." : "Page with tracklist, cover art, and download."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Partage de track" : "Track share"}</strong> — {locale === "fr" ? "Page avec lecteur waveform." : "Page with waveform player."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Partage de campagne" : "Campaign share"}</strong> — {locale === "fr" ? "Lien de partage dédié à une campagne." : "Dedicated campaign share link."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Partage de dossier" : "Folder share"}</strong> — {locale === "fr" ? "Partage d'un dossier complet de contenu." : "Share an entire folder of content."}</li>
      </ul>

      {/* Downloads */}
      <h2 id="downloads" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Téléchargements" : "Downloads"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les pages de partage offrent des options de téléchargement flexibles et sécurisées :"
          : "Share pages offer flexible and secure download options:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">{locale === "fr" ? "Téléchargement par track" : "Per-track downloads"}</strong> — {locale === "fr" ? "Télécharge des morceaux individuels." : "Download individual tracks."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Téléchargement ZIP complet" : "Full-pack ZIP downloads"}</strong> — {locale === "fr" ? "Télécharge le pack entier en une seule archive ZIP." : "Download the entire pack as a single ZIP archive."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Suivi de progression" : "Progress tracking"}</strong> — {locale === "fr" ? "Barre de progression en temps réel pour les téléchargements." : "Real-time progress bar for downloads."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Protection par mot de passe" : "Password protection"}</strong> — {locale === "fr" ? "Protection optionnelle par mot de passe pour les liens sensibles." : "Optional password protection for sensitive links."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Limitation de débit" : "Rate limiting"}</strong> — {locale === "fr" ? "Protection contre les abus de téléchargement." : "Protection against download abuse."}</li>
      </ul>

      {/* Tracking & analytics */}
      <h2 id="tracking" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Suivi et analytics" : "Tracking & analytics"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Chaque interaction avec tes liens de partage est suivie et mesurée :"
          : "Every interaction with your share links is tracked and measured:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">{locale === "fr" ? "Suivi complet" : "Full tracking"}</strong> — {locale === "fr" ? "Chaque téléchargement, lecture et clic est enregistré." : "Every download, play, and click is logged."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Attribution aux campagnes" : "Campaign attribution"}</strong> — {locale === "fr" ? "Les événements sont attribués aux campagnes correspondantes." : "Events are attributed to their respective campaigns."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Vues dans le dashboard" : "Dashboard views"}</strong> — {locale === "fr" ? "Les vues des pages de partage apparaissent dans ton tableau de bord analytics." : "Share page views appear in your analytics dashboard."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Capture de leads" : "Lead capture"}</strong> — {locale === "fr" ? "CTAs d'inscription email pour la capture de leads." : "Email signup CTAs for lead capture."}</li>
      </ul>

      {/* Short links */}
      <h2 id="short-links" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Liens courts" : "Short links"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "vvault génère automatiquement des liens courts optimisés pour le partage sur les réseaux sociaux :"
          : "vvault automatically generates short links optimized for social media sharing:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[13px] text-emerald-600 font-mono">/p/[slug]</code> — {locale === "fr" ? "Liens courts pour les packs." : "Short links for packs."}
        </li>
        <li>
          <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[13px] text-emerald-600 font-mono">/t/[slug]</code> — {locale === "fr" ? "Liens courts pour les tracks." : "Short links for tracks."}
        </li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Ces liens courts sont parfaits pour les bios Instagram, les tweets, les stories et toute plateforme où l'espace est limité."
          : "These short links are perfect for Instagram bios, tweets, stories, and any platform where space is limited."}
      </p>
    </>
  );
}
