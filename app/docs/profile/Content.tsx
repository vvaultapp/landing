"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function ProfileDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Profil" : "Profile"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Ta page publique avec ton branding personnalisé."
          : "Your public page with custom branding."}
      </p>

      {/* Public page */}
      <h2 id="public-page" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Page publique" : "Public page"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr" ? (
          <>
            Chaque utilisateur vvault obtient une page de profil publique à{" "}
            <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[13px] text-emerald-600 font-mono">
              vvault.app/@tonidentifiant
            </code>
            . Ton profil sert de landing page pour ta musique et ta marque.
          </>
        ) : (
          <>
            Every vvault user gets a public profile page at{" "}
            <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[13px] text-emerald-600 font-mono">
              vvault.app/@yourhandle
            </code>
            . Your profile serves as a landing page for your music and brand.
          </>
        )}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr" ? "Ta page publique affiche :" : "Your public page displays:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>{locale === "fr" ? "Photo de profil et image de bannière" : "Profile picture and banner image"}</li>
        <li>{locale === "fr" ? "Bio et nom d'affichage" : "Bio and display name"}</li>
        <li>{locale === "fr" ? "Morceaux publics" : "Public tracks"}</li>
        <li>Packs</li>
        <li>Sound kits</li>
        <li>{locale === "fr" ? "Séries" : "Series"}</li>
      </ul>

      {/* Placements */}
      <h2 id="placements" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Placements
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Mets en avant tes crédits de placement directement sur ton profil. Les placements peuvent être ajoutés depuis les plateformes suivantes :"
          : "Showcase your placement credits directly on your profile. Placements can be added from the following platforms:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Spotify</li>
        <li>YouTube</li>
        <li>SoundCloud</li>
        <li>Apple Music</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Tu peux aussi ajouter des entrées manuelles pour les placements sur d'autres plateformes ou dans des médias qui ne sont pas liés à un service de streaming. Les placements apparaissent en évidence sur ton profil pour renforcer ta crédibilité auprès des acheteurs et collaborateurs potentiels."
          : "You can also add manual entries for placements on other platforms or in media that isn\u2019t linked to a streaming service. Placements appear prominently on your profile to build credibility with potential buyers and collaborators."}
      </p>

      {/* Social links */}
      <h2 id="social" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Liens sociaux" : "Social links"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Ajoute tes liens de réseaux sociaux à ton profil pour que les visiteurs puissent te retrouver sur les différentes plateformes :"
          : "Add your social media links to your profile so visitors can find you across platforms:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Instagram</li>
        <li>YouTube</li>
        <li>TikTok</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les liens sociaux sont affichés sous forme d'icônes sur ta page de profil publique."
          : "Social links are displayed as icons on your public profile page."}
      </p>

      {/* Theme customization */}
      <h2 id="themes" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Personnalisation du thème" : "Theme customization"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Disponible sur les plans Pro et Ultra. Personnalise l'apparence de ton profil public avec des options de thème :"
          : "Available on Pro and Ultra plans. Customize the look and feel of your public profile with theme options:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Images d'arrière-plan personnalisées" : "Custom background images"}</strong> &mdash;{" "}
          {locale === "fr" ? "Importe une image d'arrière-plan pour ta page de profil." : "Upload a background image for your profile page."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Thèmes prédéfinis" : "Theme presets"}</strong> &mdash;{" "}
          {locale === "fr" ? "Choisis parmi plusieurs styles de thèmes prêts à l'emploi." : "Choose from multiple pre-built theme styles."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Variables de couleur CSS" : "CSS color variables"}</strong> &mdash;{" "}
          {locale === "fr" ? "Ajuste individuellement les couleurs de fond, texte, accent, carte et bordure." : "Fine-tune individual colors for background, foreground, accent, card, and border elements."}
        </li>
      </ul>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Note :</strong>{" "}
        {locale === "fr"
          ? "La mise en avant dans la section Browse est une fonctionnalité exclusive Ultra qui donne à ton profil une visibilité accrue dans le répertoire vvault."
          : "Browse section highlight is an Ultra-exclusive feature that gives your profile enhanced visibility in the vvault browse directory."}
      </div>

      {/* Placements & Credits */}
      <h2 id="placements" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Placements & crédits" : "Placements & Credits"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Affiche tes placements vérifiés et tes crédits de production directement sur ton profil public. Montre ton travail sur Spotify, YouTube, SoundCloud et Apple Music."
          : "Showcase your verified placements and production credits directly on your public profile. Display your work across Spotify, YouTube, SoundCloud, and Apple Music."}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">{locale === "fr" ? "Placements vérifiés" : "Verified placements"}</strong> — {locale === "fr" ? "Affiche les placements avec le titre, l'artiste, le badge de la plateforme et le rôle." : "Display placements with song title, artist, platform badge, and role."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Rôles multiples" : "Multiple roles"}</strong> — {locale === "fr" ? "Producteur, auteur-compositeur, ingénieur, mixeur, et plus." : "Producer, songwriter, engineer, mixer, and more."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Liens externes" : "External links"}</strong> — {locale === "fr" ? "Clique pour ouvrir le morceau sur la plateforme de streaming." : "Click to open the track on the respective streaming platform."}</li>
        <li><strong className="text-[#444]">{locale === "fr" ? "Ordre personnalisable" : "Customizable order"}</strong> — {locale === "fr" ? "Glisse pour réorganiser tes placements." : "Drag-to-reorder your placements."}</li>
      </ul>
    </>
  );
}
