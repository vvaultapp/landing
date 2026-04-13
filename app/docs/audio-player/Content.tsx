"use client";

import { useDocsLocale } from "../DocsLocaleContext";

export default function AudioPlayerDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Lecteur audio" : "Audio Player"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Lecture persistante sur l'ensemble de l'application, accessible depuis toutes les pages."
          : "Persistent, app-wide playback across all pages."}
      </p>

      {/* Overview */}
      <h2 id="overview" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Vue d'ensemble" : "Overview"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Un lecteur audio persistant en bas de l'écran offre une lecture continue sur toutes les pages de l'application. Il inclut les contrôles lecture/pause, piste précédente/suivante, une barre de progression avec forme d'onde cliquable, et un contrôle du volume."
          : "A persistent audio player at the bottom of the screen provides continuous playback across all pages of the application. It includes play/pause controls, previous/next track navigation, a seekable waveform progress bar, and volume control."}
      </p>

      {/* Playback modes */}
      <h2 id="playback-modes" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Modes de lecture" : "Playback modes"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Choisis parmi trois modes de lecture pour contrôler le comportement de la file d'attente :"
          : "Choose from three playback modes to control how the queue behaves:"}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                Mode
              </th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <strong className="text-[#444]">Off</strong>
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                {locale === "fr"
                  ? "La lecture s'arrête après le morceau en cours"
                  : "Stops after the current track finishes"}
              </td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <strong className="text-[#444]">{locale === "fr" ? "Répéter" : "Repeat"}</strong>
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                {locale === "fr"
                  ? "La file d'attente se joue en boucle"
                  : "Loops through the queue continuously"}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2">
                <strong className="text-[#444]">{locale === "fr" ? "Aléatoire" : "Shuffle"}</strong>
              </td>
              <td className="px-3 py-2">
                {locale === "fr"
                  ? "Lecture dans un ordre aléatoire"
                  : "Plays tracks in randomized order"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Audio quality */}
      <h2 id="audio-quality" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Qualité audio" : "Audio quality"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Sélectionne la qualité de streaming qui correspond le mieux à tes besoins. Ta préférence est sauvegardée et appliquée automatiquement à chaque session."
          : "Select the streaming quality that best fits your needs. Your preference is saved per user and applied automatically on every session."}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong className="text-[#444]">Ultra</strong> &mdash;{" "}
          {locale === "fr" ? "Fichier original, qualité maximale" : "Original file, maximum quality"}
        </li>
        <li>
          <strong className="text-[#444]">{locale === "fr" ? "Compressé" : "Compressed"}</strong> &mdash;{" "}
          {locale === "fr" ? "Fichier plus petit, chargement plus rapide" : "Smaller file, faster loading"}
        </li>
        <li>
          <strong className="text-[#444]">Full</strong> &mdash;{" "}
          {locale === "fr" ? "Qualité sans perte (lossless)" : "Lossless quality"}
        </li>
      </ul>

      {/* Queue management */}
      <h2 id="queue" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Gestion de la file d'attente" : "Queue management"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "La file d'attente complète est accessible directement depuis le lecteur, avec navigation entre les morceaux. Tu peux lancer la lecture au niveau d'un pack entier, et la file se remplit automatiquement depuis ta bibliothèque, tes campagnes, tes pages de partage et tes players embarqués."
          : "The full queue is accessible directly from the player with track-level navigation. You can trigger pack-level playback, and the queue is automatically populated from your library, campaigns, share pages, and embeds."}
      </p>

      {/* Smart loading */}
      <h2 id="smart-loading" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Chargement intelligent" : "Smart loading"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Le lecteur adapte automatiquement le préchargement en fonction de la qualité de ta connexion, en respectant les connexions lentes pour économiser la bande passante. Les formes d'onde sont mises en cache pour un affichage instantané, et des optimisations spécifiques au mobile garantissent une expérience fluide sur tous les appareils."
          : "The player automatically adapts prefetching based on your connection quality, respecting slow connections to save bandwidth. Waveforms are cached for instant display, and mobile-specific optimizations ensure a smooth experience across all devices."}
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Sur les connexions lentes, le lecteur bascule automatiquement vers la qualité compressée pour garantir une lecture sans interruption."
          : "On slow connections, the player automatically switches to compressed quality to ensure uninterrupted playback."}
      </div>
    </>
  );
}
