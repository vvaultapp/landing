"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function LinkInBioDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Link in Bio
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Un lien unique pour tout ton contenu."
          : "One smart link for all your content."}
      </p>

      {/* Overview */}
      <h2 id="overview" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Vue d'ensemble" : "Overview"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "La fonctionnalité Link in Bio te donne une page de destination unique qui regroupe tout ton contenu public en un seul endroit. Au lieu de gérer plusieurs liens sur tes profils de réseaux sociaux, partage une seule URL vvault qui dirige les visiteurs vers tout ce que tu proposes."
          : "The Link in Bio feature gives you a single destination page that aggregates all your public content in one place. Instead of managing multiple links across your social media profiles, share one vvault URL that leads visitors to everything you offer."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Utilise-le comme lien principal sur Instagram, TikTok, YouTube et partout où tu veux diriger tes fans et acheteurs potentiels vers ta musique."
          : "Use it as your primary link on Instagram, TikTok, YouTube, and anywhere else you want to direct fans and potential buyers to your music."}
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Ta page Link in Bio est disponible sur toutes les offres, y compris Free. Configure-la dans les paramètres de ton profil."
          : "Your Link in Bio page is available on all plans, including Free. Set it up in your profile settings."}
      </div>

      {/* What's included */}
      <h2 id="included" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Ce qui est inclus" : "What\u2019s included"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Ta page Link in Bio affiche automatiquement :"
          : "Your Link in Bio page automatically displays:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Tous les morceaux publics" : "All public tracks"}</strong> &mdash;{" "}
          {locale === "fr" ? "Chaque morceau que tu as défini en visibilité publique." : "Every track you have set to public visibility."}
        </li>
        <li>
          <strong className="text-[#444]">Packs</strong> &mdash;{" "}
          {locale === "fr" ? "Tes packs publics avec artwork et liste des morceaux." : "Your public packs with artwork and track listings."}
        </li>
        <li>
          <strong className="text-[#444]">Sound kits</strong> &mdash;{" "}
          {locale === "fr" ? "Sound kits téléchargeables ou achetables." : "Downloadable or purchasable sound kits."}
        </li>
      </ul>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Suivi d'engagement" : "Engagement tracking"}
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Chaque visite et clic sur ta page Link in Bio est suivi. Tu peux voir :"
          : "Every visit and click on your Link in Bio page is tracked. You can see:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>{locale === "fr" ? "Total des vues de page" : "Total page views"}</li>
        <li>{locale === "fr" ? "Taux de clics sur chaque élément" : "Click-through rates on individual items"}</li>
        <li>{locale === "fr" ? "Activité de téléchargement" : "Download activity"}</li>
      </ul>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Actions directes" : "Direct actions"}
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les visiteurs de ta page Link in Bio peuvent :"
          : "Visitors to your Link in Bio page can:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>{locale === "fr" ? "Télécharger des morceaux et packs directement" : "Download tracks and packs directly"}</li>
        <li>{locale === "fr" ? "Partager du contenu sur leurs propres réseaux sociaux" : "Share content to their own social platforms"}</li>
        <li>{locale === "fr" ? "Acheter des licences via le checkout de la marketplace" : "Purchase licenses through the marketplace checkout"}</li>
      </ul>
    </>
  );
}
