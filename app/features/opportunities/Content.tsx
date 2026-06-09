"use client";

import { FeaturePage, type FeaturePageData } from "@/components/landing/FeaturePage";

const DATA: FeaturePageData = {
  track: "features_opportunities",
  docTitle: {
    en: "vvault | Find opportunities",
    fr: "vvault | Trouve des opportunités",
  },
  eyebrow: { en: "Opportunities", fr: "Opportunités" },
  title: { en: "Find opportunities", fr: "Trouve des opportunités" },
  subtitle: {
    en: "A community board where artists post the sounds they need.",
    fr: "Un tableau communautaire où les artistes postent les sons qu'ils cherchent.",
  },
  video: "/landing/features/inbox",
  aspect: "1280 / 854",
  poster: "/landing/features/inbox.webp",
  media: "wide",
  sections: [
    {
      title: { en: "Browse what artists need", fr: "Parcours ce que les artistes recherchent" },
      body: {
        en: "Artists post requests for the sounds they’re looking for — loops, one-shots, full beats, vocal packs. Browse the board, find requests that match your style, and submit your work directly.",
        fr: "Les artistes postent des demandes pour les sons qu'ils recherchent — loops, one-shots, beats complets, packs de vocals. Parcours le tableau, trouve les demandes qui correspondent à ton style, et soumets ton travail directement.",
      },
    },
    {
      title: { en: "Submit and get discovered", fr: "Soumets et fais-toi découvrir" },
      body: {
        en: "Package your sounds and submit them to open requests. Track the status of every submission — from review to accepted — all in one place.",
        fr: "Package tes sons et soumets-les aux demandes ouvertes. Suis le statut de chaque soumission — de la review à l'acceptation — tout au même endroit.",
      },
    },
  ],
  whyTitle: { en: "Why it matters", fr: "Pourquoi c'est important" },
  why: [
    {
      title: { en: "Discover what artists need", fr: "Découvre ce que les artistes veulent" },
      desc: {
        en: "Stop guessing what sells. See real requests from real artists and create sounds you know people are looking for.",
        fr: "Arrête de deviner ce qui se vend. Vois de vraies demandes de vrais artistes et crée des sons que les gens recherchent.",
      },
    },
    {
      title: { en: "Submit directly", fr: "Soumets directement" },
      desc: {
        en: "No middlemen, no gatekeepers. Submit your packs straight to the artist who requested them and start a conversation.",
        fr: "Pas d'intermédiaires, pas de gatekeepers. Soumets tes packs directement à l'artiste qui les a demandés et lance la conversation.",
      },
    },
    {
      title: { en: "Get discovered", fr: "Fais-toi découvrir" },
      desc: {
        en: "Every accepted submission puts your name in front of a new audience. Build your reputation one placement at a time.",
        fr: "Chaque soumission acceptée met ton nom devant une nouvelle audience. Construis ta réputation un placement à la fois.",
      },
    },
    {
      title: { en: "Paid submissions", fr: "Soumissions payantes" },
      desc: {
        en: "Request owners can set a price per submission. Submit free or paid — each opportunity defines its own rules and upload limits.",
        fr: "Les créateurs de demandes peuvent fixer un prix par soumission. Soumets gratuitement ou en payant — chaque opportunité définit ses propres règles.",
      },
    },
  ],
  finalTitle: { en: "Start finding opportunities", fr: "Commence à trouver des opportunités" },
  finalSubtitle: {
    en: "Sign up for free and browse the request board today.",
    fr: "Inscris-toi gratuitement et parcours le tableau de demandes dès aujourd'hui.",
  },
  ctaLabel: { en: "Get started", fr: "Commencer" },
  ctaHref: "https://vvault.app/signup",
};

export default function FeatureOpportunitiesPage() {
  return <FeaturePage data={DATA} />;
}
