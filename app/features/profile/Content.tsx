"use client";

import { FeaturePage, type FeaturePageData } from "@/components/landing/FeaturePage";

const DATA: FeaturePageData = {
  track: "features_profile",
  docTitle: {
    en: "vvault | Your public page",
    fr: "vvault | Ta page publique",
  },
  eyebrow: { en: "Profile", fr: "Profil" },
  title: { en: "Your public page", fr: "Ta page publique" },
  subtitle: {
    en: "A professional storefront for your music.",
    fr: "Une vitrine pro pour ta musique.",
  },
  video: "/landing/features/profile",
  aspect: "1280 / 2346",
  poster: "/landing/features/profile.webp",
  media: "phone",
  sections: [
    {
      title: { en: "Your brand, front and center", fr: "Ta marque, au premier plan" },
      body: {
        en: "A polished public profile with your banner, avatar, bio, stats, and social links. Artists who visit see a professional page that builds credibility and makes buying easy.",
        fr: "Un profil public soigné avec ta bannière, ton avatar, ta bio, tes stats et tes liens sociaux. Les artistes qui visitent voient une page pro qui inspire confiance et facilite l'achat.",
      },
    },
    {
      title: { en: "Showcase your catalog", fr: "Mets en avant ton catalogue" },
      body: {
        en: "Your latest packs displayed in a visual grid with cover art, track counts, and pricing. Visitors can browse and buy without leaving your page.",
        fr: "Tes derniers packs affichés dans une grille visuelle avec cover art, nombre de tracks et prix. Les visiteurs peuvent parcourir et acheter sans quitter ta page.",
      },
    },
    {
      title: { en: "Display your credits", fr: "Affiche tes crédits" },
      body: {
        en: "Show your producer and recording credits with linked releases. Build trust by proving your track record right on your profile.",
        fr: "Montre tes crédits de producteur et d'enregistrement avec des releases liées. Construis la confiance en prouvant ton track record directement sur ton profil.",
      },
    },
  ],
  whyTitle: { en: "Why it matters", fr: "Pourquoi c'est important" },
  why: [
    {
      title: { en: "Theme customization", fr: "Personnalisation du thème" },
      desc: {
        en: "Pick from theme presets or customize accent colors and backgrounds to match your brand identity.",
        fr: "Choisis parmi des presets de thèmes ou personnalise les couleurs et fonds pour correspondre à ton identité de marque.",
      },
    },
    {
      title: { en: "Packs, kits, and series", fr: "Packs, kits et séries" },
      desc: {
        en: "Showcase your full catalog on one page. Packs, soundkits, series, and individual tracks all organized beautifully.",
        fr: "Affiche ton catalogue complet sur une page. Packs, soundkits, séries et tracks individuelles, le tout organisé avec soin.",
      },
    },
    {
      title: { en: "Placement credits", fr: "Crédits de placement" },
      desc: {
        en: "Display your producer and recording credits with linked releases on Spotify, YouTube, SoundCloud, and Apple Music.",
        fr: "Affiche tes crédits de producteur et d'enregistrement avec des releases liées sur Spotify, YouTube, SoundCloud et Apple Music.",
      },
    },
    {
      title: { en: "Social links", fr: "Liens sociaux" },
      desc: {
        en: "Connect your Instagram, YouTube, and TikTok so visitors can follow you everywhere from one page.",
        fr: "Connecte ton Instagram, YouTube et TikTok pour que les visiteurs puissent te suivre partout depuis une seule page.",
      },
    },
  ],
  finalTitle: { en: "Build your public page", fr: "Crée ta page publique" },
  finalSubtitle: {
    en: "Sign up for free and create a professional storefront for your music.",
    fr: "Inscris-toi gratuitement et crée une vitrine professionnelle pour ta musique.",
  },
  ctaLabel: { en: "Get started", fr: "Commencer" },
  ctaHref: "https://vvault.app/signup",
};

export default function FeatureProfilePage() {
  return <FeaturePage data={DATA} />;
}
