"use client";

import { FeaturePage, type FeaturePageData } from "@/components/landing/FeaturePage";

const DATA: FeaturePageData = {
  track: "features_studio",
  docTitle: {
    en: "vvault | Studio — Automated Publishing",
    fr: "vvault | Studio — Publication automatique",
  },
  eyebrow: { en: "Studio", fr: "Studio" },
  title: {
    en: "A studio that runs while you make music.",
    fr: "Un studio qui tourne pendant que tu fais de la musique.",
  },
  subtitle: {
    en: "Auto-publish videos from your tracks to YouTube, TikTok, and Instagram.",
    fr: "Publie des vidéos de tes sons sur YouTube, TikTok et Instagram, en auto.",
  },
  video: "/landing/features/studio",
  aspect: "1280 / 1878",
  poster: "/landing/features/studio.webp",
  media: "phone",
  sections: [
    {
      title: {
        en: "Ship to every platform without touching it.",
        fr: "Publie sur chaque plateforme sans y toucher.",
      },
      body: {
        en: "Connect your accounts once. Studio turns your tracks into videos and drops them on YouTube, TikTok, and Instagram on an interval — while you sleep, while you mix.",
        fr: "Connecte tes comptes une fois. Studio transforme tes morceaux en vidéos et les dépose sur YouTube, TikTok et Instagram à intervalle régulier — pendant que tu dors, pendant que tu mixes.",
      },
    },
    {
      title: {
        en: "Every video, in your brand.",
        fr: "Chaque vidéo, à ton image.",
      },
      body: {
        en: "Pick a template, wire in dynamic tokens (title, BPM, key, cover) — Studio renders a clean video for every track, on your brand, automatically.",
        fr: "Choisis un modèle, branche des tokens dynamiques (titre, BPM, key, cover) — Studio rend une vidéo propre pour chaque track, avec ta mise en forme, automatiquement.",
      },
    },
    {
      title: {
        en: "Set your cadence. Studio keeps tempo.",
        fr: "Règle ta cadence. Studio tient le tempo.",
      },
      body: {
        en: "Set the posting interval, timezone, and start time. Studio holds your rhythm for months without missing a slot, and self-resumes if the connection drops.",
        fr: "Définis l'intervalle de publication, le fuseau horaire et l'heure de départ. Studio respecte ton rythme sur des mois sans rater un créneau, et se remet en route tout seul si ta connexion coupe.",
      },
    },
    {
      title: {
        en: "One pack. One config. A whole catalogue online.",
        fr: "Un pack. Une config. Tout un catalogue en ligne.",
      },
      body: {
        en: "Configure a Studio Pack in vvault — Studio takes it from there. Enable auto-publish, pick a template, set an interval: Studio executes, indefinitely, without duplicate pushes thanks to a sync lock.",
        fr: "Configure un Studio Pack dans vvault — Studio prend le relais. Active l'auto-publication, choisis un modèle, pose un intervalle : Studio exécute, indéfiniment, sans doubles envois grâce à un verrou de synchro.",
      },
    },
  ],
  whyTitle: { en: "Why it matters", fr: "Pourquoi c'est important" },
  why: [
    {
      title: { en: "Publishes everywhere", fr: "Publie partout" },
      desc: {
        en: "Publishes to YouTube, TikTok, and Instagram with a live queue you can watch tick down — plus a manual trigger for an emergency push.",
        fr: "Publication sur YouTube, TikTok et Instagram avec une file d'attente visible en direct — et un déclenchement manuel pour un push d'urgence.",
      },
    },
    {
      title: { en: "On-brand templates", fr: "Modèles à ton image" },
      desc: {
        en: "Dynamic tokens — title, BPM, key, cover — render every clip on your brand, with a cover fallback when a track is missing one.",
        fr: "Tokens dynamiques — titre, BPM, key, cover — rendent chaque clip à ton image, avec un fallback de cover si une cover manque.",
      },
    },
    {
      title: { en: "Keeps tempo for months", fr: "Tient le tempo des mois" },
      desc: {
        en: "Set the interval in hours or days with per-pack timezone handling. Studio holds your rhythm and auto-resumes after any interruption.",
        fr: "Règle l'intervalle en heures ou en jours avec un fuseau horaire par pack. Studio tient ton rythme et reprend automatiquement après interruption.",
      },
    },
    {
      title: { en: "One config per pack", fr: "Une config par pack" },
      desc: {
        en: "Enable a Studio Pack in a click and let it run indefinitely. A sync lock prevents duplicate posts. Available on the Ultra plan.",
        fr: "Active un Studio Pack en un clic et laisse-le tourner indéfiniment. Un verrou de synchro empêche les doublons. Réservé au plan Ultra.",
      },
    },
  ],
  finalTitle: {
    en: "Ready to let Studio take over?",
    fr: "Prêt à laisser Studio s'en charger ?",
  },
  finalSubtitle: {
    en: "Available on the Ultra plan. The docs walk you through wiring it up in under ten minutes.",
    fr: "Disponible avec le plan Ultra. La doc t'apprend à tout câbler en moins de dix minutes.",
  },
  ctaLabel: {
    en: "Get started with Ultra",
    fr: "Démarrer avec Ultra",
  },
  ctaHref: "https://vvault.app/signup",
};

export default function FeatureStudioPage() {
  return <FeaturePage data={DATA} />;
}
