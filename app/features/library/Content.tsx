"use client";

import { FeaturePage, type FeaturePageData } from "@/components/landing/FeaturePage";

const DATA: FeaturePageData = {
  track: "features_library",
  docTitle: {
    en: "vvault | Your music library",
    fr: "vvault | Ta bibliothèque musicale",
  },
  eyebrow: { en: "Library", fr: "Bibliothèque" },
  title: { en: "Your music library", fr: "Ta bibliothèque musicale" },
  subtitle: {
    en: "Your whole catalog in one place — always accessible, always yours.",
    fr: "Tout ton catalogue au même endroit — toujours accessible, toujours à toi.",
  },
  video: "/landing/features/folder",
  aspect: "1280 / 960",
  poster: "/landing/features/folder.webp",
  media: "square",
  sections: [
    {
      title: { en: "Packs that look professional", fr: "Des packs qui ont un look pro" },
      body: {
        en: "Group your tracks into packs with cover art, metadata, and track listings. Each pack gets its own page with BPM, key, and release date for every track — ready to share with one click.",
        fr: "Regroupe tes tracks en packs avec cover art, métadonnées et tracklist. Chaque pack a sa propre page avec BPM, tonalité et date de sortie pour chaque track — prêt à partager en un clic.",
      },
    },
    {
      title: { en: "All your files, at a glance", fr: "Tous tes fichiers, en un coup d'oeil" },
      body: {
        en: "See every file you have uploaded with format, metadata, and visibility status. Control what is public, private, or still in draft — and track how much storage you are using.",
        fr: "Vois chaque fichier uploadé avec son format, ses métadonnées et son statut de visibilité. Contrôle ce qui est public, privé ou encore en brouillon — et suis ton utilisation de stockage.",
      },
    },
    {
      title: { en: "Organize everything your way", fr: "Organise tout à ta façon" },
      body: {
        en: "Nest folders inside folders. Group beats into packs, sound kits, or ongoing series. vvault mirrors the way you actually think about your catalog — not the way a file system does.",
        fr: "Imbrique des dossiers dans des dossiers. Regroupe tes beats en packs, sound kits ou séries en cours. vvault reflète la façon dont tu penses vraiment ton catalogue — pas la façon dont un système de fichiers fonctionne.",
      },
    },
  ],
  whyTitle: { en: "Why it matters", fr: "Pourquoi c'est important" },
  why: [
    {
      title: { en: "Multi-format upload", fr: "Upload multi-format" },
      desc: {
        en: "Drop MP3, WAV, stems, or full ZIPs. vvault accepts everything and stores it on a global CDN for instant playback worldwide.",
        fr: "Dépose des MP3, WAV, stems ou ZIPs complets. vvault accepte tout et stocke sur un CDN global pour une lecture instantanée partout dans le monde.",
      },
    },
    {
      title: { en: "Auto-organization", fr: "Organisation automatique" },
      desc: {
        en: "ZIP files are auto-unpacked and organized. Folder structure is preserved so your packs arrive ready to publish.",
        fr: "Les fichiers ZIP sont dézippés et organisés automatiquement. La structure de dossiers est préservée pour que tes packs arrivent prêts à publier.",
      },
    },
    {
      title: { en: "Rich metadata", fr: "Métadonnées riches" },
      desc: {
        en: "BPM, key, tags, cover art, and co-authors per track. Everything your listeners and collaborators need, attached to every file.",
        fr: "BPM, tonalité, tags, cover art et co-auteurs par track. Tout ce dont tes auditeurs et collaborateurs ont besoin, attaché à chaque fichier.",
      },
    },
    {
      title: { en: "Instant sharing", fr: "Partage instantané" },
      desc: {
        en: "Generate tracked links for any pack or folder. Know exactly who opened it, listened, and downloaded — in real time.",
        fr: "Génère des liens trackés pour n'importe quel pack ou dossier. Sache exactement qui l'a ouvert, écouté et téléchargé — en temps réel.",
      },
    },
    {
      title: { en: "Timestamped comments", fr: "Commentaires horodatés" },
      desc: {
        en: "Drop comments on specific moments of your tracks. Perfect for giving feedback, discussing arrangements with collaborators, or pointing an artist to a key section.",
        fr: "Laisse des commentaires sur des passages précis de tes tracks. Idéal pour donner du feedback, discuter avec des collaborateurs ou pointer un moment clé à un artiste.",
      },
    },
  ],
  finalTitle: { en: "Start building your library", fr: "Commence à construire ta Library" },
  finalSubtitle: {
    en: "Sign up for free and upload your first pack in minutes. Your catalog deserves a proper home.",
    fr: "Inscris-toi gratuitement et upload ton premier pack en quelques minutes. Ton catalogue mérite un vrai chez-soi.",
  },
  ctaLabel: { en: "Get started", fr: "Commencer" },
  ctaHref: "https://vvault.app/signup",
};

export default function FeatureLibraryPage() {
  return <FeaturePage data={DATA} />;
}
