"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function WritingSessionsDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Sessions d'écriture" : "Writing Sessions"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Espaces de travail collaboratifs en temps réel pour la création musicale."
          : "Real-time collaborative workspaces for music creation."}
      </p>

      {/* Overview */}
      <h2 id="overview" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Vue d'ensemble" : "Overview"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Une session d'écriture est un espace de travail collaboratif en temps réel où plusieurs producteurs peuvent participer à des sessions de création musicale structurées — téléverser des morceaux, voter sur les soumissions, taguer leurs favoris et gérer les crédits."
          : "A writing session is a real-time collaborative workspace where multiple producers can participate in structured music creation sessions — upload tracks, vote on submissions, tag favorites, and manage credits."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les sessions offrent un flux de travail structuré pour les équipes de production, les battles de beats et les projets collaboratifs, le tout dans un seul espace partagé."
          : "Sessions provide a structured workflow for production teams, beat battles, and collaborative projects, all within a single shared space."}
      </p>

      {/* Session dashboard */}
      <h2 id="session-dashboard" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Tableau de bord de session" : "Session dashboard"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Le tableau de bord de session offre une vue d'ensemble en temps réel de l'activité de la session :"
          : "The session dashboard provides a real-time overview of session activity:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Morceaux soumis" : "Tracks submitted"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Nombre total de morceaux téléversés dans la session."
            : "Total number of tracks uploaded to the session."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Participants" : "Participant count"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Nombre de producteurs actuellement dans la session."
            : "Number of producers currently in the session."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Morceau le plus voté" : "Most-voted track"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Le morceau ayant reçu le plus de votes est mis en avant."
            : "The track with the most votes is highlighted at the top."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Chronologie d'activité" : "Activity timeline"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Flux en direct des actions de la session (téléversements, votes, commentaires)."
            : "Live feed of session actions (uploads, votes, comments)."}
        </li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les sessions suivent un cycle de vie simple : active → fermée. Les sessions actives acceptent de nouvelles soumissions et votes, tandis que les sessions fermées sont archivées pour référence."
          : "Sessions follow a simple lifecycle: active → closed. Active sessions accept new submissions and votes, while closed sessions are archived for reference."}
      </p>

      {/* Voting & tagging */}
      <h2 id="voting-system" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Votes et tags" : "Voting & tagging"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les participants peuvent réagir aux morceaux soumis avec plusieurs types de réactions :"
          : "Participants can react to submitted tracks with multiple reaction types:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>{locale === "fr" ? "Upvotes" : "Upvotes"}</li>
        <li>{locale === "fr" ? "Réactions 🔥 (feu)" : "Fire reactions"}</li>
        <li>{locale === "fr" ? "Cœurs" : "Hearts"}</li>
        <li>{locale === "fr" ? "Pouces en l'air" : "Thumbs-up"}</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Le système de tags permet de catégoriser les morceaux pour faciliter la prise de décision :"
          : "The tagging system lets you categorize tracks for easier decision-making:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">Keeper</strong> &mdash;{" "}
          {locale === "fr" ? "Morceau validé, à garder." : "Track is approved and worth keeping."}
        </li>
        <li>
          <strong className="text-[#444]">Maybe</strong> &mdash;{" "}
          {locale === "fr" ? "Morceau à reconsidérer plus tard." : "Track to reconsider later."}
        </li>
        <li>
          <strong className="text-[#444]">Needs work</strong> &mdash;{" "}
          {locale === "fr" ? "Morceau qui nécessite des modifications." : "Track that needs revisions."}
        </li>
        <li>
          <strong className="text-[#444]">Scratch</strong> &mdash;{" "}
          {locale === "fr" ? "Morceau rejeté." : "Track is rejected."}
        </li>
      </ul>

      {/* Split management */}
      <h2 id="splits" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Gestion des splits" : "Split management"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Chaque morceau d'une session peut avoir des splits de royalties définis, attribuant à chaque contributeur sa part."
          : "Each track in a session can have royalty splits defined, assigning each contributor their share."}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Splits par morceau" : "Per-track splits"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Définis les pourcentages de royalties pour chaque contributeur sur chaque morceau."
            : "Define royalty percentages for each contributor on every track."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Suivi des rôles" : "Role-based tracking"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Identifie les participants par rôle (producteur, auteur, ingénieur) pour un suivi clair des crédits."
            : "Identify participants by role (producer, writer, engineer) for clear credit tracking."}
        </li>
      </ul>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Les splits peuvent être exportés pour être utilisés avec des services de distribution et de collecte de royalties."
          : "Splits can be exported for use with distribution and royalty collection services."}
      </div>

      {/* Use cases */}
      <h2 id="use-cases" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Cas d'utilisation" : "Use cases"}
      </h2>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Battles de beats à distance" : "Remote beat battles"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Organise des compétitions de production où les participants soumettent et votent pour les meilleurs morceaux."
            : "Host production competitions where participants submit and vote for the best tracks."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Création de packs collaboratifs" : "Collaborative pack creation"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Rassemble plusieurs producteurs pour créer un pack de beats ensemble."
            : "Bring multiple producers together to build a beat pack as a team."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Sessions de review A&R" : "A&R review sessions"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Permets aux A&R de passer en revue les soumissions, taguer les favoris et laisser des commentaires."
            : "Let A&R teams review submissions, tag favorites, and leave feedback."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Workflows de production en équipe" : "Team production workflows"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Coordonne le travail de production entre les membres d'une équipe avec un suivi clair des contributions."
            : "Coordinate production work across team members with clear contribution tracking."}
        </li>
      </ul>
    </>
  );
}
