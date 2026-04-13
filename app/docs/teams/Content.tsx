"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function TeamsDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Équipes" : "Teams"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Comptes d'équipe collaboratifs pour des espaces de travail partagés."
          : "Collaborative team accounts for shared workspaces."}
      </p>

      {/* Overview */}
      <h2 id="overview" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Vue d'ensemble" : "Overview"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les équipes fournissent l'infrastructure pour des comptes collaboratifs où plusieurs utilisateurs opèrent sous une identité partagée. Idéal pour les collectifs de production, les labels et les groupes de vente de beats."
          : "Teams provide infrastructure for collaborative team accounts where multiple users operate under a shared identity. Ideal for production collectives, labels, and beat-selling groups."}
      </p>

      {/* Creating a team */}
      <h2 id="creating-teams" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Créer une équipe" : "Creating a team"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Pour créer une nouvelle équipe :"
          : "To create a new team:"}
      </p>
      <ol className="text-[14px] text-[#666] mb-4 list-decimal pl-5 space-y-1">
        <li>
          {locale === "fr"
            ? "Choisis un nom d'équipe qui représente ton collectif ou ton label."
            : "Choose a team name that represents your collective or label."}
        </li>
        <li>
          {locale === "fr"
            ? "Téléverse un avatar et une image de bannière pour l'identité visuelle de l'équipe."
            : "Upload an avatar and banner image for your team's branding."}
        </li>
        <li>
          {locale === "fr"
            ? "Configure les paramètres de visibilité de l'équipe (publique ou privée)."
            : "Configure team visibility settings (public or private)."}
        </li>
      </ol>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Les équipes publiques peuvent être découvertes par d'autres utilisateurs sur la plateforme, tandis que les équipes privées ne sont accessibles que par invitation."
          : "Public teams can be discovered by other users on the platform, while private teams are accessible by invitation only."}
      </div>

      {/* Inviting members */}
      <h2 id="inviting-members" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Inviter des membres" : "Inviting members"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Invite de nouveaux membres dans ton équipe en utilisant des liens d'invitation basés sur des tokens :"
          : "Invite new members to your team using token-based join links:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Liens d'invitation" : "Join links"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Génère un lien unique que tu peux partager avec de potentiels membres."
            : "Generate a unique link you can share with potential members."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Gestion des rôles" : "Role management"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Attribue des rôles aux membres pour contrôler les niveaux d'accès au sein de l'équipe."
            : "Assign roles to members to control access levels within the team."}
        </li>
      </ul>

      {/* Team profile */}
      <h2 id="team-profile" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Profil d'équipe" : "Team profile"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Chaque équipe dispose d'une page de profil publique présentant l'identité visuelle de l'équipe :"
          : "Each team gets a public profile page showcasing the team's branding:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          {locale === "fr"
            ? "Avatar, bannière et bio de l'équipe personnalisables."
            : "Customizable team avatar, banner, and bio."}
        </li>
        <li>
          {locale === "fr"
            ? "Espace de travail partagé pour les packs et les campagnes."
            : "Shared workspace for packs and campaigns."}
        </li>
        <li>
          {locale === "fr"
            ? "Les membres de l'équipe sont listés sur le profil."
            : "Team members are listed on the profile."}
        </li>
      </ul>

      {/* Use cases */}
      <h2 id="use-cases" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Cas d'utilisation" : "Use cases"}
      </h2>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Collectifs de production" : "Production collectives"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Regroupe plusieurs producteurs sous une seule identité de marque pour publier et vendre des beats ensemble."
            : "Group multiple producers under a single brand identity to release and sell beats together."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Équipes de label" : "Label teams"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Gère les membres du roster, les packs et les campagnes depuis un compte d'équipe centralisé."
            : "Manage roster members, packs, and campaigns from a centralized team account."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Groupes de vente de beats" : "Beat-selling groups"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Collabore avec d'autres producteurs pour créer et distribuer des packs de beats en tant que groupe."
            : "Collaborate with other producers to create and distribute beat packs as a group."}
        </li>
      </ul>
    </>
  );
}
