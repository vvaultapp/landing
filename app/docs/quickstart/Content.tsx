"use client";

import Link from "next/link";
import { useDocsLocale } from "../DocsLocaleContext";

export default function QuickstartPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Pour commencer" : "Getting Started"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Démarrage rapide" : "Quickstart"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Lance-toi sur vvault en moins de 5 minutes."
          : "Get up and running with vvault in under 5 minutes."}
      </p>

      {/* Create your account */}
      <h2 id="create-account" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Crée ton compte" : "Create your account"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr" ? (
          <>
            Rends-toi sur{" "}
            <a href="https://vvault.app/signup" className="text-emerald-600 underline underline-offset-2">
              vvault.app
            </a>{" "}
            et inscris-toi avec ton email ou ton compte Google. Une fois inscrit, choisis ton nom d&apos;affichage, ton identifiant unique (qui deviendra ton URL publique) et importe une photo de profil.
          </>
        ) : (
          <>
            Head to{" "}
            <a href="https://vvault.app/signup" className="text-emerald-600 underline underline-offset-2">
              vvault.app
            </a>{" "}
            and sign up with your email or Google account. Once registered, set your display name, unique handle (this becomes your public URL), and upload a profile picture.
          </>
        )}
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr" ? (
          <>
            Ton identifiant détermine l&apos;URL de ton profil public :{" "}
            <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[13px] text-emerald-600 font-mono">
              vvault.app/@tonidentifiant
            </code>
            . Choisis quelque chose de mémorable.
          </>
        ) : (
          <>
            Your handle determines your public profile URL at{" "}
            <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[13px] text-emerald-600 font-mono">
              vvault.app/@yourhandle
            </code>
            . Choose something memorable.
          </>
        )}
      </div>

      {/* Upload your first tracks */}
      <h2 id="upload-tracks" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Importe tes premiers morceaux" : "Upload your first tracks"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Va dans ta Library et glisse-dépose tes fichiers audio directement dans la zone d'import, ou utilise le sélecteur de fichiers. vvault prend en charge les formats suivants :"
          : "Navigate to your Library and drag and drop audio files directly into the upload area, or use the file picker. vvault supports the following formats:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>WAV</li>
        <li>MP3</li>
        <li>FLAC</li>
        <li>AIF / AIFF</li>
        <li>OGG</li>
        <li>M4A</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr" ? (
          <>
            Tu peux aussi importer des <strong className="text-[#444]">fichiers ZIP</strong> &mdash; ils sont automatiquement extraits et tous les fichiers audio à l&apos;intérieur sont importés. Les métadonnées comme le BPM et la tonalité sont automatiquement détectées à partir des noms de fichiers.
          </>
        ) : (
          <>
            You can also upload <strong className="text-[#444]">ZIP files</strong> &mdash; they auto-extract and import all audio files inside. Metadata like BPM and musical key is automatically parsed from filenames when detected.
          </>
        )}
      </p>

      {/* Create a pack */}
      <h2 id="create-pack" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Crée un pack" : "Create a pack"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Organise tes morceaux en packs. Chaque pack peut avoir son propre artwork — importe une image de couverture au format PNG, JPG, WEBP ou GIF (max 20 Mo)."
          : "Organize your tracks into packs. Each pack can have custom artwork \u2014 upload a cover image in PNG, JPG, WEBP, or GIF format (max 20 MB)."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Définis la visibilité de ton pack pour contrôler qui peut y accéder :"
          : "Set your pack visibility to control who can access it:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Privé" : "Private"}</strong> &mdash;{" "}
          {locale === "fr" ? "Toi seul peux voir et accéder au pack." : "Only you can see and access the pack."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Lien uniquement" : "Link-only"}</strong> &mdash;{" "}
          {locale === "fr" ? "Toute personne ayant le lien direct peut voir le pack." : "Anyone with the direct link can view the pack."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Public" : "Public"}</strong> &mdash;{" "}
          {locale === "fr" ? "Visible sur ton profil public et dans la recherche." : "Visible on your public profile and in search."}
        </li>
      </ul>

      {/* Build your contact list */}
      <h2 id="build-contacts" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Constitue ta liste de contacts" : "Build your contact list"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Avant d'envoyer des campagnes, tu as besoin de destinataires. Va dans Contacts et importe ta liste d'emails existante (A&Rs, labels, artistes) depuis un fichier CSV ou XLSX — vvault détecte automatiquement les colonnes email, nom et entreprise. Tu peux aussi ajouter des contacts manuellement un par un."
          : "Before sending campaigns, you need recipients. Head to Contacts and import your existing email list (A&Rs, labels, artists) from a CSV or XLSX file — vvault auto-detects email, name, and company columns. You can also add contacts manually one at a time."}
      </p>
      <div className="rounded-xl border-l-2 border-emerald-400 bg-emerald-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Si tu as déjà une liste dans Gmail, Mailchimp ou un Google Sheet, exporte-la en CSV et glisse-la directement dans vvault. Organise ensuite tes contacts avec des tags (ex. « Labels US », « A&Rs hip-hop ») pour cibler tes campagnes."
          : "If you already have a list in Gmail, Mailchimp, or a Google Sheet, export it as CSV and drop it directly into vvault. Then organize contacts with tags (e.g. \u201cUS Labels\u201d, \u201cHip-hop A&Rs\u201d) to target your campaigns."}
      </div>

      {/* Send your first campaign */}
      <h2 id="send-campaign" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Envoie ta première campagne" : "Send your first campaign"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Va dans la section Campaigns et crée une nouvelle campagne. Compose ton message, attache un pack ou des morceaux individuels, et sélectionne tes destinataires depuis tes Contacts. vvault génère des liens de téléchargement sécurisés pour chaque pack attaché."
          : "Go to the Campaigns section and create a new campaign. Compose your message, attach a pack or individual tracks, and select recipients from your Contacts. vvault generates secure download links for each pack attachment."}
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Limites du plan Free :" : "Free plan limits:"}</strong>{" "}
        {locale === "fr"
          ? "1 campagne par jour avec un maximum de 5 destinataires par campagne. Passe au plan Pro ou Ultra pour des campagnes et destinataires illimités."
          : "1 campaign per day with a maximum of 5 recipients per campaign. Upgrade to Pro or Ultra for unlimited campaigns and recipients."}
      </div>

      {/* Track engagement */}
      <h2 id="track-engagement" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Suis l'engagement" : "Track engagement"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Après l'envoi d'une campagne, consulte ton tableau de bord Analytics pour suivre comment les destinataires interagissent avec ta musique. vvault suit :"
          : "After sending a campaign, visit your Analytics dashboard to monitor how recipients interact with your music. vvault tracks:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Ouvertures" : "Opens"}</strong> &mdash;{" "}
          {locale === "fr" ? "Qui a ouvert ton email" : "Who opened your email"}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Clics" : "Clicks"}</strong> &mdash;{" "}
          {locale === "fr" ? "Qui a cliqué vers ton contenu" : "Who clicked through to your content"}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Lectures" : "Plays"}</strong> &mdash;{" "}
          {locale === "fr" ? "Qui a écouté tes morceaux" : "Who listened to your tracks"}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Téléchargements" : "Downloads"}</strong> &mdash;{" "}
          {locale === "fr" ? "Qui a téléchargé tes fichiers" : "Who downloaded your files"}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Favoris" : "Saves"}</strong> &mdash;{" "}
          {locale === "fr" ? "Qui a mis en favori ou sauvegardé tes morceaux" : "Who favorited or saved your tracks"}
        </li>
      </ul>

      {/* Next steps */}
      <h2 id="next-steps" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Prochaines étapes" : "Next steps"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Maintenant que tu as les bases, explore tout ce que vvault a à offrir :"
          : "Now that you have the basics down, explore more of what vvault offers:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <Link href="/docs/library" className="text-emerald-600 underline underline-offset-2">
            {locale === "fr" ? "Bibliothèque" : "Library"}
          </Link>{" "}
          &mdash; {locale === "fr" ? "Paramètres d'import avancés, dossiers et métadonnées" : "Advanced upload settings, folders, and metadata"}
        </li>
        <li>
          <Link href="/docs/campaigns" className="text-emerald-600 underline underline-offset-2">
            {locale === "fr" ? "Campagnes" : "Campaigns"}
          </Link>{" "}
          &mdash; {locale === "fr" ? "Intégration Gmail, programmation et relances" : "Gmail integration, scheduling, and follow-ups"}
        </li>
        <li>
          <Link href="/docs/analytics" className="text-emerald-600 underline underline-offset-2">
            {locale === "fr" ? "Analytiques" : "Analytics"}
          </Link>{" "}
          &mdash; {locale === "fr" ? "Funnels d'engagement, heatmaps et analyse du meilleur moment d'envoi" : "Engagement funnels, heatmaps, and best-time analysis"}
        </li>
        <li>
          <Link href="/docs/contacts" className="text-emerald-600 underline underline-offset-2">
            Contacts
          </Link>{" "}
          &mdash; {locale === "fr" ? "CRM, scoring et timeline de contact" : "CRM, lead scoring, and contact timeline"}
        </li>
        <li>
          <Link href="/docs/sales" className="text-emerald-600 underline underline-offset-2">
            {locale === "fr" ? "Ventes et Marketplace" : "Sales & Marketplace"}
          </Link>{" "}
          &mdash; {locale === "fr" ? "Vends tes beats avec le checkout Stripe" : "Sell your beats with Stripe checkout"}
        </li>
      </ul>
    </>
  );
}
