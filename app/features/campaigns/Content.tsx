"use client";

import { FeaturePage, type FeaturePageData } from "@/components/landing/FeaturePage";

const DATA: FeaturePageData = {
  track: "features_campaigns",
  docTitle: {
    en: "vvault | Email campaigns for music",
    fr: "vvault | Campagnes email pour la musique",
  },
  eyebrow: { en: "Campaigns", fr: "Campagnes" },
  title: { en: "Send campaigns that land", fr: "Envoie des campagnes qui arrivent" },
  subtitle: {
    en: "Pro email campaigns for producers — straight to the primary inbox.",
    fr: "Des campagnes email pro pour producteurs — direct en boîte principale.",
  },
  video: "/landing/features/campaigns",
  aspect: "1280 / 736",
  poster: "/landing/features/campaigns.webp",
  media: "wide",
  sections: [
    {
      title: { en: "Build your campaign in minutes", fr: "Crée ta campagne en quelques minutes" },
      body: {
        en: "Pick your audience, attach tracks, write your subject line, and hit send. Every email goes from your own Gmail address via secure OAuth — we never store your password. Lands in primary inboxes, not promotions or spam.",
        fr: "Choisis ton audience, attache tes tracks, écris ton objet, et envoie. Chaque email part de ta propre adresse Gmail via OAuth sécurisé — on ne stocke jamais ton mot de passe. Atterrit en boîte principale, pas dans les promotions ou le spam.",
      },
    },
    {
      title: { en: "Know exactly what happened", fr: "Sache exactement ce qui s'est passé" },
      body: {
        en: "Real-time stats for every campaign. See who opened, who played your beats, who downloaded, and who clicked through. No guesswork — just data you can act on.",
        fr: "Des stats en temps réel pour chaque campagne. Vois qui a ouvert, qui a écouté tes beats, qui a téléchargé, et qui a cliqué. Pas de devinettes — juste des données sur lesquelles agir.",
      },
    },
    {
      title: { en: "Follow every interaction", fr: "Suis chaque interaction" },
      body: {
        en: "A live activity feed shows you exactly what each recipient did and when. Know the moment someone plays your beat or downloads your pack so you can follow up at the right time.",
        fr: "Un fil d'activité en direct te montre exactement ce que chaque destinataire a fait et quand. Sache à la seconde quand quelqu'un écoute ton beat ou télécharge ton pack pour relancer au bon moment.",
      },
    },
  ],
  whyTitle: { en: "Why it matters", fr: "Pourquoi c'est important" },
  why: [
    {
      title: { en: "Gmail integration", fr: "Intégration Gmail" },
      desc: {
        en: "Send from your own address. Recipients see your name, reply directly to you, and your emails avoid the promotions tab entirely.",
        fr: "Envoie depuis ta propre adresse. Les destinataires voient ton nom, te répondent directement, et tes emails évitent l'onglet promotions.",
      },
    },
    {
      title: { en: "Multi-channel outreach", fr: "Multi-canal" },
      desc: {
        en: "Send campaigns via email, Instagram, or messages. Reach contacts on the channel they actually check.",
        fr: "Envoie tes campagnes par email, Instagram ou messages. Atteins tes contacts sur le canal qu'ils consultent vraiment.",
      },
    },
    {
      title: { en: "Smart link tracking", fr: "Suivi de liens intelligent" },
      desc: {
        en: "Every campaign generates tracked links. See exactly who opened, clicked, played, and downloaded your beats.",
        fr: "Chaque campagne génère des liens trackés. Vois exactement qui a ouvert, cliqué, écouté et téléchargé tes beats.",
      },
    },
    {
      title: { en: "Pack attachments", fr: "Pièces jointes" },
      desc: {
        en: "Attach packs, tracks, or folders directly to your campaigns. Recipients get a clean, branded listening experience.",
        fr: "Attache des packs, tracks ou dossiers directement à tes campagnes. Les destinataires reçoivent une expérience d'écoute propre et brandée.",
      },
    },
  ],
  finalTitle: { en: "Start sending campaigns", fr: "Commence à envoyer des campagnes" },
  finalSubtitle: {
    en: "Sign up for free and start reaching your audience with campaigns that actually get opened and played.",
    fr: "Inscris-toi gratuitement et commence à toucher ton audience avec des campagnes qui sont vraiment ouvertes et écoutées.",
  },
  ctaLabel: { en: "Get started", fr: "Commencer" },
  ctaHref: "https://vvault.app/signup",
};

export default function FeatureCampaignsPage() {
  return <FeaturePage data={DATA} />;
}
