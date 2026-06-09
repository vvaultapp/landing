"use client";

import { FeaturePage, type FeaturePageData } from "@/components/landing/FeaturePage";

const DATA: FeaturePageData = {
  track: "features_sales",
  docTitle: {
    en: "vvault | Sell your music",
    fr: "vvault | Vends ta musique",
  },
  eyebrow: { en: "Sales", fr: "Ventes" },
  title: { en: "Sell your music", fr: "Vends ta musique" },
  subtitle: {
    en: "A secure marketplace with Stripe checkout, built for producers.",
    fr: "Une marketplace sécurisée avec paiement Stripe, pensée pour les producteurs.",
  },
  video: "/landing/features/sell",
  aspect: "1280 / 1910",
  poster: "/landing/features/sell.webp",
  media: "phone",
  sections: [
    {
      title: { en: "Your revenue at a glance", fr: "Tes revenus en un coup d'oeil" },
      body: {
        en: "Track total revenue, net earnings after fees, and monthly order volume — all connected directly to your Stripe account.",
        fr: "Suis ton chiffre d'affaires total, tes gains nets après frais, et le volume de commandes mensuelles — le tout connecté directement à ton compte Stripe.",
      },
    },
    {
      title: { en: "Flexible license tiers", fr: "Des licences flexibles" },
      body: {
        en: "Offer Basic, Premium, Stems, Exclusive, Unlimited, and Sound Kit licenses with custom pricing. Buyers pick their tier at checkout and receive the correct files automatically.",
        fr: "Propose des licences Basic, Premium, Stems, Exclusive, Unlimited et Sound Kit avec des prix personnalisés. Les acheteurs choisissent leur tier au checkout et reçoivent les bons fichiers automatiquement.",
      },
    },
    {
      title: { en: "Understand your revenue", fr: "Comprends tes revenus" },
      body: {
        en: "See which license types drive the most income. Use the breakdown to optimize your pricing strategy and maximize earnings.",
        fr: "Vois quels types de licences génèrent le plus de revenus. Utilise le détail pour optimiser ta stratégie de prix et maximiser tes gains.",
      },
    },
  ],
  whyTitle: { en: "Why it matters", fr: "Pourquoi c'est important" },
  why: [
    {
      title: { en: "Stripe integration", fr: "Intégration Stripe" },
      desc: {
        en: "Payments powered by Stripe. Accept cards, Apple Pay, Google Pay with full PCI compliance. Payouts after a 7-day hold.",
        fr: "Paiements propulsés par Stripe. Accepte les cartes, Apple Pay, Google Pay en toute conformité PCI. Versements après 7 jours.",
      },
    },
    {
      title: { en: "License flexibility", fr: "Licences flexibles" },
      desc: {
        en: "Basic, Premium, Stems, Exclusive. Each tier delivers the right file formats automatically at checkout.",
        fr: "Basic, Premium, Stems, Exclusive. Chaque tier livre les bons formats de fichiers automatiquement au checkout.",
      },
    },
    {
      title: { en: "5% Pro / 0% Ultra fees", fr: "5% Pro / 0% Ultra" },
      desc: {
        en: "Pro sellers pay 5% per sale. Ultra pays 0% platform commission. Both only pay Stripe processing fees.",
        fr: "Les vendeurs Pro paient 5% par vente. Ultra paie 0% de commission. Les deux ne paient que les frais Stripe.",
      },
    },
    {
      title: { en: "Stripe-powered payouts", fr: "Versements via Stripe" },
      desc: {
        en: "Earnings are paid out via Stripe with a 7-day hold. Multi-currency support for EUR, USD, and GBP.",
        fr: "Les gains sont versés via Stripe avec un délai de 7 jours. Support multi-devises pour EUR, USD et GBP.",
      },
    },
  ],
  finalTitle: { en: "Start selling your music", fr: "Commence à vendre ta musique" },
  finalSubtitle: {
    en: "Sign up for free and connect your Stripe account in minutes.",
    fr: "Inscris-toi gratuitement et connecte ton compte Stripe en quelques minutes.",
  },
  ctaLabel: { en: "Get started", fr: "Commencer" },
  ctaHref: "https://vvault.app/signup",
};

export default function FeatureSalesPage() {
  return <FeaturePage data={DATA} />;
}
