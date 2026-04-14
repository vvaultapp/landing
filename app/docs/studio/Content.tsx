"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function StudioDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        vvault Studio
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Studio
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Publication automatique de vidéos et outils de contenu pour producteurs."
          : "Automated video posting and content tools for producers."}
      </p>

      {/* Overview */}
      <h2 id="overview" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Vue d'ensemble" : "Overview"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Studio est une application séparée accessible sur studio.vvault.app, dédiée à la gestion automatisée de contenu pour les producteurs. Studio comprend deux outils principaux : la Publication Automatique pour poster des vidéos sur les réseaux sociaux, et WaveMatch pour l'identification de contenu musical."
          : "Studio is a separate application available at studio.vvault.app for automated content management. It includes two main tools: Automated Publishing for posting videos to social platforms, and WaveMatch for music content identification and beat matching."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Studio est accessible depuis la barre latérale de l'application principale. Certaines fonctionnalités comme WaveMatch sont disponibles sur tous les plans, tandis que d'autres comme la publication automatisée nécessitent le plan Ultra. Au lieu de créer et d'importer manuellement des vidéos, laisse vvault gérer le pipeline de contenu — de la génération vidéo à la publication programmée."
          : "Studio is accessible from the main app sidebar. Some features like WaveMatch are available on all plans, while others like automated publishing require the Ultra plan. Instead of manually creating and uploading videos, let vvault handle the content pipeline — from video generation to scheduled posting."}
      </p>

      {/* Automated Publishing */}
      <h2 id="automated-publishing" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Publication automatique" : "Automated publishing"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Studio génère automatiquement du contenu vidéo à partir de tes morceaux et les publie sur tes comptes de réseaux sociaux connectés. Configure la publication automatique par pack avec des options détaillées :"
          : "Studio auto-generates video content from your tracks and posts them to your connected social media accounts. Configure automated publishing per pack with detailed options:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Activer/désactiver par pack" : "Enable/disable per pack"}</strong> &mdash;{" "}
          {locale === "fr" ? "Choisis quels packs sont publiés automatiquement." : "Choose which packs get auto-posted."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Paramètres de programmation" : "Schedule settings"}</strong> &mdash;{" "}
          {locale === "fr" ? "Configure l'intervalle de publication (heures/jours), le fuseau horaire et l'heure de début." : "Configure the posting interval (hours/days), timezone, and start time."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Sélection de template" : "Template selection"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Utilise des templates avec des tokens dynamiques pour les titres et descriptions vidéo."
            : "Use templates with dynamic tokens for video titles and descriptions."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Couverture de repli" : "Cover fallback modes"}</strong> &mdash;{" "}
          {locale === "fr"
            ? "Priorité d'image : artwork du morceau, puis couverture du pack, puis image générée par défaut."
            : "Image priority: track artwork, then pack cover, then default generated image."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Dupliquer les paramètres" : "Duplicate settings"}</strong> &mdash;{" "}
          {locale === "fr" ? "Copie les paramètres de publication d'un pack à un autre en un clic." : "Copy publishing settings from one pack to another in one click."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Déclenchement manuel" : "Manual trigger"}</strong> &mdash;{" "}
          {locale === "fr" ? "Lance une publication immédiate en dehors du calendrier programmé." : "Trigger an immediate post outside of the scheduled calendar."}
        </li>
      </ul>

      {/* Video specs */}
      <h2 id="specs" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Spécifications vidéo" : "Video specs"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les vidéos générées par Studio utilisent les spécifications suivantes :"
          : "Videos generated by Studio use the following specifications:"}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Propriété" : "Property"}
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Valeur" : "Value"}
              </th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Format</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">MP4</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Résolution" : "Resolution"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">1280 x 720</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Fréquence d'images" : "Frame rate"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">30 fps</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Images</td>
              <td className="px-3 py-2">{locale === "fr" ? "Images carrousel prises en charge ; la première image est utilisée comme couverture" : "Carousel images supported; first image used as cover"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Templates */}
      <h2 id="templates" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Modèles" : "Templates"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les templates utilisent des tokens dynamiques pour personnaliser automatiquement les titres et descriptions de chaque vidéo publiée. Les tokens disponibles sont :"
          : "Templates use dynamic tokens to automatically customize the title and description of each posted video. Available tokens:"}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                Token
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                {locale === "fr" ? "Description" : "Description"}
              </th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-mono text-[12px]">{"{name}"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Titre du morceau" : "Track title"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-mono text-[12px]">{"{bpm}"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Tempo du morceau" : "Track tempo"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-mono text-[12px]">{"{key}"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Tonalité musicale" : "Musical key"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-mono text-[12px]">{"{link}"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Lien d'achat" : "Purchase link"}</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-mono text-[12px]">{"{ig}"}</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">{locale === "fr" ? "Pseudo Instagram" : "Instagram handle"}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-mono text-[12px]">{"{ytb}"}</td>
              <td className="px-3 py-2">{locale === "fr" ? "Pseudo YouTube" : "YouTube handle"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Combine les tokens pour créer des descriptions riches, par exemple : \"{name} | {bpm} BPM | {key} | Dispo sur {link}\"."
          : "Combine tokens to create rich descriptions, e.g.: \"{name} | {bpm} BPM | {key} | Available at {link}\"."}
      </div>

      {/* Scheduling */}
      <h2 id="scheduling" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Programmation" : "Scheduling"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Configure ton calendrier de publication avec des paramètres d'intervalle flexibles :"
          : "Configure your posting schedule with flexible interval settings:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Intervalles flexibles" : "Flexible intervals"}</strong> &mdash;{" "}
          {locale === "fr" ? "Définis des intervalles en minutes, heures ou jours entre chaque publication." : "Set intervals in minutes, hours, or days between each post."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Gestion du fuseau horaire" : "Timezone-aware"}</strong> &mdash;{" "}
          {locale === "fr" ? "Toute la programmation respecte ton fuseau horaire configuré pour que les posts sortent à la bonne heure locale." : "All scheduling respects your configured timezone so posts go out at the right local time."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Suivi de synchronisation" : "Sync tracking"}</strong> &mdash;{" "}
          {locale === "fr" ? "Surveille le statut de chaque publication avec des logs d'erreur détaillés en cas d'échec de synchronisation." : "Monitor the status of each post with detailed error logging if a sync fails."}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "File d'attente de publication" : "Posting queue"}</strong> &mdash;{" "}
          {locale === "fr" ? "Visualise la file d'attente avec le statut de chaque post : programmé, publié, ou en erreur." : "View the posting queue showing the status of each post: scheduled, posted, or errored."}
        </li>
      </ul>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Commence avec des intervalles plus longs (ex. toutes les quelques heures) et ajuste en fonction des données d'engagement de ton tableau de bord analytics."
          : "Start with longer intervals (e.g., every few hours) and adjust based on engagement data from your analytics dashboard."}
      </div>

      {/* WaveMatch */}
      <h2 id="wavematch" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        WaveMatch
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "WaveMatch est l'outil d'identification de contenu de Studio. Scanne tes prods sur YouTube, Spotify et Apple Music pour trouver les utilisations non autorisées et protéger tes droits."
          : "WaveMatch is Studio's content identification tool. Scan your beats across YouTube, Spotify, and Apple Music to find unauthorized uses and protect your rights."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr" ? (
          <>
            <a href="/docs/wavematch" className="text-emerald-600 underline underline-offset-2">
              En savoir plus sur WaveMatch &rarr;
            </a>
          </>
        ) : (
          <>
            <a href="/docs/wavematch" className="text-emerald-600 underline underline-offset-2">
              Learn more about WaveMatch &rarr;
            </a>
          </>
        )}
      </p>

      {/* Availability */}
      <h2 id="availability" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Disponibilité" : "Availability"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Studio est accessible sur tous les plans. Les fonctionnalités de base comme WaveMatch sont disponibles pour tous les utilisateurs, tandis que les fonctionnalités avancées comme la publication automatisée nécessitent le plan Ultra."
          : "Studio is accessible on all plans. Core features like WaveMatch are available to all users, while advanced features like automated publishing require the Ultra plan."}
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr" ? (
          <>
            Pour commencer avec Studio,{" "}
            <a href="https://vvault.app/signup?plan=ultra" className="text-emerald-600 underline underline-offset-2">
              crée un compte
            </a>{" "}
            ou passe au plan Ultra depuis tes paramètres de facturation.
          </>
        ) : (
          <>
            To get started with Studio,{" "}
            <a href="https://vvault.app/signup?plan=ultra" className="text-emerald-600 underline underline-offset-2">
              sign up
            </a>{" "}
            or upgrade to Ultra from your billing settings.
          </>
        )}
      </p>
    </>
  );
}
