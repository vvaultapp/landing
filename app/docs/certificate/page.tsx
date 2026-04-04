"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function CertificateDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Certificat" : "Certificate"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Protège la propriété de ta musique."
          : "Protect ownership of your music."}
      </p>

      {/* How it works */}
      <h2 id="how-it-works" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Comment ça marche" : "How it works"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "vvault génère des certificats de preuve de propriété pour tes morceaux uploadés. Quand tu uploades un morceau, vvault enregistre l'horodatage, le hash du fichier et les détails de ton compte pour créer un certificat de dépôt vérifiable."
          : "vvault generates proof-of-ownership certificates for your uploaded tracks. When you upload a track, vvault records the upload timestamp, file hash, and your account details to create a verifiable certificate of deposit."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Ce certificat sert de preuve que tu possédais le fichier à un moment précis, ce qui peut aider à établir la priorité en cas de litige sur la propriété."
          : "This certificate serves as evidence that you possessed the file at a specific point in time, which can help establish priority in ownership disputes."}
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Note :" : "Note:"}</strong>{" "}
        {locale === "fr"
          ? "Le certificat de dépôt est disponible sur toutes les offres, y compris Free. Chaque morceau que tu uploades reçoit automatiquement un certificat."
          : "Certificate of deposit is available on all plans, including Free. Every track you upload automatically gets a certificate."}
      </div>

      {/* Protection */}
      <h2 id="protection" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Protection
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Au-delà des certificats de propriété, vvault offre plusieurs couches de protection de contenu :"
          : "Beyond ownership certificates, vvault provides several layers of content protection:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Contrôle d'accès par token" : "Token-based access control"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Chaque lien de téléchargement utilise un token sécurisé unique pour vérifier l'accès autorisé."
            : "Every download link uses a unique secure token to verify authorized access."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "URLs de téléchargement à usage unique" : "Single-use download URLs"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Les tokens de téléchargement expirent après utilisation, empêchant le partage de liens et la redistribution non autorisée."
            : "Download tokens expire after use, preventing link sharing and unauthorized redistribution."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Suivi par email" : "Email tracking"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Suis qui a accédé à ton contenu et quand, ce qui permet de remonter à la source en cas de distribution non autorisée."
            : "Track who accessed your content and when, making it possible to detect unauthorized distribution back to its source."}
        </li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Ces protections fonctionnent ensemble pour te donner le contrôle sur qui accède à ta musique et créer une piste d'audit pour chaque téléchargement."
          : "These protections work together to give you control over who accesses your music and create an audit trail for every download."}
      </p>
    </>
  );
}
