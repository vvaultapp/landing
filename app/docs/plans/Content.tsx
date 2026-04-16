"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function PlansDocPage() {
  const locale = useDocsLocale();

  const yes = locale === "fr" ? "Oui" : "Yes";
  const unlimited = locale === "fr" ? "Illimité" : "Unlimited";

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Compte" : "Account"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Offres et tarifs" : "Plans & Pricing"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Choisis l'offre adaptée à ton workflow."
          : "Choose the plan that fits your workflow."}
      </p>

      {/* Free */}
      <h2 id="free" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Free
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "L'offre Free te permet de démarrer avec vvault sans frais. Elle inclut :"
          : "The Free plan lets you get started with vvault at no cost. It includes:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>{locale === "fr" ? "100 Mo de stockage" : "100 MB storage"}</li>
        <li>{locale === "fr" ? "1 campagne par jour (maximum 5 destinataires)" : "1 campaign per day (maximum 5 recipients)"}</li>
        <li>{locale === "fr" ? "Liens de partage pour morceaux, packs et dossiers" : "Share links for tracks, packs, and folders"}</li>
        <li>{locale === "fr" ? "Liste de contacts complète" : "Full contact list"}</li>
        <li>{locale === "fr" ? "Packs et morceaux collaboratifs" : "Collab packs and tracks"}</li>
        <li>{locale === "fr" ? "Vendre sur le Marketplace (15 % de commission)" : "Sell on Marketplace (15% commission)"}</li>
        <li>{locale === "fr" ? "Recevoir des splits de ventes Pro/Ultra" : "Receive splits from Pro/Ultra sales"}</li>
        <li>{locale === "fr" ? "Page Link in Bio" : "Link in Bio page"}</li>
        <li>{locale === "fr" ? "Certificat de dépôt" : "Certificate of deposit"}</li>
        <li>{locale === "fr" ? "Profil public avec liens sociaux et crédits de placement" : "Public profile with social links and placement credits"}</li>
        <li>{locale === "fr" ? "WaveMatch (détection de placements sur YouTube, Spotify, Apple Music)" : "WaveMatch (placement detection on YouTube, Spotify, Apple Music)"}</li>
        <li>{locale === "fr" ? "Envoi d'email vvault (modèle standard)" : "vvault email sending (standard template)"}</li>
      </ul>

      {/* Pro */}
      <h2 id="pro" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Pro
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr" ? (
          <>
            <strong className="text-[#444]">&euro;8,99/mois</strong> (ou &euro;7,49/mois en facturation annuelle). Tout ce qui est dans Free, plus :
          </>
        ) : (
          <>
            <strong className="text-[#444]">&euro;8.99/month</strong> (or &euro;7.49/month billed annually). Everything in Free, plus:
          </>
        )}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>{locale === "fr" ? "Stockage illimité" : "Unlimited storage"}</li>
        <li>{locale === "fr" ? "Campagnes illimitées avec destinataires illimités" : "Unlimited campaigns with unlimited recipients"}</li>
        <li>{locale === "fr" ? "Envois programmés et relances" : "Schedule sends and follow-ups"}</li>
        <li>{locale === "fr" ? "A/B test des objets d'email" : "A/B test email subject lines"}</li>
        <li>{locale === "fr" ? "Intégration Gmail \u2014 envoie depuis ta propre adresse email" : "Gmail integration \u2014 send from your own email address"}</li>
        <li>{locale === "fr" ? "Objet et corps d'email personnalisés" : "Custom email subject and body"}</li>
        <li>{locale === "fr" ? "Analytics complets : ouvertures, clics, durée de lecture, téléchargements, favoris et suivi des ventes" : "Full analytics: opens, clicks, play duration, downloads, saves, and sales tracking"}</li>
        <li>{locale === "fr" ? "Heatmap d'engagement et flux d'activité en temps réel" : "Engagement heatmap and real-time activity feed"}</li>
        <li>{locale === "fr" ? "Analyse du meilleur moment d'envoi" : "Best time to send analysis"}</li>
        <li>{locale === "fr" ? "Funnels d'engagement" : "Engagement funnels"}</li>
        <li>{locale === "fr" ? "CRM avec timeline de contact, groupes, tags et scoring" : "CRM with contact timeline, groups, tags, and lead scoring"}</li>
        <li>{locale === "fr" ? "Smart Segments (segments dynamiques basés sur les règles)" : "Smart Segments (dynamic rule-based segments)"}</li>
        <li>{locale === "fr" ? "Opportunities et tableau de demandes" : "Opportunities and request board"}</li>
        <li>{locale === "fr" ? "Checkout Stripe et listing marketplace" : "Stripe checkout and marketplace listing"}</li>
        <li>{locale === "fr" ? "Types de licences : Basic, Premium, Stems, Exclusive" : "License types: Basic, Premium, Stems, Exclusive"}</li>
        <li>{locale === "fr" ? "Commission marketplace réduite à 5 % par vente" : "Reduced marketplace commission: 5% per sale"}</li>
        <li>{locale === "fr" ? "Personnalisation du thème pour le profil public" : "Theme customization for public profile"}</li>
      </ul>

      {/* Ultra */}
      <h2 id="ultra" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Ultra
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr" ? (
          <>
            <strong className="text-[#444]">&euro;24,99/mois</strong> (ou &euro;20,75/mois en facturation annuelle). Tout ce qui est dans Pro, plus :
          </>
        ) : (
          <>
            <strong className="text-[#444]">&euro;24.99/month</strong> (or &euro;20.75/month billed annually). Everything in Pro, plus:
          </>
        )}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>{locale === "fr" ? "vVault Studio \u2014 publication automatique de vidéos sur YouTube et plus" : "vVault Studio \u2014 automated video posting to YouTube and more"}</li>
        <li>{locale === "fr" ? "Programmation du meilleur moment par destinataire" : "Per-recipient best time scheduling"}</li>
        <li>{locale === "fr" ? "Automatisations de séries (sorties récurrentes)" : "Series automations (recurring releases)"}</li>
        <li>{locale === "fr" ? "Séquences email automatisées (drip jusqu'à 30 étapes)" : "Automated email sequences (drip up to 30 steps)"}</li>
        <li>{locale === "fr" ? "0 % de commission marketplace (seuls les frais Stripe s'appliquent)" : "0% marketplace commission (only Stripe processing fees apply)"}</li>
        <li>{locale === "fr" ? "-50 % sur les soumissions de packs payantes" : "50% off paid request pack submissions"}</li>
        <li>{locale === "fr" ? "Domaine personnalisé pour ton profil public" : "Custom domain for your public profile"}</li>
        <li>{locale === "fr" ? "Embeds brandés et codes QR pour partage externe" : "Branded embeds and QR codes for external sharing"}</li>
        <li>{locale === "fr" ? "Suggestions de relances par IA et recommandations « quoi envoyer »" : "AI follow-up suggestions and \u201cwhat to send\u201d recommendations"}</li>
        <li>{locale === "fr" ? "Mise en avant dans la section Browse pour une visibilité accrue du profil" : "Browse section highlight for enhanced profile visibility"}</li>
        <li>{locale === "fr" ? "Désactivation des limites de sécurité email" : "Disable email safety limits"}</li>
      </ul>

      {/* Comparison table */}
      <h2 id="comparison" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Tableau comparatif" : "Comparison table"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Comparaison complète des fonctionnalités sur les trois offres :"
          : "Full feature comparison across all three plans:"}
      </p>

      {/* Core Features */}
      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Fonctionnalités de base" : "Core Features"}
      </h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555] w-[40%]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Stockage" : "Storage"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">{locale === "fr" ? "100 Mo" : "100 MB"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">{unlimited}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">{unlimited}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Liens de partage" : "Share links"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Liste de contacts" : "Contact list"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Packs et morceaux collaboratifs" : "Collab packs and tracks"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Page Link in Bio" : "Link in Bio page"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">{locale === "fr" ? "Certificat de dépôt" : "Certificate of deposit"}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Campaigns & Outreach */}
      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Campagnes et outreach" : "Campaigns & Outreach"}
      </h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555] w-[40%]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Créer des campagnes" : "Create campaigns"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">{locale === "fr" ? "1/jour" : "1/day"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">{unlimited}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">{unlimited}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Envois programmés" : "Schedule sends"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Intégration Gmail" : "Gmail integration"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Objet et corps d'email personnalisés" : "Custom email subject & body"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "A/B test des objets d'email" : "A/B test email subjects"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Programmation du meilleur moment par destinataire" : "Per-recipient best time scheduling"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Automatisations de séries" : "Series automations"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Séquences email automatisées (drip)" : "Automated email sequences (drip)"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">{locale === "fr" ? "Suggestions de relances par IA" : "AI follow-up suggestions"}</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Analytics & Tracking */}
      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Analytics et suivi" : "Analytics & Tracking"}
      </h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555] w-[40%]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Suivi des ouvertures" : "Opens tracking"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Suivi des clics" : "Clicks tracking"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Suivi de durée de lecture" : "Play duration tracking"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Téléchargements et favoris" : "Downloads & saves"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Suivi des ventes" : "Sales tracking"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Analyse du meilleur moment d'envoi" : "Best time to send analysis"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Funnels d'engagement" : "Engagement funnels"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Heatmap d'ouvertures (jour × heure)" : "Opens heatmap (day \u00d7 hour)"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">{locale === "fr" ? "WaveMatch (détection de placements)" : "WaveMatch (placement detection)"}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CRM & Pipeline */}
      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        CRM &amp; Pipeline
      </h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555] w-[40%]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Timeline de contact" : "Contact timeline"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Groupes et tags de contacts" : "Contact groups & tags"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Scoring" : "Lead scoring"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Smart Segments (segments dynamiques)" : "Smart Segments (dynamic rule-based)"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">{locale === "fr" ? "Opportunities et tableau de demandes" : "Opportunities & request board"}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sales & Marketplace */}
      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Ventes et Marketplace" : "Sales & Marketplace"}
      </h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555] w-[40%]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Vendre sur le Marketplace" : "Sell on Marketplace"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Commission marketplace" : "Marketplace commission"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">15%</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">5%</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">0%</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Checkout Stripe" : "Stripe checkout"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Types de licences (MP3, WAV, Stems, Exclusive)" : "License types (MP3, WAV, Stems, Exclusive)"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Soumissions de packs payantes (Opportunities)" : "Paid request pack submissions (Opportunities)"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">{locale === "fr" ? "Plein tarif" : "Full price"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">{locale === "fr" ? "Plein tarif" : "Full price"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{locale === "fr" ? "-50%" : "50% off"}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">{locale === "fr" ? "Tableau de bord Revenus et payouts" : "Revenue dashboard & payouts"}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Branding & Customization */}
      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Branding et personnalisation" : "Branding & Customization"}
      </h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555] w-[40%]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Profil public" : "Public profile"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Personnalisation du thème" : "Theme customization"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Crédits de placement" : "Placement credits"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Liens sociaux (IG, YT, TT)" : "Social links (IG, YT, TT)"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Embeds (lecteurs intégrables) avec tracking" : "Embeds (embeddable players) with tracking"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Domaine personnalisé pour le profil public" : "Custom domain for public profile"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Embeds brandés et codes QR" : "Branded embeds and QR codes"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "vVault Studio (publication auto vidéo)" : "vVault Studio (auto video publishing)"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">{locale === "fr" ? "Mise en avant dans la section Browse" : "Browse section highlight"}</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center text-emerald-600">{yes}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
