"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function WaveMatchDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        vvault Studio
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        WaveMatch
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Trouve qui a utilisé tes prods sur les plateformes de streaming."
          : "Find who used your beats across streaming platforms."}
      </p>

      {/* Overview */}
      <h2 id="overview" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Vue d'ensemble" : "Overview"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "WaveMatch est un outil d'identification de contenu musical qui permet aux producteurs de retrouver qui a utilisé leurs prods sur YouTube, Spotify et Apple Music. Upload un fichier audio ou sélectionne un morceau depuis ton stockage, et WaveMatch scanne les plateformes de streaming pour détecter les utilisations identiques ou dérivées."
          : "WaveMatch is a music content identification and beat matching tool that lets producers find who used their beats across YouTube, Spotify, and Apple Music. Upload an audio file or select a track from your storage, and WaveMatch scans streaming platforms to detect matching or derivative uses."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Idéal pour découvrir des placements non crédités, négocier des royalties, ou réclamer des revenus via Content ID. Si tu te demandes si ton beat a été volé ou utilisé sans autorisation, WaveMatch te donne la réponse."
          : "Great for discovering uncredited placements, negotiating royalties for unauthorized use, or claiming YouTube Content ID revenue. If you're wondering whether your beat was stolen or used without permission, WaveMatch gives you the answer — it's the content ID tool built for producers."}
      </p>

      {/* Upload methods */}
      <h2 id="upload-methods" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Méthodes d'upload" : "Upload methods"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Trois façons de lancer un scan :"
          : "Three ways to scan your beats for unauthorized use:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Fichier local" : "Local file"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Glisse-dépose ou parcours tes fichiers audio (MP3, WAV, M4A, FLAC, OGG — max 50 Mo)."
            : "Drag-and-drop or browse for an audio file (MP3, WAV, M4A, FLAC, OGG — max 50 MB)."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Stockage" : "Storage"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Sélectionne un morceau déjà uploadé dans ta bibliothèque vVault."
            : "Select a track already uploaded to your vVault library."}
        </li>
        <li>
          <strong className="text-[#444]">Autoscan</strong> &mdash;{" "}
          {locale === "fr"
            ? "Scan automatique de tout ton catalogue selon un calendrier programmé."
            : "Automated scanning of your entire catalog on a schedule — monitor your beats for new uses automatically."}
        </li>
      </ul>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Utilise Autoscan pour surveiller automatiquement ton catalogue et être notifié dès qu'une nouvelle utilisation de tes prods est détectée."
          : "Use Autoscan to automatically check if your beats are being used without permission. You'll be notified whenever a new match is found across platforms."}
      </div>

      {/* Results & history */}
      <h2 id="results" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Résultats & historique" : "Results & history"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Après un scan, WaveMatch affiche les morceaux, vidéos et sorties correspondants trouvés sur les plateformes. Consulte les scans passés et leurs résultats à tout moment."
          : "After a scan completes, WaveMatch surfaces matching songs, videos, and releases found across platforms. View past scans and their results at any time to build a complete record of where your beats appear."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Chaque correspondance affiche la plateforme, le titre de la chanson ou vidéo, l'artiste, et un lien vers le contenu."
          : "Each match shows the platform, song or video title, artist name, and a direct link to the content — making it easy to find unauthorized uses of your beats and take action."}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Champ" : "Field"}
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Description" : "Description"}
              </th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Plateforme" : "Platform"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">YouTube, Spotify, Apple Music</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Titre" : "Title"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Nom de la chanson ou vidéo" : "Song or video name"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Artiste" : "Artist"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Nom de l'artiste ou de la chaîne" : "Artist or channel name"}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">{locale === "fr" ? "Lien" : "Link"}</td>
              <td className="px-3 py-2">{locale === "fr" ? "Lien direct vers le contenu" : "Direct link to the content"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Use cases */}
      <h2 id="use-cases" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Cas d'utilisation" : "Use cases"}
      </h2>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>{locale === "fr" ? "Découvrir des placements non crédités sur les plateformes de streaming" : "Discover uncredited placements on streaming platforms"}</li>
        <li>{locale === "fr" ? "Négocier des royalties pour utilisation non autorisée" : "Negotiate royalties for unauthorized use of your beats"}</li>
        <li>{locale === "fr" ? "Réclamer des revenus YouTube Content ID" : "Claim YouTube Content ID revenue"}</li>
        <li>{locale === "fr" ? "Surveiller ton catalogue pour détecter automatiquement de nouvelles utilisations avec Autoscan" : "Monitor your catalog for new uses automatically with Autoscan"}</li>
        <li>{locale === "fr" ? "Construire un historique de tous les endroits où tes prods apparaissent" : "Build a record of where your beats appear across all platforms"}</li>
      </ul>

      {/* Availability */}
      <h2 id="availability" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Disponibilité" : "Availability"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "WaveMatch est disponible sur studio.vvault.app pour tous les utilisateurs de vvault."
          : "WaveMatch is available on studio.vvault.app for all vvault users."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr" ? (
          <>
            Pour commencer avec WaveMatch,{" "}
            <a href="https://vvault.app/signup?plan=ultra" className="text-emerald-600 underline underline-offset-2">
              crée un compte
            </a>{" "}
            ou passe au plan Ultra depuis tes paramètres de facturation.
          </>
        ) : (
          <>
            To get started with WaveMatch,{" "}
            <a href="https://vvault.app/signup?plan=ultra" className="text-emerald-600 underline underline-offset-2">
              sign up
            </a>{" "}
            or upgrade to Ultra from your billing settings.
          </>
        )}
      </p>
    </>
  );
}
