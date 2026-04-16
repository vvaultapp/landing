"use client";

import Link from "next/link";
import { useDocsLocale } from "../DocsLocaleContext";

export default function DesktopAppDocPage() {
  const locale = useDocsLocale();

  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        {locale === "fr" ? "Fonctionnalités" : "Features"}
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        {locale === "fr" ? "Application bureau" : "Desktop App"}
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        {locale === "fr"
          ? "Application native avec synchronisation de fichiers locale et accès hors ligne."
          : "Native app with local file sync and offline access."}
      </p>

      {/* Overview */}
      <h2 id="overview" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Vue d'ensemble" : "Overview"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "L'application bureau native (macOS et Windows) étend vVault avec la synchronisation de fichiers locale, l'accès hors ligne et des intégrations au niveau du système d'exploitation."
          : "The native desktop application (macOS & Windows) extends vVault with local file synchronization, offline access, and OS-level integrations."}
      </p>

      {/* File sync */}
      <h2 id="file-sync" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Synchronisation de fichiers" : "File sync"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Désigne des dossiers locaux comme racines de synchronisation. Les nouveaux fichiers sont automatiquement importés dans ta bibliothèque vVault."
          : "Designate local folders as sync roots. New files are automatically uploaded to your vVault library."}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          {locale === "fr" ? "Import automatique des nouveaux fichiers" : "Auto-upload new files"}
        </li>
        <li>
          {locale === "fr" ? "Pause et reprise par dossier" : "Pause/resume sync per folder"}
        </li>
        <li>
          {locale === "fr" ? "Rescan pour détecter les changements" : "Rescan to detect changes"}
        </li>
        <li>
          {locale === "fr" ? "Révéler les fichiers dans le Finder / l'Explorateur" : "Reveal files in Finder/Explorer"}
        </li>
      </ul>

      {/* Native notifications */}
      <h2 id="notifications" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Notifications natives" : "Native notifications"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Reçois des alertes au niveau du système d'exploitation pour les téléchargements, les ventes et l'activité. Clique sur une notification pour accéder directement à l'élément concerné."
          : "Receive OS-level alerts for downloads, sales, and activity. Click through any notification to jump directly to the relevant item."}
      </p>

      {/* Cache management */}
      <h2 id="cache" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Gestion du cache" : "Cache management"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Les fichiers récemment joués sont mis en cache localement pour réduire la consommation de bande passante et accélérer la lecture."
          : "Recently played files are cached locally to reduce bandwidth usage and enable faster playback."}
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">{locale === "fr" ? "Astuce :" : "Tip:"}</strong>{" "}
        {locale === "fr"
          ? "Tu peux gérer la taille du cache et le vider depuis les paramètres de l'application bureau."
          : "You can manage cache size and clear it from the desktop app settings."}
      </div>

      {/* Download */}
      <h2 id="download" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        {locale === "fr" ? "Télécharger" : "Download"}
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        {locale === "fr"
          ? "Télécharge l'application bureau pour ta plateforme :"
          : "Download the desktop app for your platform:"}
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <Link href="/download/macos" className="text-blue-500 hover:underline">macOS</Link>
        </li>
        <li>
          <Link href="/download/windows" className="text-blue-500 hover:underline">Windows</Link>
        </li>
        <li>
          {locale === "fr" ? "Également disponible sur l'" : "Also available on the "}{" "}
          <a href="https://apps.apple.com/app/id6759256796" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
            App Store
          </a>{" "}
          {locale === "fr" ? "pour iOS" : "for iOS"}
        </li>
      </ul>
    </>
  );
}
