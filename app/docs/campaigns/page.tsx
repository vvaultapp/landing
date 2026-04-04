"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function CampaignsDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Campagnes" : "Campaigns"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Envoie ta musique par email, Instagram ou messages."
          : "Send your music via email, Instagram, or messages."}
      </p>

      {/* Channels */}
      <h2 id="channels" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Canaux" : "Channels"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "vvault prend en charge trois canaux de campagne pour atteindre tes contacts :"
          : "vvault supports three campaign channels for reaching your contacts:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">Email</strong> &mdash;{" "}
          {locale === "fr"
            ? "Le canal principal. Envoie via le système email intégré de vvault, ou connecte ton propre compte Gmail sur les plans Pro et Ultra."
            : "The primary channel. Send via vvault\u2019s built-in email system, or connect your own Gmail account on Pro and Ultra plans."}
        </li>
        <li>
          <strong className="text-[#444]">Instagram DMs</strong> &mdash;{" "}
          {locale === "fr"
            ? "Envoie des campagnes directement dans les boîtes de réception Instagram."
            : "Send campaigns directly to Instagram inboxes."}
        </li>
        <li>
          <strong className="text-[#444]">Messages (SMS)</strong> &mdash;{" "}
          {locale === "fr"
            ? "Atteins tes contacts par SMS."
            : "Reach contacts via text message."}
        </li>
      </ul>

      {/* Creating a campaign */}
      <h2 id="creating" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Créer une campagne" : "Creating a campaign"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr" ? "Pour créer une campagne :" : "To create a campaign:"}
      </p>
      <ol className="text-[14px] text-[#666] mb-4 list-decimal pl-5 space-y-1">
        <li>{locale === "fr" ? "Sélectionne ton canal de campagne (Email, Instagram ou Messages)." : "Select your campaign channel (Email, Instagram, or Messages)."}</li>
        <li>{locale === "fr" ? "Compose ton message avec un objet et un corps de texte." : "Compose your message with a subject line and body."}</li>
        <li>{locale === "fr" ? "Attache des packs ou des morceaux individuels. Chaque pack attaché génère un lien de téléchargement sécurisé pour les destinataires." : "Attach packs or individual tracks. Each pack attachment generates a secure download link for recipients."}</li>
        <li>{locale === "fr" ? "Ajoute des destinataires manuellement, depuis ta liste de contacts ou par groupe." : "Add recipients manually, from your contact list, or by group."}</li>
        <li>{locale === "fr" ? "Envoie immédiatement ou programme pour plus tard (Pro et Ultra uniquement)." : "Send immediately or schedule for later (Pro and Ultra only)."}</li>
      </ol>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Sur les plans Pro et Ultra, tu peux personnaliser l'objet et le corps de l'email. Les utilisateurs du plan Free envoient avec un modèle standard vvault."
          : "On Pro and Ultra plans, you can customize the email subject and body. Free plan users send with a standard vvault template."}
      </div>

      {/* Sending limits */}
      <h2 id="limits" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Limites d'envoi" : "Sending limits"}
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Campagnes par jour" : "Daily campaigns"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">1</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">{locale === "fr" ? "Illimité" : "Unlimited"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">{locale === "fr" ? "Illimité" : "Unlimited"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Destinataires par campagne" : "Recipients per campaign"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">5</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">{locale === "fr" ? "Illimité" : "Unlimited"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">{locale === "fr" ? "Illimité" : "Unlimited"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Envoi via Gmail" : "Gmail sending"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{locale === "fr" ? "Oui" : "Yes"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{locale === "fr" ? "Oui" : "Yes"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Programmation" : "Scheduling"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{locale === "fr" ? "Oui" : "Yes"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">{locale === "fr" ? "Oui" : "Yes"}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">{locale === "fr" ? "Relances" : "Follow-ups"}</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center text-emerald-600">{locale === "fr" ? "Oui" : "Yes"}</td>
              <td className="px-3 py-2 text-center text-emerald-600">{locale === "fr" ? "Oui" : "Yes"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Gmail integration */}
      <h2 id="gmail" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Intégration Gmail" : "Gmail integration"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Disponible sur les plans Pro et Ultra. Connecte ton compte Gmail pour que les emails de campagne soient envoyés directement depuis ta propre adresse email. Cela signifie :"
          : "Available on Pro and Ultra plans. Connect your Gmail account so that campaign emails are sent directly from your own email address. This means:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>{locale === "fr" ? "Les emails apparaissent dans la boîte de réception du destinataire comme venant de toi, pas de vvault." : "Emails appear in the recipient\u2019s inbox as coming from you, not vvault."}</li>
        <li>{locale === "fr" ? "Les réponses arrivent directement dans ta boîte Gmail." : "Replies go directly to your Gmail inbox."}</li>
        <li>{locale === "fr" ? "Meilleure délivrabilité puisque les emails viennent de ton domaine établi." : "Better deliverability since emails come from your established domain."}</li>
      </ul>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Note :</strong>{" "}
        {locale === "fr"
          ? "L'intégration Gmail utilise une authentification OAuth sécurisée et vvault ne stocke jamais ton mot de passe Gmail ni ne lit tes emails. Tu peux te déconnecter à tout moment depuis les paramètres de ton compte."
          : "Gmail integration uses secure OAuth authentication and vvault never stores your Gmail password or reads your emails. You can disconnect at any time from your account settings."}
      </div>

      {/* Scheduling */}
      <h2 id="scheduling" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Programmation" : "Scheduling"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les utilisateurs Pro et Ultra peuvent programmer des campagnes pour des dates et heures spécifiques. Au lieu d'envoyer immédiatement, choisis le moment exact où tu veux que ta campagne soit envoyée."
          : "Pro and Ultra users can schedule campaigns for specific dates and times. Instead of sending immediately, pick the exact moment you want your campaign to go out."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "vvault propose aussi une analyse du \u00ab meilleur moment d'envoi \u00bb par destinataire, qui utilise les données d'engagement pour suggérer le moment optimal d'envoi pour chaque contact en fonction du moment où il est le plus susceptible d'ouvrir et d'interagir avec tes emails."
          : "vvault also offers per-recipient \u201cbest time to send\u201d analysis, which uses engagement data to suggest the optimal send time for each individual contact based on when they are most likely to open and interact with your emails."}
      </p>
    </>
  );
}
