"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function SalesDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Ventes et Marketplace" : "Sales & Marketplace"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Vends tes beats et packs avec un checkout sécurisé, PCI-compliant et propulsé par Stripe. Les paiements et la livraison des fichiers sont entièrement chiffrés."
          : "Sell your beats and packs with secure, Stripe-powered PCI-compliant checkout. Buyer payments and file delivery are fully encrypted."}
      </p>

      {/* License types */}
      <h2 id="licenses" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Types de licences" : "License types"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "vvault prend en charge six types de licences, chacun avec des droits et formats de livraison configurables :"
          : "vvault supports six license types, each with configurable rights and deliverable formats:"}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Licence" : "License"}
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Formats" : "Formats"}
              </th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Basic</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">MP3</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Premium</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">MP3 + WAV</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Stems</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">MP3 + WAV + STEMS</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Exclusive</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Tous les formats, transfert complet des droits" : "All formats, full rights transfer"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Unlimited</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Tous les formats, utilisation illimitée" : "All formats, unlimited usage"}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium text-[#444]">Sound Kit</td>
              <td className="px-3 py-2">{locale === "fr" ? "Archive ZIP" : "ZIP archive"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Chaque type de licence a des droits configurables que tu peux activer ou désactiver :"
          : "Each license type has configurable rights that you can toggle on or off:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>{locale === "fr" ? "Utilisation commerciale" : "Commercial use"}</li>
        <li>Streaming</li>
        <li>{locale === "fr" ? "Clips vidéo" : "Music videos"}</li>
        <li>{locale === "fr" ? "Performances live" : "Live performances"}</li>
        <li>{locale === "fr" ? "Diffusion radio" : "Radio broadcasting"}</li>
        <li>{locale === "fr" ? "Licence de synchronisation" : "Sync licensing"}</li>
        <li>{locale === "fr" ? "Enregistrement Content ID" : "Content ID registration"}</li>
      </ul>

      {/* Pricing */}
      <h2 id="pricing" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Tarification" : "Pricing"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Définis des prix personnalisés pour chaque niveau de licence sur chaque morceau ou pack. Le prix minimum est de 2,99 \u20ac. vvault prend en charge la tarification multi-devises :"
          : "Set custom prices for each license tier on every track or pack. The minimum price is \u20ac2.99. vvault supports multi-currency pricing:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>EUR (&euro;)</li>
        <li>USD ($)</li>
        <li>GBP (&pound;)</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les prix sont affichés dans la devise préférée de l'acheteur au moment du checkout."
          : "Prices are displayed in the buyer\u2019s preferred currency at checkout."}
      </p>

      {/* Commission */}
      <h2 id="commission" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Commission
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "vvault prélève une commission plateforme sur chaque vente, qui varie selon l'offre :"
          : "vvault charges a platform commission on each sale, which varies by plan:"}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Type de frais" : "Fee type"}
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Commission plateforme" : "Platform commission"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">5%</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">0%</td>
            </tr>
            <tr>
              <td className="px-3 py-2">{locale === "fr" ? "Frais Stripe (approx.)" : "Stripe processing (approx.)"}</td>
              <td className="px-3 py-2 text-center" colSpan={2}>
                ~3% + {locale === "fr" ? "frais fixe" : "fixed fee"} (&euro;0.25 / $0.30 / &pound;0.20)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Note :</strong>{" "}
        {locale === "fr"
          ? "Les frais de traitement Stripe sont facturés par Stripe, pas par vvault, et s'appliquent à toutes les transactions quel que soit le plan."
          : "Stripe processing fees are charged by Stripe, not vvault, and apply to all transactions regardless of plan."}
      </div>

      {/* Payouts */}
      <h2 id="payouts" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Versements" : "Payouts"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les versements sont gérés automatiquement via Stripe. Après chaque vente, les gains sont retenus pendant 7 jours avant d'être versés sur ton compte Stripe connecté."
          : "Payouts are handled automatically through Stripe. After each sale, earnings are held for 7 days before being released to your connected Stripe account."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Pour les morceaux avec plusieurs contributeurs, vvault prend en charge les versements répartis entre co-auteurs. Les revenus sont automatiquement divisés selon les pourcentages de répartition que tu configures, et chaque co-auteur reçoit sa part directement."
          : "For tracks with multiple contributors, vvault supports co-author split payouts. Revenue is automatically divided according to the split percentages you configure, and each co-author receives their share directly."}
      </p>

      {/* Checkout flow */}
      <h2 id="checkout" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Processus de checkout" : "Checkout flow"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les acheteurs passent par un checkout propulsé par Stripe qui prend en charge :"
          : "Buyers go through a Stripe-powered checkout that supports:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>{locale === "fr" ? "Cartes de crédit et de débit" : "Credit and debit cards"}</li>
        <li>Apple Pay</li>
        <li>Google Pay</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Après un achat réussi, l'acheteur reçoit un token de téléchargement sécurisé qui lui donne accès aux fichiers achetés. Les tokens de téléchargement sont à usage unique et expirent pour empêcher toute redistribution non autorisée."
          : "After a successful purchase, the buyer receives a secure download token that grants access to the purchased files. Download tokens are single-use and expire to prevent unauthorized redistribution."}
      </p>

      {/* Checkout details */}
      <h2 id="checkout-details" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Processus d'achat détaillé" : "Checkout details"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Un flux e-commerce complet pour acheter des beats et des licences directement depuis le profil public d'un producteur."
          : "A complete e-commerce checkout flow for buying beats and licenses directly from a producer's public profile."}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">{locale === "fr" ? "Types de licence" : "License types"}</strong> — {locale === "fr" ? "MP3 Lease, WAV Lease, Stems, Exclusive — chacun avec des tarifs et conditions distincts." : "MP3 Lease, WAV Lease, Stems, Exclusive — each with distinct pricing and terms."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Génération de PDF de licence" : "License PDF generation"}</strong> — {locale === "fr" ? "PDF automatique avec ta signature, les détails de l'acheteur et les conditions d'utilisation." : "Auto-generated PDF with your signature, buyer details, and usage terms."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Post-achat" : "Post-purchase"}</strong> — {locale === "fr" ? "Les acheteurs accèdent à leurs achats avec téléchargement, PDF de licence, facture et reçu." : "Buyers access purchases with file downloads, license PDF, invoice, and receipt."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Configuration vendeur" : "Seller setup"}</strong> — {locale === "fr" ? "Upload de logo, URL de licence personnalisée, gestion des splits pour les ventes collaboratives." : "Logo upload, custom license URL, splits management for collaborative sales."}</li>
      </ul>
    </>
  );
}
