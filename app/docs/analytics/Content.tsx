"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function AnalyticsDocPage() {
  const locale = useDocsLocale();

  const funnelStages = locale === "fr"
    ? ["Envoyé", "Ouvert", "Cliqué", "Écouté", "Téléchargé"]
    : ["Sent", "Opened", "Clicked", "Played", "Downloaded"];

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Analytiques" : "Analytics"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Suis chaque interaction avec ta musique."
          : "Track every interaction with your music."}
      </p>

      {/* KPI metrics */}
      <h2 id="kpis" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Indicateurs clés" : "KPI metrics"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "vvault suit sept indicateurs de performance clés à travers toutes tes campagnes et ton contenu partagé :"
          : "vvault tracks seven key performance indicators across all your campaigns and shared content:"}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Indicateur" : "Metric"}
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">{locale === "fr" ? "Ouvertures" : "Opens"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Ouvertures d'email, suivies comme vérifiées (confirmées par pixel) et non vérifiées" : "Email opens, tracked as verified (pixel-confirmed) and unverified"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">{locale === "fr" ? "Clics" : "Clicks"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Clics sur les liens dans tes emails de campagne" : "Link clicks within your campaign emails"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">{locale === "fr" ? "Lectures" : "Plays"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Écoutes de morceaux avec suivi de la durée de lecture" : "Track listens with play duration tracking"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">{locale === "fr" ? "Téléchargements" : "Downloads"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Téléchargements de fichiers depuis tes packs et morceaux partagés" : "File downloads from your shared packs and tracks"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">{locale === "fr" ? "Favoris / Sauvegardes" : "Saves / Favorites"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Quand un destinataire sauvegarde ou met en favori ton contenu" : "When a recipient saves or favorites your content"}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium text-[#444]">{locale === "fr" ? "Achats" : "Purchases"}</td>
              <td className="px-3 py-2">{locale === "fr" ? "Ventes complétées via la marketplace" : "Completed sales through the marketplace"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Note :</strong>{" "}
        {locale === "fr"
          ? "Les analytics complets (lectures, téléchargements, favoris, achats) nécessitent un plan Pro ou Ultra. Les utilisateurs du plan Free ont accès uniquement au suivi basique des ouvertures et des clics."
          : "Full analytics (plays, downloads, saves, purchases) require a Pro or Ultra plan. Free plan users have access to basic open and click tracking only."}
      </div>

      {/* Dashboard */}
      <h2 id="dashboard" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Tableau de bord" : "Dashboard"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Le tableau de bord analytics te donne une vue complète de la performance de ton contenu. Il comprend :"
          : "The analytics dashboard gives you a comprehensive view of how your content is performing. It includes:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Cartes KPI" : "KPI summary cards"}</strong> &mdash;{" "}
          {locale === "fr" ? "Chiffres en un coup d'oeil pour chaque indicateur suivi." : "At-a-glance numbers for each tracked metric."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Graphique de la timeline d'activité" : "Activity timeline chart"}</strong> &mdash;{" "}
          {locale === "fr" ? "Visualise les tendances d'engagement dans le temps." : "Visualize engagement trends over time."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Panneau d'activité récente" : "Latest activity panel"}</strong> &mdash;{" "}
          {locale === "fr" ? "Un flux en temps réel des interactions récentes (ouvertures, lectures, téléchargements)." : "A real-time feed of recent interactions (opens, plays, downloads)."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Visualisation heatmap" : "Heatmap visualization"}</strong> &mdash;{" "}
          {locale === "fr" ? "Visualise les tendances d'engagement par jour et par heure." : "See engagement patterns by day and time."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Analyse du meilleur moment d'envoi" : "Best time to send analysis"}</strong> &mdash;{" "}
          {locale === "fr" ? "Moments d'envoi optimaux suggérés selon le comportement de ton audience (Pro et Ultra)." : "Suggested optimal send times based on your audience behavior (Pro and Ultra)."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Cartes d'insights avancés" : "Advanced insight cards"}</strong> &mdash;{" "}
          {locale === "fr" ? "Analyses approfondies des tendances d'engagement (Pro et Ultra)." : "Deeper breakdowns of engagement patterns (Pro and Ultra)."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Funnel d'engagement" : "Engagement funnel"}</strong> &mdash;{" "}
          {locale === "fr" ? "Funnel visuel de l'envoi au téléchargement." : "Visual funnel from sent to downloaded."}
        </li>
      </ul>

      {/* Engagement funnel */}
      <h2 id="funnel" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Funnel d'engagement" : "Engagement funnel"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Le funnel d'engagement visualise le parcours des destinataires avec ton contenu, étape par étape :"
          : "The engagement funnel visualizes the journey recipients take with your content, stage by stage:"}
      </p>
      <div className="flex flex-col items-center gap-2 mb-4">
        {funnelStages.map((stage, i) => (
          <div key={stage} className="flex items-center gap-2">
            <span
              className="inline-block rounded-lg px-4 py-2 text-[13px] font-medium text-[#444]"
              style={{
                background: `rgba(255,255,255,${0.06 - i * 0.008})`,
                border: "1px solid rgba(255,255,255,0.06)",
                width: `${220 - i * 25}px`,
                textAlign: "center",
              }}
            >
              {stage}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Utilise le funnel pour identifier où les destinataires abandonnent. Par exemple, si beaucoup de personnes ouvrent mais peu cliquent, le contenu de ton email a peut-être besoin d'un appel à l'action plus clair. Si beaucoup cliquent mais peu écoutent, la mise en page de ta landing page peut nécessiter des améliorations."
          : "Use the funnel to identify where recipients drop off. For example, if many people open but few click, your email content may need a clearer call to action. If many click but few play, your landing page layout may need improvement."}
      </p>

      {/* Best time to send */}
      <h2 id="best-time" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Meilleur moment d'envoi" : "Best time to send"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Disponible sur les plans Pro et Ultra. La fonctionnalité \u00ab meilleur moment d'envoi \u00bb analyse l'historique d'engagement de chaque contact \u2014 quand il ouvre habituellement ses emails, clique sur les liens et écoute les morceaux \u2014 pour suggérer le moment optimal d'envoi par contact."
          : "Available on Pro and Ultra plans. The \u201cbest time to send\u201d feature analyzes each contact\u2019s historical engagement data \u2014 when they typically open emails, click links, and listen to tracks \u2014 to suggest the optimal send time on a per-contact basis."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Cette fonctionnalité s'intègre directement avec la programmation de campagnes : lors de la composition d'une campagne, tu peux choisir d'envoyer au moment optimal de chaque destinataire plutôt qu'à une heure fixe unique pour tous."
          : "This integrates directly with campaign scheduling: when composing a campaign, you can choose to send at each recipient\u2019s optimal time rather than a single fixed time for all recipients."}
      </p>
    </>
  );
}
