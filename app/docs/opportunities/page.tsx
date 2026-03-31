"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function OpportunitiesDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Opportunities
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Parcours les demandes d'artistes et soumets ta musique."
          : "Browse artist requests and submit your music."}
      </p>

      {/* How it works */}
      <h2 id="how-it-works" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Comment ça marche" : "How it works"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Le tableau Opportunities connecte les producteurs avec des artistes à la recherche de sons spécifiques. Les artistes publient des demandes décrivant ce qu'ils recherchent, et les producteurs parcourent et soumettent leur musique directement."
          : "The Opportunities board connects producers with artists looking for specific sounds. Artists post requests describing what they need, and producers browse and submit their music directly."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Cela crée un pipeline direct entre créateurs \u2014 les artistes trouvent les sons dont ils ont besoin, et les producteurs mettent leur musique devant des acheteurs et collaborateurs actifs."
          : "This creates a direct pipeline between creators \u2014 artists find the sounds they need, and producers get their music in front of active buyers and collaborators."}
      </p>

      {/* Categories */}
      <h2 id="categories" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Catégories" : "Categories"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les opportunités sont organisées en quatre catégories :"
          : "Opportunities are organized into four categories:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">Beats</strong> &mdash;{" "}
          {locale === "fr" ? "Beats instrumentaux et productions." : "Instrumental beats and productions."}
        </li>
        <li>
          <strong className="text-[#444]">Loops</strong> &mdash;{" "}
          {locale === "fr" ? "Boucles mélodiques ou rythmiques pour le sampling." : "Melodic or rhythmic loops for sampling."}
        </li>
        <li>
          <strong className="text-[#444]">Acapellas</strong> &mdash;{" "}
          {locale === "fr" ? "Enregistrements vocaux pour les producteurs." : "Vocal recordings for producers to work with."}
        </li>
        <li>
          <strong className="text-[#444]">Mix &amp; Master</strong> &mdash;{" "}
          {locale === "fr" ? "Demandes de services de mixage et mastering." : "Mixing and mastering service requests."}
        </li>
      </ul>

      {/* Submissions */}
      <h2 id="submissions" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Soumissions" : "Submissions"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Soumets ta musique directement à toute opportunité ouverte. Chaque opportunité a des limites configurables :"
          : "Submit your music directly to any open opportunity. Each opportunity has configurable limits:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Limite totale de soumissions" : "Total submission limit"}</strong> &mdash;{" "}
          {locale === "fr" ? "Le nombre maximum de soumissions que l'opportunité acceptera au total." : "The maximum number of submissions the opportunity will accept overall."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Limite par utilisateur" : "Per-user submission limit"}</strong> &mdash;{" "}
          {locale === "fr" ? "Le nombre de morceaux qu'un producteur peut soumettre à une opportunité." : "How many tracks a single producer can submit to one opportunity."}
        </li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les propriétaires d'opportunités peuvent joindre jusqu'à 3 morceaux de référence pour donner aux producteurs une idée claire du son recherché."
          : "Opportunity owners can attach up to 3 reference tracks to give producers a clear idea of the sound they are looking for."}
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Écoute attentivement les morceaux de référence avant de soumettre. Les opportunités avec moins de soumissions ont souvent de meilleurs taux d'acceptation."
          : "Listen to the reference tracks carefully before submitting. Opportunities with fewer submissions often have higher acceptance rates."}
      </div>

      {/* Paid submissions */}
      <h2 id="paid" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Soumissions payantes" : "Paid submissions"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les propriétaires d'opportunités peuvent optionnellement exiger des frais par soumission. Quand une opportunité payante est créée, le propriétaire fixe un prix personnalisé que les producteurs doivent payer pour soumettre leur musique."
          : "Opportunity owners can optionally require a fee per submission. When a paid opportunity is created, the owner sets a custom price that producers must pay to submit their music."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les soumissions payantes sont traitées via Stripe, et le prix est clairement affiché avant qu'un producteur ne soumette. Ce modèle est couramment utilisé pour les placements de haut niveau ou les sélections organisées où le propriétaire de l'opportunité s'engage à examiner chaque soumission."
          : "Paid submissions are processed through Stripe, and the pricing is clearly displayed before a producer submits. This model is commonly used for high-profile placements or curated selections where the opportunity owner commits to reviewing every submission."}
      </p>
    </>
  );
}
