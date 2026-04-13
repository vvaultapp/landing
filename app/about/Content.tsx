"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

export default function AboutPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);
  const fr = locale === "fr";
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = fr ? "vvault | À propos" : "vvault | About";
  }, [fr]);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />
      <main className="relative z-10 mx-auto max-w-[720px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">
        {/* Header */}
        <Reveal>
          <h1
            className="text-center text-3xl font-medium leading-tight tracking-tight sm:text-[2.8rem]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {fr ? "À propos de vvault" : "About vvault"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {fr ? "Créé par des producteurs, pour des producteurs." : "Built by producers, for producers."}
          </p>
        </Reveal>

        <div className="mt-20 space-y-16">
          {/* Mission */}
          <Reveal>
            <h2 className="text-xl font-medium text-white sm:text-2xl">{fr ? "Notre mission" : "Our Mission"}</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {fr
                ? "vvault existe parce qu'envoyer de la musique ne devrait pas être un jeu de devinettes. Pendant trop longtemps, les producteurs ont compté sur des emails à l'aveugle, des fichiers éparpillés et l'espoir. Aucun moyen de savoir si quelqu'un a écouté, aucun moyen de relancer intelligemment, aucun moyen de transformer l'intérêt en vrais placements."
                : "vvault exists because sending music shouldn\u0027t be a guessing game. For too long, producers have relied on blind emails, scattered files, and hope. No way to know if anyone listened, no way to follow up intelligently, no way to turn interest into real placements."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {fr
                ? "On a voulu changer ça. vvault donne à chaque producteur la même visibilité et les mêmes outils que les grands labels considèrent comme acquis — sans la complexité ni le coût."
                : "We set out to change that. vvault gives every producer the same visibility and tools that major labels take for granted \u2014 without the complexity or the cost."}
            </p>
          </Reveal>

          {/* What We Do */}
          <Reveal>
            <h2 className="text-xl font-medium text-white sm:text-2xl">{fr ? "Ce qu'on fait" : "What We Do"}</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {fr
                ? "vvault est une plateforme tout-en-un qui combine gestion de fichiers, campagnes email, analytics en temps réel, CRM et ventes — conçue spécifiquement pour les producteurs de musique. Uploade tes beats, envoie des campagnes ciblées, suis qui ouvre et écoute, gère tes contacts et ton pipeline, et vends des licences directement depuis ton profil ou notre marketplace."
                : "vvault is an all-in-one platform that combines file management, email campaigns, real-time analytics, CRM, and sales \u2014 built specifically for music producers. Upload your beats, send targeted campaigns, track who opens and listens, manage your contacts and pipeline, and sell licenses directly through your profile or our marketplace."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {fr
                ? "Chaque fonctionnalité est pensée autour de la façon dont les producteurs travaillent vraiment. Du tagging de beats avec BPM et tonalité à la planification d'envois au moment parfait, vvault s'intègre naturellement dans ton workflow créatif."
                : "Every feature is designed around how producers actually work. From tagging beats with BPM and key to scheduling sends at the perfect time, vvault fits naturally into your creative workflow."}
            </p>
          </Reveal>

          {/* Team */}
          <Reveal>
            <h2 className="text-xl font-medium text-white sm:text-2xl">{fr ? "Notre équipe" : "Our Team"}</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {fr
                ? "On est une petite équipe de producteurs de musique et de développeurs basés en France. On comprend la frustration d'envoyer des centaines de beats dans le vide parce qu'on l'a vécu nous-mêmes. Cette expérience de première main guide chaque décision qu'on prend — des fonctionnalités qu'on développe à la façon dont on conçoit notre interface."
                : "We\u0027re a small team of music producers and developers based in France. We understand the frustration of sending hundreds of beats into the void because we\u0027ve lived it ourselves. That firsthand experience drives every decision we make \u2014 from the features we build to the way we design our interface."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {fr
                ? "On est passionnés par l'idée d'aider les créateurs indépendants à réussir à leurs propres conditions, sans avoir besoin d'un deal avec un label ou d'un budget marketing pour se faire entendre."
                : "We\u0027re passionate about helping independent creators succeed on their own terms, without needing a label deal or a marketing budget to get heard."}
            </p>
          </Reveal>

          {/* Values */}
          <Reveal>
            <h2 className="text-xl font-medium text-white sm:text-2xl">{fr ? "Nos valeurs" : "Our Values"}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-[14px] font-medium text-white/70 sm:text-[15px]">
                  {fr ? "Transparence" : "Transparency"}
                </h3>
                <p className="mt-1 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
                  {fr
                    ? "Pas de frais cachés, pas de pratiques douteuses avec tes données. Tu sais toujours ce que tu paies et ce qui se passe avec tes données."
                    : "No hidden fees, no shady data practices. You always know what you\u0027re paying for and what happens with your data."}
                </p>
              </div>
              <div>
                <h3 className="text-[14px] font-medium text-white/70 sm:text-[15px]">
                  {fr ? "Simplicité" : "Simplicity"}
                </h3>
                <p className="mt-1 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
                  {fr
                    ? "Des outils puissants n'ont pas besoin d'être compliqués. On s'obsède à rendre chaque fonctionnalité intuitive pour que tu puisses te concentrer sur la musique, pas sur le logiciel."
                    : "Powerful tools don\u0027t have to be complicated. We obsess over making every feature intuitive so you can focus on making music, not learning software."}
                </p>
              </div>
              <div>
                <h3 className="text-[14px] font-medium text-white/70 sm:text-[15px]">
                  {fr ? "Le créateur d'abord" : "Creator-First"}
                </h3>
                <p className="mt-1 text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
                  {fr
                    ? "Chaque décision commence par une question : est-ce que ça aide les producteurs à décrocher des placements et faire avancer leur carrière ? Si la réponse n'est pas oui, on ne le construit pas."
                    : "Every decision starts with one question: does this help producers get placements and grow their careers? If the answer isn\u0027t yes, we don\u0027t build it."}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
      <LandingFooter locale={locale} content={content} showColumns={false} inlineLegalWithBrand />
    </div>
  );
}
