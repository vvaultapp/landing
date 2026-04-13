"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function EmbedPlayerDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Lecteur embarqué" : "Embed Player"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Lecteurs audio intégrables pour ton site web ou ton portfolio."
          : "Embeddable audio players for your website or portfolio."}
      </p>

      {/* Overview */}
      <h2 id="overview" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Vue d'ensemble" : "Overview"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les lecteurs embarqués permettent aux producteurs d'intégrer des players audio sur des sites externes, blogs ou portfolios pour présenter leur musique avec un suivi complet des écoutes."
          : "Embeddable audio players that producers can place on external websites, blogs, or portfolios to showcase their music with full play tracking."}
      </p>

      {/* Track embed */}
      <h2 id="track-embed" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Embed par morceau" : "Track embed"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Un lecteur léger et autonome pour un seul morceau, avec visualisation de la forme d'onde, métadonnées du morceau et bouton de téléchargement optionnel."
          : "A lightweight, standalone player for a single track. Includes waveform visualization, track metadata display, and an optional download button."}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          {locale === "fr" ? "Visualisation de la forme d'onde" : "Waveform visualization"}
        </li>
        <li>
          {locale === "fr" ? "Affichage des métadonnées (titre, BPM, tonalité)" : "Track metadata display (title, BPM, key)"}
        </li>
        <li>
          {locale === "fr" ? "Bouton de téléchargement optionnel" : "Optional download button"}
        </li>
      </ul>

      {/* Pack embed */}
      <h2 id="pack-embed" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Embed par pack" : "Pack embed"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Un lecteur multi-pistes affichant la tracklist complète du pack. Les morceaux se jouent séquentiellement avec affichage du cover art."
          : "A multi-track player showing the full pack tracklist. Tracks play sequentially with cover art display."}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          {locale === "fr" ? "Tracklist complète du pack" : "Full pack tracklist"}
        </li>
        <li>
          {locale === "fr" ? "Lecture séquentielle" : "Sequential playback"}
        </li>
        <li>
          {locale === "fr" ? "Affichage du cover art" : "Cover art display"}
        </li>
      </ul>

      {/* Getting your embed code */}
      <h2 id="embed-code" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Obtenir ton code d'intégration" : "Getting your embed code"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Copie-colle le snippet HTML iframe depuis la modale de partage. Les dimensions sont personnalisables, et tu peux prévisualiser le rendu avant de publier."
          : "Copy-paste the HTML iframe snippet from the share modal. Dimensions are customizable, and you can preview the result before publishing."}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          {locale === "fr" ? "Snippet iframe HTML prêt à coller" : "Ready-to-paste HTML iframe snippet"}
        </li>
        <li>
          {locale === "fr" ? "Dimensions personnalisables" : "Customizable dimensions"}
        </li>
        <li>
          {locale === "fr" ? "Prévisualisation avant publication" : "Preview before publishing"}
        </li>
      </ul>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Tu peux retrouver le code d'intégration dans la modale de partage de n'importe quel morceau ou pack."
          : "You can find the embed code in the share modal of any track or pack."}
      </div>

      {/* Tracking */}
      <h2 id="tracking" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Suivi des écoutes" : "Tracking"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Toutes les écoutes provenant des lecteurs embarqués sont suivies dans l'Analytics sous la source « Embed ». Identifie quels players embarqués génèrent le plus d'engagement et optimise ta stratégie de promotion en conséquence."
          : "All plays from embedded players are tracked in Analytics under the \"Embed\" source. See which embedded players drive the most engagement and optimize your promotion strategy accordingly."}
      </p>
    </>
  );
}
