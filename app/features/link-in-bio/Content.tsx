"use client";

import { FeaturePage, type FeaturePageData } from "@/components/landing/FeaturePage";

const DATA: FeaturePageData = {
  track: "features_link_in_bio",
  docTitle: {
    en: "vvault | Link in Bio",
    fr: "vvault | Lien en bio",
  },
  eyebrow: { en: "Link in bio", fr: "Lien en bio" },
  title: { en: "Link in Bio", fr: "Lien en bio" },
  subtitle: {
    en: "One link for your packs, soundkits, tracks, and placements.",
    fr: "Un seul lien pour tes packs, soundkits, tracks et placements.",
  },
  video: "/landing/features/profile",
  aspect: "1280 / 2346",
  poster: "/landing/features/profile.webp",
  media: "phone",
  sections: [
    {
      title: { en: "Your page, your brand", fr: "Ta page, ta marque" },
      body: {
        en: "Your public profile at vvault.app/@handle showcases your packs, soundkits, tracks, and placement credits. Share one link everywhere — visitors can preview, stream, and purchase directly.",
        fr: "Ton profil public sur vvault.app/@pseudo met en avant tes packs, soundkits, tracks et crédits de placement. Partage un seul lien partout — les visiteurs peuvent écouter, streamer et acheter directement.",
      },
    },
    {
      title: { en: "Showcase your placements", fr: "Mets en avant tes placements" },
      body: {
        en: "Display your credits and placements directly on your profile. Link to Spotify, Apple Music, YouTube, and SoundCloud so visitors can hear your work in context.",
        fr: "Affiche tes crédits et placements directement sur ton profil. Lie vers Spotify, Apple Music, YouTube et SoundCloud pour que les visiteurs puissent écouter ton travail en contexte.",
      },
    },
  ],
  whyTitle: { en: "Why it matters", fr: "Pourquoi c'est important" },
  why: [
    {
      title: { en: "One link for everything", fr: "Un seul lien pour tout" },
      desc: {
        en: "Your vvault profile shows packs, soundkits, tracks, and placements in a single branded page. Share one link everywhere.",
        fr: "Ton profil vvault affiche tes packs, soundkits, tracks et placements sur une seule page brandée. Partage un seul lien partout.",
      },
    },
    {
      title: { en: "Built-in audio player", fr: "Lecteur audio intégré" },
      desc: {
        en: "Visitors can preview your beats directly on your profile. No external links needed to hear your work.",
        fr: "Les visiteurs peuvent écouter tes beats directement sur ton profil. Pas besoin de liens externes pour découvrir ton travail.",
      },
    },
    {
      title: { en: "Theme customization", fr: "Personnalisation du thème" },
      desc: {
        en: "Pick from theme presets or customize colors and backgrounds to match your artist brand.",
        fr: "Choisis parmi des thèmes prédéfinis ou personnalise les couleurs et arrière-plans pour coller à ton image d'artiste.",
      },
    },
    {
      title: { en: "Placement credits", fr: "Crédits de placement" },
      desc: {
        en: "Show your credits with links to Spotify, Apple Music, YouTube, and SoundCloud. Let your work speak for itself.",
        fr: "Affiche tes crédits avec des liens vers Spotify, Apple Music, YouTube et SoundCloud. Laisse ton travail parler de lui-même.",
      },
    },
  ],
  finalTitle: { en: "Claim your link page", fr: "Réclame ta page" },
  finalSubtitle: {
    en: "Sign up for free and start sharing all your content from one beautiful page.",
    fr: "Inscris-toi gratuitement et commence à partager tout ton contenu depuis une seule page.",
  },
  ctaLabel: { en: "Get started", fr: "Commencer" },
  ctaHref: "https://vvault.app/signup",
};

export default function FeatureLinkInBioPage() {
  return <FeaturePage data={DATA} />;
}
