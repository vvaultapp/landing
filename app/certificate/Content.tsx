"use client";

import { FeaturePage, type FeaturePageData } from "@/components/landing/FeaturePage";

const DATA: FeaturePageData = {
  track: "features_certificate",
  docTitle: {
    en: "vvault | Music protection certificates",
    fr: "vvault | Certificats de protection musicale",
  },
  title: { en: "Protect your music", fr: "Protège ta musique" },
  subtitle: {
    en: "Hash-certified deposit certificates that prove ownership from day one.",
    fr: "Des certificats de dépôt certifiés par hash qui prouvent la propriété dès le premier jour.",
  },
  video: "/landing/features/certificate",
  aspect: "1280 / 850",
  sections: [
    {
      title: {
        en: "A legal certificate for every track",
        fr: "Un certificat légal pour chaque track",
      },
      body: {
        en: "When you upload a track, vvault generates a SHA-256 hash of your file and locks it in a certificate with a precise timestamp. This creates an unalterable record that proves you held the file at that exact date — your anteriority is established, and the certificate can never be modified.",
        fr: "Quand tu uploades un track, vvault génère un hash SHA-256 de ton fichier et le verrouille dans un certificat avec un horodatage précis. Ça crée un enregistrement inaltérable qui prouve que tu détenais le fichier à cette date exacte — ton antériorité est établie, et le certificat ne peut jamais être modifié.",
      },
    },
    {
      title: { en: "Instant certification", fr: "Certification instantanée" },
      body: {
        en: "The entire process happens the moment you upload. Your file is hashed, timestamped, and a downloadable PDF certificate is generated automatically — no extra steps.",
        fr: "Tout le processus se passe au moment de l'upload. Ton fichier est hashé, horodaté, et un certificat PDF téléchargeable est généré automatiquement — aucune étape supplémentaire.",
      },
    },
    {
      title: { en: "Manage splits and rights", fr: "Gère les splits et les droits" },
      body: {
        en: "Attach collaborators, define royalty splits, add your SACEM or collecting society IDs, and upload DAW project files or screenshots as additional proof — all stored alongside your certificate.",
        fr: "Ajoute des collaborateurs, définis les splits de royalties, renseigne tes identifiants SACEM ou société de gestion, et uploade des fichiers de projet DAW ou des captures d'écran comme preuve supplémentaire — le tout stocké avec ton certificat.",
      },
    },
  ],
  whyTitle: { en: "Why it matters", fr: "Pourquoi c'est important" },
  why: [
    {
      title: { en: "Prove anteriority", fr: "Prouve l'antériorité" },
      desc: {
        en: "Your certificate timestamp legally establishes when you created or deposited the file. If a dispute arises, you have proof.",
        fr: "L'horodatage de ton certificat établit légalement quand tu as créé ou déposé le fichier. En cas de litige, tu as la preuve.",
      },
    },
    {
      title: { en: "Tamper-proof records", fr: "Enregistrements infalsifiables" },
      desc: {
        en: "SHA-256 hashing ensures the file cannot be altered after deposit. Any change would invalidate the hash.",
        fr: "Le hashage SHA-256 garantit que le fichier ne peut pas être modifié après le dépôt. Toute modification invaliderait le hash.",
      },
    },
    {
      title: { en: "Downloadable PDF", fr: "PDF téléchargeable" },
      desc: {
        en: "Each certificate is a proper legal document you can download, print, and present to labels, publishers, or in legal proceedings.",
        fr: "Chaque certificat est un vrai document légal que tu peux télécharger, imprimer et présenter à des labels, éditeurs ou en procédure juridique.",
      },
    },
    {
      title: { en: "Fully automatic", fr: "Entièrement automatique" },
      desc: {
        en: "No forms to fill, no extra steps. Every upload is certified the moment it hits vvault.",
        fr: "Pas de formulaire à remplir, pas d'étape supplémentaire. Chaque upload est certifié dès qu'il arrive sur vvault.",
      },
    },
  ],
  finalTitle: {
    en: "Start protecting your music",
    fr: "Commence à protéger ta musique",
  },
  finalSubtitle: {
    en: "Sign up for free and get automatic hash-certified deposit certificates on every track you upload.",
    fr: "Inscris-toi gratuitement et obtiens des certificats de dépôt certifiés par hash automatiquement sur chaque track que tu uploades.",
  },
  ctaLabel: { en: "Get started", fr: "Commencer" },
  ctaHref: "https://vvault.app/signup",
};

export default function CertificatePage() {
  return <FeaturePage data={DATA} />;
}
