"use client";

import { FeaturePage, type FeaturePageData } from "@/components/landing/FeaturePage";

const DATA: FeaturePageData = {
  track: "features_contacts",
  docTitle: {
    en: "vvault | Contacts — Know your network",
    fr: "vvault | Contacts — Connais ton réseau",
  },
  eyebrow: { en: "Contacts", fr: "Contacts" },
  title: { en: "Know your contacts", fr: "Connais tes contacts" },
  subtitle: {
    en: "A music-industry CRM — never let a connection go cold.",
    fr: "Un CRM pour l'industrie musicale — ne laisse aucun contact refroidir.",
  },
  video: "/landing/features/crm",
  aspect: "1280 / 566",
  poster: "/landing/features/crm.webp",
  media: "wide",
  sections: [
    {
      title: { en: "Every contact, fully profiled", fr: "Chaque contact, entièrement profilé" },
      body: {
        en: "Each contact has a rich profile with engagement scoring, interaction stats, and tags. Know at a glance who is engaged, what they have listened to, and when to follow up.",
        fr: "Chaque contact a un profil riche avec un score d'engagement, des stats d'interaction et des tags. Vois en un coup d'oeil qui est engagé, ce qu'ils ont écouté, et quand relancer.",
      },
    },
    {
      title: { en: "Full activity timeline", fr: "Timeline d'activité complète" },
      body: {
        en: "Every open, play, download, and click is logged automatically. See exactly how each contact interacts with your music — no manual tracking required.",
        fr: "Chaque ouverture, écoute, téléchargement et clic est logué automatiquement. Vois exactement comment chaque contact interagit avec ta musique — sans tracking manuel.",
      },
    },
    {
      title: { en: "Your network at a glance", fr: "Ton réseau en un coup d'oeil" },
      body: {
        en: "Search, filter, and segment your contacts by engagement score, role, or custom tags. Find the right people for every campaign in seconds.",
        fr: "Cherche, filtre et segmente tes contacts par score d'engagement, rôle ou tags personnalisés. Trouve les bonnes personnes pour chaque campagne en quelques secondes.",
      },
    },
    {
      title: { en: "Organize with groups", fr: "Organise avec des groupes" },
      body: {
        en: "Tag contacts with custom groups and colors. Filter by group to quickly find the right audience for your next campaign.",
        fr: "Tague tes contacts avec des groupes et des couleurs personnalisés. Filtre par groupe pour trouver rapidement la bonne audience pour ta prochaine campagne.",
      },
    },
  ],
  whyTitle: { en: "Why it matters", fr: "Pourquoi c'est important" },
  why: [
    {
      title: { en: "Engagement scoring", fr: "Scoring d'engagement" },
      desc: {
        en: "Contacts are scored automatically based on opens, plays, downloads, and clicks. Focus on the people who are actually listening.",
        fr: "Les contacts sont scorés automatiquement selon les ouvertures, écoutes, téléchargements et clics. Concentre-toi sur ceux qui écoutent vraiment.",
      },
    },
    {
      title: { en: "Smart segmentation", fr: "Segmentation intelligente" },
      desc: {
        en: "Group contacts with custom tags and colors. Filter by engagement level, group, or activity to send the right music to the right people.",
        fr: "Groupe tes contacts avec des tags et couleurs personnalisés. Filtre par niveau d'engagement, groupe ou activité pour envoyer la bonne musique aux bonnes personnes.",
      },
    },
    {
      title: { en: "Automatic tracking", fr: "Tracking automatique" },
      desc: {
        en: "Every interaction is logged without lifting a finger. Opens, plays, downloads, and clicks build a complete picture over time.",
        fr: "Chaque interaction est loguée sans lever le petit doigt. Ouvertures, écoutes, téléchargements et clics construisent une image complète au fil du temps.",
      },
    },
    {
      title: { en: "Built for music", fr: "Pensé pour la musique" },
      desc: {
        en: "This is not a generic CRM. Every feature is designed around how producers, labels, and artists actually manage relationships.",
        fr: "Ce n'est pas un CRM générique. Chaque fonctionnalité est pensée autour de la façon dont les producteurs, labels et artistes gèrent vraiment leurs relations.",
      },
    },
  ],
  finalTitle: {
    en: "Start building relationships",
    fr: "Commence à construire tes relations",
  },
  finalSubtitle: {
    en: "Sign up for free and turn your contact list into a real music industry CRM.",
    fr: "Inscris-toi gratuitement et transforme ta liste de contacts en un vrai CRM de l'industrie musicale.",
  },
  ctaLabel: { en: "Get started", fr: "Commencer" },
  ctaHref: "https://vvault.app/signup",
};

export default function FeatureContactsPage() {
  return <FeaturePage data={DATA} />;
}
