"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function AccessLinksDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Liens d'accès" : "Access Links"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Partage sécurisé basé sur des tokens avec des permissions granulaires."
          : "Secure, token-based sharing with granular permissions."}
      </p>

      {/* Overview */}
      <h2 id="overview" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Vue d'ensemble" : "Overview"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Génère des liens partageables pour tes packs, sessions, dossiers et kits avec un contrôle d'accès granulaire. Les liens d'accès te permettent de partager ta musique en toute sécurité tout en gardant le contrôle sur qui peut voir, commenter ou modifier ton contenu."
          : "Generate shareable links for your packs, sessions, folders, and kits with granular access control. Access links let you share your music securely while maintaining control over who can view, comment on, or modify your content."}
      </p>

      {/* Permission tiers */}
      <h2 id="permission-tiers" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Niveaux de permissions" : "Permission tiers"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Chaque lien d'accès est associé à l'un des trois niveaux de permissions :"
          : "Each access link is assigned one of three permission tiers:"}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Niveau" : "Tier"}
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Permissions" : "Permissions"}
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Description" : "Description"}
              </th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">
                {locale === "fr" ? "Lecteur" : "Viewer"}
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                {locale === "fr" ? "Écoute uniquement" : "Listen only"}
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                {locale === "fr"
                  ? "Les visiteurs peuvent écouter les morceaux mais ne peuvent pas les télécharger, les commenter ni les modifier."
                  : "Visitors can listen to tracks but cannot download, comment, or modify them."}
              </td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">
                {locale === "fr" ? "Commentateur" : "Commenter"}
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                {locale === "fr" ? "Ajouter des commentaires" : "Add feedback"}
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                {locale === "fr"
                  ? "Les visiteurs peuvent écouter et laisser des commentaires ou du feedback sur les morceaux."
                  : "Visitors can listen and leave comments or feedback on tracks."}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium text-[#444]">
                {locale === "fr" ? "Éditeur" : "Editor"}
              </td>
              <td className="px-3 py-2">
                {locale === "fr" ? "Modifier le contenu" : "Modify content"}
              </td>
              <td className="px-3 py-2">
                {locale === "fr"
                  ? "Les visiteurs ont un accès complet pour écouter, commenter et modifier le contenu partagé."
                  : "Visitors have full access to listen, comment, and modify shared content."}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Audience modes */}
      <h2 id="audience-modes" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Modes d'audience" : "Audience modes"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Contrôle qui peut accéder à ton lien avec deux modes d'audience :"
          : "Control who can access your link with two audience modes:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Toute personne avec le lien" : "Anyone with the link"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Toute personne disposant du lien peut accéder au contenu au niveau de permission défini."
            : "Anyone who has the link can access the content at the defined permission level."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Invitations uniquement" : "Invites only"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Seuls les utilisateurs explicitement invités peuvent accéder au contenu. Gère la liste des invités par lien."
            : "Only explicitly invited users can access the content. Manage your invitee list per link."}
        </li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Tu peux révoquer ou régénérer un lien à tout moment. La révocation invalide immédiatement l'ancien lien, et la régénération crée un nouveau token tout en désactivant le précédent."
          : "You can revoke or regenerate a link at any time. Revoking immediately invalidates the old link, and regenerating creates a new token while disabling the previous one."}
      </p>

      {/* Access requests */}
      <h2 id="access-requests" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Demandes d'accès" : "Access requests"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Lorsqu'un lien est configuré en mode « invitations uniquement », les visiteurs qui ne sont pas sur la liste des invités peuvent demander l'accès."
          : "When a link is set to \"invites only\" mode, visitors who are not on the invitee list can request access."}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          {locale === "fr"
            ? "Le propriétaire du lien reçoit une notification pour chaque demande d'accès."
            : "The link owner receives a notification for each access request."}
        </li>
        <li>
          {locale === "fr"
            ? "Approuve ou refuse les demandes en un clic."
            : "Approve or deny requests with a single click."}
        </li>
        <li>
          {locale === "fr"
            ? "Les utilisateurs approuvés sont automatiquement ajoutés à la liste des invités."
            : "Approved users are automatically added to the invitee list."}
        </li>
      </ul>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Utilise le mode « invitations uniquement » lorsque tu partages du contenu sensible ou inédit pour garder un contrôle total sur qui peut y accéder."
          : "Use \"invites only\" mode when sharing sensitive or unreleased content to maintain full control over who can access it."}
      </div>
    </>
  );
}
