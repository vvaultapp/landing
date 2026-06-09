"use client";

import { FeaturePage, type FeaturePageData } from "@/components/landing/FeaturePage";

const DATA: FeaturePageData = {
  track: "features_analytics",
  docTitle: {
    en: "vvault | Analytics — Track true engagement",
    fr: "vvault | Analytics — Mesure le vrai engagement",
  },
  eyebrow: { en: "Analytics", fr: "Analytics" },
  title: { en: "Track true engagement", fr: "Mesure le vrai engagement" },
  subtitle: {
    en: "Know who's really listening — and when they come back to buy.",
    fr: "Sache qui écoute vraiment — et quand ils reviennent acheter.",
  },
  video: "/landing/features/analytics",
  aspect: "1280 / 2610",
  poster: "/landing/features/analytics.webp",
  media: "phone",
  sections: [
    {
      title: { en: "Everything at a glance", fr: "Tout en un coup d'œil" },
      body: {
        en: "Most platforms stop at opens and clicks. vvault tracks the full journey — from email open to beat play to download to purchase — so you see exactly which campaigns and tracks drive real results.",
        fr: "La plupart des plateformes s'arrêtent aux ouvertures et clics. vvault trace le parcours complet — de l'ouverture de l'email à l'écoute du beat, au téléchargement, à l'achat — pour que tu voies exactement quelles campagnes et tracks génèrent de vrais résultats.",
      },
    },
    {
      title: { en: "Real-time activity feed", fr: "Fil d'activité en temps réel" },
      body: {
        en: "Watch engagement happen live. Every open, play, download, and purchase appears the moment it happens — so you can follow up while the interest is fresh.",
        fr: "Regarde l'engagement se produire en direct. Chaque ouverture, écoute, téléchargement et achat apparaît au moment où ça arrive — pour que tu puisses relancer tant que l'intérêt est frais.",
      },
    },
    {
      title: { en: "Find the perfect send time", fr: "Trouve le moment parfait pour envoyer" },
      body: {
        en: "vvault analyzes when your audience actually engages and surfaces the optimal day and hour to send your next campaign. Stop guessing — let the data decide.",
        fr: "vvault analyse quand ton audience s'engage vraiment et te donne le jour et l'heure optimaux pour ta prochaine campagne. Arrête de deviner — laisse les données décider.",
      },
    },
    {
      title: { en: "Know your top performers", fr: "Connais tes meilleurs performers" },
      body: {
        en: "See which campaigns drive the most engagement and which contacts are your hottest leads. Leaderboards for top campaigns, top packs, and hot contacts — all in one place.",
        fr: "Vois quelles campagnes génèrent le plus d'engagement et quels contacts sont tes leads les plus chauds. Classements des meilleures campagnes, meilleurs packs, et contacts les plus actifs — tout au même endroit.",
      },
    },
  ],
  whyTitle: { en: "Why it matters", fr: "Pourquoi c'est important" },
  why: [
    {
      title: { en: "Beyond vanity metrics", fr: "Au-delà des vanity metrics" },
      desc: {
        en: "Opens mean nothing if nobody listens. vvault connects every metric to actual engagement so you know what is working.",
        fr: "Les ouvertures ne veulent rien dire si personne n'écoute. vvault connecte chaque métrique à l'engagement réel pour que tu saches ce qui marche.",
      },
    },
    {
      title: { en: "Per-recipient scoring", fr: "Scoring par destinataire" },
      desc: {
        en: "Every contact gets an engagement score based on their activity. Instantly identify your most engaged listeners and serious buyers.",
        fr: "Chaque contact reçoit un score d'engagement basé sur son activité. Identifie instantanément tes auditeurs les plus engagés et tes acheteurs sérieux.",
      },
    },
    {
      title: { en: "Funnel visibility", fr: "Visibilité du funnel" },
      desc: {
        en: "See the full journey from email open to beat play to purchase. Identify where listeners drop off and optimize your flow.",
        fr: "Vois le parcours complet de l'ouverture de l'email à l'écoute du beat jusqu'à l'achat. Identifie où les auditeurs décrochent et optimise ton flow.",
      },
    },
    {
      title: { en: "Actionable insights", fr: "Insights actionnables" },
      desc: {
        en: "Raw data becomes clear recommendations — when to send, who to follow up with, and which beats to push.",
        fr: "Les données brutes deviennent des recommandations claires — quand envoyer, qui relancer, et quels beats pousser.",
      },
    },
  ],
  finalTitle: { en: "Start tracking what matters", fr: "Commence à tracker ce qui compte" },
  finalSubtitle: {
    en: "Sign up for free and see exactly how your audience engages with every beat you send.",
    fr: "Inscris-toi gratuitement et vois exactement comment ton audience interagit avec chaque beat que tu envoies.",
  },
  ctaLabel: { en: "Get started", fr: "Commencer" },
  ctaHref: "https://vvault.app/signup",
};

export default function FeatureAnalyticsPage() {
  return <FeaturePage data={DATA} />;
}
