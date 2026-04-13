"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function ContactsDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Contacts
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "CRM et gestion de contacts pour les producteurs de musique."
          : "CRM and contact management for music producers."}
      </p>

      {/* Managing contacts */}
      <h2 id="managing" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Gérer tes contacts" : "Managing contacts"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les contacts peuvent être ajoutés à vvault de trois façons :"
          : "Contacts can be added to vvault in three ways:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Création manuelle" : "Manual creation"}</strong> &mdash;{" "}
          {locale === "fr" ? "Ajoute des contacts un par un avec leur email, nom et photo de profil." : "Add contacts one by one with their email, name, and profile picture."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Import" : "Import"}</strong> &mdash;{" "}
          {locale === "fr" ? "Importe des contacts en masse depuis un fichier." : "Bulk import contacts from a file."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Automatique" : "Automatic"}</strong> &mdash;{" "}
          {locale === "fr" ? "Les contacts sont créés automatiquement quand tu envoies des campagnes à de nouveaux destinataires." : "Contacts are created automatically when you send campaigns to new recipients."}
        </li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Chaque fiche contact stocke l'adresse email, le nom d'affichage, la photo de profil et l'historique complet d'engagement avec ton contenu."
          : "Each contact record stores their email address, display name, profile picture, and full engagement history with your content."}
      </p>

      {/* Groups and tags */}
      <h2 id="groups" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Groupes et tags" : "Groups and tags"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Organise tes contacts en groupes pour des campagnes ciblées. Tu peux créer des groupes personnalisés (ex. \u00ab A&Rs \u00bb, \u00ab Rappeurs \u00bb, \u00ab Superviseurs Sync \u00bb) et ajouter des tags aux contacts pour le filtrage et la segmentation."
          : "Organize your contacts into groups for targeted campaigns. You can create custom groups (e.g., \u201cA&Rs\u201d, \u201cRappers\u201d, \u201cSync Supervisors\u201d) and add tags to contacts for filtering and segmentation."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Lors de la création d'une campagne, tu peux sélectionner un groupe entier comme destinataires plutôt que d'ajouter les contacts individuellement."
          : "When creating a campaign, you can select an entire group as recipients rather than adding contacts individually."}
      </p>

      {/* Engagement scoring */}
      <h2 id="scoring" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Scoring d'engagement" : "Engagement scoring"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Chaque contact reçoit un score d'engagement automatique de 0 à 100, calculé à partir d'une formule pondérée basée sur ses interactions :"
          : "Each contact receives an automatic engagement score from 0 to 100, calculated using a weighted formula based on their interactions:"}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Action" : "Action"}
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555]">
                {locale === "fr" ? "Poids" : "Weight"}
              </th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Ouvertures" : "Opens"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">1x</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Clics" : "Clicks"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">3x</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Lectures" : "Plays"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">2x</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Téléchargements" : "Downloads"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">4x</td>
            </tr>
            <tr>
              <td className="px-3 py-2">{locale === "fr" ? "Favoris" : "Favorites"}</td>
              <td className="px-3 py-2 text-center">2x</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "En fonction de leur score, les contacts sont assignés à l'un des quatre niveaux d'engagement :"
          : "Based on their score, contacts are assigned to one of four engagement tiers:"}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Niveau" : "Tier"}
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Plage de score" : "Score range"}
              </th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-red-400/80 mr-2" />
                {locale === "fr" ? "Chaud" : "Hot"}
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">&ge; 70</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-400/80 mr-2" />
                {locale === "fr" ? "Tiède" : "Warm"}
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">&ge; 35</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-400/80 mr-2" />
                {locale === "fr" ? "Froid" : "Cold"}
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">20 &ndash; 34</td>
            </tr>
            <tr>
              <td className="px-3 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#ccc] mr-2" />
                {locale === "fr" ? "Non engagé" : "Unengaged"}
              </td>
              <td className="px-3 py-2">&lt; 20</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Concentre tes campagnes de relance sur les contacts \u00ab Chauds \u00bb et \u00ab Tièdes \u00bb pour les meilleurs taux de conversion. Utilise les données de scoring pour prioriser qui contacter en premier."
          : "Focus your follow-up campaigns on \u201cHot\u201d and \u201cWarm\u201d contacts for the highest conversion rates. Use the scoring data to prioritize who to reach out to first."}
      </div>

      {/* Contact timeline */}
      <h2 id="timeline" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Timeline de contact" : "Contact timeline"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Chaque contact a une timeline d'activité détaillée qui enregistre chaque interaction avec des horodatages. La timeline inclut :"
          : "Every contact has a detailed activity timeline that logs every interaction with timestamps. The timeline includes:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>{locale === "fr" ? "Ouvertures d'email (avec statut vérifié/non vérifié)" : "Email opens (with verified/unverified status)"}</li>
        <li>{locale === "fr" ? "Clics sur les liens" : "Link clicks"}</li>
        <li>{locale === "fr" ? "Lectures de morceaux (avec durée)" : "Track plays (with duration)"}</li>
        <li>{locale === "fr" ? "Téléchargements de fichiers" : "File downloads"}</li>
        <li>{locale === "fr" ? "Sauvegardes et favoris" : "Saves and favorites"}</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Utilise la timeline pour comprendre exactement comment chaque contact interagit avec ta musique au fil du temps, et adapte tes relances en conséquence."
          : "Use the timeline to understand exactly how each contact engages with your music over time, and tailor your outreach accordingly."}
      </p>

      {/* Smart Segments */}
      <h2 id="smart-segments" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Segments intelligents" : "Smart Segments"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Crée des groupes de contacts dynamiques basés sur des règles avec une logique AND/OR imbriquée. Segmente ton audience par engagement de campagne, tags, activité, domaine email, score d'engagement, et plus encore."
          : "Create dynamic, rule-based contact groups with nested AND/OR logic. Segment your audience by campaign engagement, tags, activity, email domain, engagement score, and more."}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">{locale === "fr" ? "Constructeur visuel de règles" : "Visual rule builder"}</strong> — {locale === "fr" ? "Glisse-dépose des conditions avec des groupes AND/OR imbriqués." : "Drag-and-drop conditions with nested AND/OR groups."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Conditions multiples" : "Multiple condition types"}</strong> — {locale === "fr" ? "Engagement de campagne, tags, dates, domaine email, score, détection de leads froids." : "Campaign engagement, tags, dates, email domain, score, cold lead detection."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Prévisualisation en temps réel" : "Real-time preview"}</strong> — {locale === "fr" ? "Vois les contacts correspondants avant de sauvegarder." : "See matching contacts before saving."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Segments par défaut" : "Default segments"}</strong> — {locale === "fr" ? "Segments pré-construits : Hot Leads, Warm Leads, Cold Leads." : "Pre-built segments: Hot Leads, Warm Leads, Cold Leads."}</li>
      </ul>
    </>
  );
}
