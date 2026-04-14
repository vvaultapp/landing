"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function LibraryDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Bibliothèque" : "Library"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Importe, organise et gère ton catalogue musical dans une interface épurée et agréable à utiliser. Tous les fichiers sont stockés sur une infrastructure chiffrée et restent privés par défaut."
          : "Upload, organize, and manage your music catalog in a clean, delightful interface. All files are stored on encrypted infrastructure and remain private by default."}
      </p>

      {/* Uploading files */}
      <h2 id="uploading" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Import de fichiers" : "Uploading files"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Importe des fichiers audio par glisser-déposer ou via le sélecteur de fichiers. vvault prend en charge les formats audio suivants :"
          : "Upload audio files via drag-and-drop or the file picker. vvault supports the following audio formats:"}
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
        {locale === "fr"
          ? "Les fichiers ZIP sont aussi acceptés et seront automatiquement extraits pour importer tous les fichiers audio qu'ils contiennent."
          : "ZIP files are also accepted and will be automatically extracted to import all audio files inside."}
      </p>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Paramètres automatiques" : "Auto settings"}
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "vvault propose plusieurs options de traitement automatique que tu peux activer dans tes paramètres d'import :"
          : "vvault provides several automatic processing options that can be toggled in your upload settings:"}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Paramètre" : "Setting"}
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">auto_unpack_zip</code>
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                {locale === "fr" ? "Extraire automatiquement les fichiers audio des ZIP importés" : "Automatically extract audio from uploaded ZIP files"}
              </td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">auto_pack_from_import</code>
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                {locale === "fr" ? "Créer automatiquement un pack à partir d'un import groupé" : "Automatically create a pack from a batch import"}
              </td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">auto_parse_coauthors</code>
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                {locale === "fr" ? "Détecter les @identifiants dans les noms de fichiers et ajouter les co-auteurs automatiquement" : "Parse @handles from filenames and add co-authors automatically"}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2">
                <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">auto_convert_wav_to_mp3</code>
              </td>
              <td className="px-3 py-2">
                {locale === "fr" ? "Générer une version MP3 en plus de chaque WAV importé pour un streaming plus rapide" : "Generate an MP3 version alongside each WAV upload for faster streaming"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Storage limits */}
      <h2 id="storage" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Limites de stockage" : "Storage limits"}
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Offre" : "Plan"}
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Stockage" : "Storage"}
              </th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Free</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "100 Mo" : "100 MB"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Pro</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Illimité" : "Unlimited"}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Ultra</td>
              <td className="px-3 py-2">{locale === "fr" ? "Illimité" : "Unlimited"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Packs */}
      <h2 id="packs" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Packs
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les packs te permettent de regrouper des morceaux en collections pour le partage et la vente. Chaque pack peut avoir son propre artwork de couverture."
          : "Packs let you group tracks into collections for sharing and selling. Each pack can have its own cover artwork."}
      </p>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Visuel" : "Artwork"}
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Importe un artwork au format PNG, JPG, WEBP, GIF, AVIF ou HEIC. Taille maximale : 20 Mo."
          : "Upload artwork in PNG, JPG, WEBP, GIF, AVIF, or HEIC format. Maximum file size is 20 MB."}
      </p>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Visibilité" : "Visibility"}
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Chaque pack a l'un des trois niveaux de visibilité :"
          : "Each pack has one of three visibility levels:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Privé" : "Private"}</strong> &mdash;{" "}
          {locale === "fr" ? "Visible uniquement par toi et les collaborateurs invités." : "Only visible to you and invited collaborators."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Lien uniquement" : "Link-only"}</strong> &mdash;{" "}
          {locale === "fr" ? "Accessible à toute personne ayant le lien direct, mais non listé publiquement." : "Accessible to anyone with the direct link, but not listed publicly."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Public" : "Public"}</strong> &mdash;{" "}
          {locale === "fr" ? "Visible sur ton profil, dans les résultats de recherche et sur la marketplace." : "Visible on your profile, in search results, and on the marketplace."}
        </li>
      </ul>

      {/* Metadata */}
      <h2 id="metadata" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Métadonnées" : "Metadata"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "vvault extrait automatiquement les métadonnées de tes noms de fichiers pour te faire gagner du temps."
          : "vvault automatically extracts metadata from your filenames to save you time."}
      </p>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Détection du BPM" : "BPM detection"}
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr" ? (
          <>
            Les valeurs de BPM entre 60 et 220 sont automatiquement détectées quand elles sont incluses dans le nom du fichier (ex.{" "}
            <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">
              MyBeat_140bpm.wav
            </code>
            ).
          </>
        ) : (
          <>
            BPM values between 60 and 220 are automatically detected when included in the filename (e.g.,{" "}
            <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">
              MyBeat_140bpm.wav
            </code>
            ).
          </>
        )}
      </p>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Tonalité" : "Musical key"}
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "La tonalité est détectée à partir des noms de fichiers quand elle est présente (ex. Cmin, Amaj, F#m)."
          : "Musical key is parsed from filenames when present (e.g., Cmin, Amaj, F#m)."}
      </p>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        {locale === "fr" ? "Détection des co-auteurs" : "Co-author parsing"}
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr" ? (
          <>
            Quand{" "}
            <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">
              auto_parse_coauthors
            </code>{" "}
            est activé, les @identifiants trouvés dans les noms de fichiers sont automatiquement ajoutés comme co-auteurs. Un maximum de 3 co-auteurs peut être ajouté par morceau.
          </>
        ) : (
          <>
            When{" "}
            <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">
              auto_parse_coauthors
            </code>{" "}
            is enabled, @handles found in filenames are automatically added as co-authors. A maximum of 3 co-authors can be added per track.
          </>
        )}
      </p>

      {/* Timestamped comments */}
      <h2 id="comments" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Commentaires horodatés" : "Timestamped comments"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Laisse des commentaires sur des moments précis de n'importe quel track. Clique sur la forme d'onde pour marquer un timestamp, tape ton commentaire, et il apparaîtra ancré à ce passage. Les collaborateurs et contacts qui écoutent le track verront tes commentaires en temps réel."
          : "Drop comments on specific moments of any track. Click the waveform to mark a timestamp, type your comment, and it will appear anchored to that moment. Collaborators and contacts listening to the track will see your comments in real time."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les commentaires horodatés sont parfaits pour donner du feedback sur un arrangement, pointer un passage clé à un artiste ou un A&R, ou simplement discuter de sections spécifiques avec tes co-auteurs."
          : "Timestamped comments are perfect for giving feedback on an arrangement, pointing an artist or A&R to a key section, or simply discussing specific parts with your co-authors."}
      </p>

      {/* Folders */}
      <h2 id="folders" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Dossiers" : "Folders"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Organise ta bibliothèque avec une structure de dossiers en glisser-déposer. Déplace tes morceaux et packs entre les dossiers librement."
          : "Organize your library with a drag-and-drop folder structure. Move tracks and packs between folders freely."}
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Note :</strong>{" "}
        {locale === "fr"
          ? "Les éléments récemment supprimés sont récupérables depuis la corbeille. Tu peux restaurer les morceaux et packs supprimés par accident."
          : "Recently deleted items are recoverable from the trash. You can restore tracks and packs that were accidentally removed."}
      </div>
    </>
  );
}
