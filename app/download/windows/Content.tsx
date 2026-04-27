"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

const ColorBends = dynamic(() => import("@/components/landing/ColorBends"), {
  ssr: false,
});

const WINDOWS_URL =
  "/api/download/windows";

export default function DownloadWindowsPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);
  const fr = locale === "fr";

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-screen"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.55]">
          <ColorBends
            colors={["#ffffff"]}
            rotation={90}
            speed={0.2}
            scale={1.2}
            frequency={1}
            warpStrength={1}
            mouseInfluence={0}
            noise={0}
            parallax={0.5}
            iterations={1}
            intensity={1.5}
            bandWidth={6}
            transparent
            autoRotate={0}
          />
        </div>
      </div>

      <main className="relative z-10 pb-32 pt-40 sm:pt-48">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center px-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-center justify-center">
            <Image
              src="/vvault-iOS-Default-1024x1024@1x.png"
              alt={fr ? "Icône de l'app vvault" : "vvault app icon"}
              width={96}
              height={96}
              className="rounded-[22px] shadow-2xl shadow-black/60"
            />
          </div>

          <h1
            className="text-center font-display text-4xl font-semibold sm:text-5xl lg:text-6xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {fr ? "vvault pour Windows" : "vvault for Windows"}
          </h1>

          <p className="mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/50 sm:text-base">
            {fr
              ? "Importe, envoie et suis ta musique depuis ton PC."
              : "Upload, send, and track your music from your PC."}
          </p>

          <span className="mt-4 rounded-full bg-white/[0.06] px-3 py-1 text-[12px] font-medium text-white/40">
            v0.1.0
          </span>

          <div className="mt-10 flex flex-col items-center gap-3">
            <a
              href={WINDOWS_URL}
              className="inline-flex items-center gap-2.5 rounded-2xl px-6 py-3 text-[15px] font-semibold text-[#0e0e0e] transition-all duration-200 hover:brightness-[0.96] hover:shadow-[0_6px_28px_0_rgba(255,255,255,0.14)]"
              style={{
                background: "linear-gradient(to bottom, #ffffff 0%, #d4d4d4 100%)",
                boxShadow:
                  "0 4px 24px 0 rgba(255,255,255,0.10), 0 1px 4px 0 rgba(255,255,255,0.06)",
              }}
            >
              <svg
                viewBox="0 0 20 20"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 17h12" />
              </svg>
              {fr ? "Télécharger pour Windows" : "Download for Windows"}
            </a>
          </div>

          {/* System requirements */}
          <div className="mt-20 w-full max-w-sm">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-white/40">
                  <path d="M3 12V6.5l8-1.1V12H3zm9-6.8V12h9V3L12 5.2zM12 13v6.7L21 22v-9H12zm-1 0H3v5.5l8 1.1V13z" />
                </svg>
                <h3 className="text-[14px] font-semibold text-white/70">Windows</h3>
              </div>
              <p className="mt-2 text-[13px] text-white/35">
                Windows 10 {fr ? "ou plus récent" : "or later"}
              </p>
              <p className="mt-1 text-[13px] text-white/35">
                64-bit (x64)
              </p>
            </div>
          </div>

          {/* Why the desktop app */}
          <section className="mt-28 w-full max-w-3xl">
            <h2 className="text-center font-display text-[28px] font-semibold text-white sm:text-[32px]">
              {fr ? "Pourquoi l'app Windows ?" : "Why the Windows app?"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-[15px] leading-relaxed text-white/45">
              {fr
                ? "vvault pour Windows est conçu pour les beatmakers qui produisent depuis FL Studio, Ableton Live, Studio One ou Cubase. Glisse tes fichiers WAV, MP3 ou ZIP directement depuis l'Explorateur ou ton bounce folder, et envoie-les en quelques secondes aux artistes, labels et A&Rs de ta liste."
                : "vvault for Windows is built for beatmakers producing in FL Studio, Ableton Live, Studio One, or Cubase. Drop WAV, MP3, or ZIP files straight from File Explorer or your bounce folder, and send them in seconds to the artists, labels, and A&Rs on your list."}
            </p>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <h3 className="text-[15px] font-semibold text-white/85">
                  {fr ? "Drag & drop natif" : "Native drag & drop"}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/45">
                  {fr
                    ? "Importe tes beats en faisant glisser tes fichiers depuis l'Explorateur Windows. Métadonnées, BPM et tonalité sont détectés automatiquement."
                    : "Upload beats by dragging files from Windows File Explorer. Metadata, BPM, and key are detected automatically."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <h3 className="text-[15px] font-semibold text-white/85">
                  {fr ? "Notifications natives Windows" : "Native Windows notifications"}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/45">
                  {fr
                    ? "Reçois des notifications dans le centre de notifications Windows dès qu'un destinataire ouvre ton email, écoute ton beat ou télécharge tes fichiers."
                    : "Get notifications in the Windows notification center the moment a recipient opens your email, plays your beat, or downloads your files."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <h3 className="text-[15px] font-semibold text-white/85">
                  {fr ? "Léger et rapide" : "Lightweight and fast"}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/45">
                  {fr
                    ? "Faible empreinte CPU et RAM. Tourne sans freeze pendant tes sessions FL Studio ou Ableton Live, même avec un projet lourd ouvert."
                    : "Low CPU and RAM footprint. Runs without freezing during your FL Studio or Ableton Live sessions, even with a heavy project open."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <h3 className="text-[15px] font-semibold text-white/85">
                  {fr ? "Sync cloud automatique" : "Automatic cloud sync"}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/45">
                  {fr
                    ? "Ta bibliothèque, tes contacts et tes campagnes sont synchronisés avec l'app web et iOS. Commence un envoi sur PC, termine-le sur ton téléphone."
                    : "Your library, contacts, and campaigns sync with the web and iOS apps. Start a send on PC, finish it on your phone."}
                </p>
              </div>
            </div>
          </section>

          {/* What's inside */}
          <section className="mt-24 w-full max-w-3xl">
            <h2 className="text-center font-display text-[26px] font-semibold text-white sm:text-[30px]">
              {fr ? "Tout ce dont tu as besoin pour vendre tes beats" : "Everything you need to sell your beats"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-[15px] leading-relaxed text-white/45">
              {fr
                ? "L'app Windows inclut toutes les fonctionnalités de vvault : bibliothèque de beats, gestion de contacts, campagnes email avec tracking, page de vente personnalisée, analytics détaillés et téléchargements payants pour tes clients."
                : "The Windows app includes every vvault feature: beat library, contact management, tracked email campaigns, custom sales page, detailed analytics, and paid downloads for your clients."}
            </p>

            <ul className="mx-auto mt-8 max-w-xl space-y-3 text-[14px] leading-relaxed text-white/55">
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
                <span>
                  {fr
                    ? "Importe tes beats par lot avec auto-détection des tags, du BPM et de la tonalité."
                    : "Bulk-import beats with auto-tagging of BPM, key, and metadata."}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
                <span>
                  {fr
                    ? "Envoie des beats à 50, 500 ou 5000 contacts en un seul clic, avec tracking ouverture, écoutes et téléchargements."
                    : "Send beats to 50, 500, or 5,000 contacts in one click with open, play, and download tracking."}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
                <span>
                  {fr
                    ? "Importe tes contacts depuis un CSV, Gmail, Mailchimp ou Google Sheets en quelques secondes."
                    : "Import contacts from a CSV, Gmail, Mailchimp, or Google Sheets in seconds."}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
                <span>
                  {fr
                    ? "Crée une page de vente publique et encaisse des paiements avec 0% de frais de plateforme sur le plan Ultra."
                    : "Create a public sales page and accept payments with 0% platform fees on Ultra."}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
                <span>
                  {fr
                    ? "Suis ce qui marche : qui ouvre, qui écoute, combien de fois, et pendant combien de temps."
                    : "See what's working: who opened, who played, how many times, and for how long."}
                </span>
              </li>
            </ul>
          </section>

          {/* Install instructions */}
          <section className="mt-24 w-full max-w-3xl">
            <h2 className="text-center font-display text-[26px] font-semibold text-white sm:text-[30px]">
              {fr ? "Comment installer vvault sur Windows" : "How to install vvault on Windows"}
            </h2>
            <ol className="mx-auto mt-8 max-w-xl space-y-4 text-[14px] leading-relaxed text-white/55">
              <li>
                <span className="font-medium text-white/75">
                  {fr ? "1. Télécharge l'installeur .exe" : "1. Download the .exe installer"}
                </span>
                <p className="mt-1 text-white/45">
                  {fr
                    ? "Clique sur le bouton ci-dessus pour récupérer le dernier installeur 64-bit directement depuis nos serveurs."
                    : "Click the button above to grab the latest 64-bit installer directly from our servers."}
                </p>
              </li>
              <li>
                <span className="font-medium text-white/75">
                  {fr ? "2. Lance l'installeur et suis les étapes" : "2. Run the installer and follow the steps"}
                </span>
                <p className="mt-1 text-white/45">
                  {fr
                    ? "Double-clique sur le fichier .exe téléchargé. L'installation prend environ 30 secondes."
                    : "Double-click the downloaded .exe file. Installation takes about 30 seconds."}
                </p>
              </li>
              <li>
                <span className="font-medium text-white/75">
                  {fr ? "3. Lance vvault et connecte-toi" : "3. Launch vvault and log in"}
                </span>
                <p className="mt-1 text-white/45">
                  {fr
                    ? "Connecte-toi avec ton compte vvault existant ou crée-en un gratuitement en moins d'une minute."
                    : "Sign in with your existing vvault account or create one for free in under a minute."}
                </p>
              </li>
            </ol>
          </section>
        </div>
      </main>

      <LandingFooter locale={locale} content={content} />
    </div>
  );
}
