"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DocsLocaleContext } from "./DocsLocaleContext";

/* ------------------------------------------------------------------ */
/*  Sidebar navigation data                                           */
/* ------------------------------------------------------------------ */

type NavItem = { label: string; href: string };
type NavSection = { title: string; items: NavItem[] };

function getNavSections(lang: Lang): NavSection[] {
  const fr = lang === "fr";
  return [
    {
      title: fr ? "Pour commencer" : "Getting started",
      items: [
        { label: "Introduction", href: "/docs/introduction" },
        { label: fr ? "Démarrage rapide" : "Quickstart", href: "/docs/quickstart" },
      ],
    },
    {
      title: fr ? "Fonctionnalités" : "Features",
      items: [
        { label: fr ? "Bibliothèque" : "Library", href: "/docs/library" },
        { label: fr ? "Campagnes" : "Campaigns", href: "/docs/campaigns" },
        { label: fr ? "Analytiques" : "Analytics", href: "/docs/analytics" },
        { label: "Contacts", href: "/docs/contacts" },
        { label: fr ? "Ventes & Marketplace" : "Sales & Marketplace", href: "/docs/sales" },
        { label: fr ? "Opportunités" : "Opportunities", href: "/docs/opportunities" },
        { label: fr ? "Profil" : "Profile", href: "/docs/profile" },
        { label: fr ? "Lien en Bio" : "Link in Bio", href: "/docs/link-in-bio" },
        { label: fr ? "Certificat" : "Certificate", href: "/docs/certificate" },
        { label: fr ? "Sessions d'écriture" : "Writing Sessions", href: "/docs/writing-sessions" },
        { label: fr ? "Équipes" : "Teams", href: "/docs/teams" },
        { label: fr ? "Lecteur audio" : "Audio Player", href: "/docs/audio-player" },
        { label: fr ? "Lecteur embarqué" : "Embed Player", href: "/docs/embed-player" },
        { label: fr ? "Application bureau" : "Desktop App", href: "/docs/desktop-app" },
        { label: fr ? "Liens d'accès" : "Access Links", href: "/docs/access-links" },
        { label: fr ? "Liens de partage" : "Share Links", href: "/docs/share-links" },
      ],
    },
    {
      title: "vvault Studio",
      items: [
        { label: fr ? "Vue d'ensemble" : "Overview", href: "/docs/studio" },
        { label: "WaveMatch", href: "/docs/wavematch" },
      ],
    },
    {
      title: fr ? "Compte" : "Account",
      items: [{ label: fr ? "Plans & Tarifs" : "Plans & Pricing", href: "/docs/plans" }],
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Search index                                                      */
/* ------------------------------------------------------------------ */

type SearchEntry = { title: string; titleFr: string; section: string; sectionFr: string; href: string; keywords: string[] };

const SEARCH_INDEX: SearchEntry[] = [
  // Introduction
  { title: "Introduction", titleFr: "Introduction", section: "Getting started", sectionFr: "Pour commencer", href: "/docs/introduction", keywords: ["introduction", "what is vvault", "overview", "getting started", "qu'est-ce que", "présentation", "commencer"] },
  { title: "What is vvault?", titleFr: "Qu'est-ce que vvault ?", section: "Introduction", sectionFr: "Introduction", href: "/docs/introduction#what-is-vvault", keywords: ["what", "vvault", "about", "platform", "qu'est-ce", "plateforme", "à propos"] },
  { title: "Key features", titleFr: "Fonctionnalités clés", section: "Introduction", sectionFr: "Introduction", href: "/docs/introduction#key-features", keywords: ["features", "key", "overview", "fonctionnalités", "clés"] },
  { title: "Plans", titleFr: "Plans", section: "Introduction", sectionFr: "Introduction", href: "/docs/introduction#plans", keywords: ["plans", "pricing", "free", "pro", "ultra", "tarifs", "gratuit"] },
  { title: "Security & privacy", titleFr: "Sécurité & confidentialité", section: "Introduction", sectionFr: "Introduction", href: "/docs/introduction#security", keywords: ["security", "privacy", "encryption", "safe", "secure", "data", "private", "sécurité", "confidentialité", "chiffrement", "données", "privé"] },
  { title: "Getting help", titleFr: "Obtenir de l'aide", section: "Introduction", sectionFr: "Introduction", href: "/docs/introduction#getting-help", keywords: ["help", "support", "contact", "aide"] },
  // Quickstart
  { title: "Quickstart", titleFr: "Démarrage rapide", section: "Getting started", sectionFr: "Pour commencer", href: "/docs/quickstart", keywords: ["quickstart", "start", "begin", "setup", "guide", "démarrage", "rapide", "commencer"] },
  { title: "Create your account", titleFr: "Crée ton compte", section: "Quickstart", sectionFr: "Démarrage rapide", href: "/docs/quickstart#create-account", keywords: ["account", "create", "sign up", "register", "compte", "créer", "inscription"] },
  { title: "Upload your first tracks", titleFr: "Upload tes premiers morceaux", section: "Quickstart", sectionFr: "Démarrage rapide", href: "/docs/quickstart#upload-tracks", keywords: ["upload", "tracks", "first", "files", "music", "morceaux", "fichiers", "musique"] },
  { title: "Create a pack", titleFr: "Crée un pack", section: "Quickstart", sectionFr: "Démarrage rapide", href: "/docs/quickstart#create-pack", keywords: ["pack", "create", "bundle", "créer"] },
  { title: "Send your first campaign", titleFr: "Envoie ta première campagne", section: "Quickstart", sectionFr: "Démarrage rapide", href: "/docs/quickstart#send-campaign", keywords: ["campaign", "send", "first", "email", "campagne", "envoyer", "première"] },
  { title: "Track engagement", titleFr: "Suis l'engagement", section: "Quickstart", sectionFr: "Démarrage rapide", href: "/docs/quickstart#track-engagement", keywords: ["track", "engagement", "analytics", "suivre"] },
  { title: "Next steps", titleFr: "Étapes suivantes", section: "Quickstart", sectionFr: "Démarrage rapide", href: "/docs/quickstart#next-steps", keywords: ["next", "steps", "continue", "suivant", "étapes"] },
  // Library
  { title: "Library", titleFr: "Bibliothèque", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/library", keywords: ["library", "files", "tracks", "audio", "music", "bibliothèque", "fichiers", "morceaux", "musique"] },
  { title: "Uploading files", titleFr: "Upload de fichiers", section: "Library", sectionFr: "Bibliothèque", href: "/docs/library#uploading", keywords: ["upload", "files", "import", "add", "fichiers", "importer", "ajouter"] },
  { title: "Storage limits", titleFr: "Limites de stockage", section: "Library", sectionFr: "Bibliothèque", href: "/docs/library#storage", keywords: ["storage", "limits", "space", "capacity", "gb", "stockage", "limites", "espace"] },
  { title: "Packs", titleFr: "Packs", section: "Library", sectionFr: "Bibliothèque", href: "/docs/library#packs", keywords: ["packs", "bundle", "collection", "group"] },
  { title: "Metadata", titleFr: "Métadonnées", section: "Library", sectionFr: "Bibliothèque", href: "/docs/library#metadata", keywords: ["metadata", "tags", "bpm", "key", "genre", "info", "métadonnées"] },
  { title: "Folders", titleFr: "Dossiers", section: "Library", sectionFr: "Bibliothèque", href: "/docs/library#folders", keywords: ["folders", "organize", "directory", "dossiers", "organiser"] },
  // Campaigns
  { title: "Campaigns", titleFr: "Campagnes", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/campaigns", keywords: ["campaigns", "email", "send", "outreach", "marketing", "campagnes", "envoyer"] },
  { title: "Channels", titleFr: "Canaux", section: "Campaigns", sectionFr: "Campagnes", href: "/docs/campaigns#channels", keywords: ["channels", "email", "instagram", "messages", "sms", "dm", "canaux"] },
  { title: "Creating a campaign", titleFr: "Créer une campagne", section: "Campaigns", sectionFr: "Campagnes", href: "/docs/campaigns#creating", keywords: ["create", "campaign", "compose", "write", "créer", "campagne", "rédiger"] },
  { title: "Sending limits", titleFr: "Limites d'envoi", section: "Campaigns", sectionFr: "Campagnes", href: "/docs/campaigns#limits", keywords: ["limits", "sending", "daily", "recipients", "quota", "limites", "envoi", "destinataires"] },
  { title: "Gmail integration", titleFr: "Intégration Gmail", section: "Campaigns", sectionFr: "Campagnes", href: "/docs/campaigns#gmail", keywords: ["gmail", "integration", "google", "connect", "oauth", "intégration", "connecter"] },
  { title: "Scheduling", titleFr: "Planification", section: "Campaigns", sectionFr: "Campagnes", href: "/docs/campaigns#scheduling", keywords: ["scheduling", "schedule", "later", "time", "date", "planification", "planifier", "programmer"] },
  // Analytics
  { title: "Analytics", titleFr: "Analytiques", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/analytics", keywords: ["analytics", "stats", "data", "metrics", "tracking", "analytiques", "statistiques", "données", "métriques", "suivi"] },
  { title: "KPI metrics", titleFr: "Métriques KPI", section: "Analytics", sectionFr: "Analytiques", href: "/docs/analytics#kpis", keywords: ["kpi", "metrics", "opens", "clicks", "plays", "downloads", "métriques", "ouvertures", "clics", "écoutes", "téléchargements"] },
  { title: "Dashboard", titleFr: "Tableau de bord", section: "Analytics", sectionFr: "Analytiques", href: "/docs/analytics#dashboard", keywords: ["dashboard", "overview", "summary", "charts", "tableau de bord", "résumé", "graphiques"] },
  { title: "Engagement funnel", titleFr: "Funnel d'engagement", section: "Analytics", sectionFr: "Analytiques", href: "/docs/analytics#funnel", keywords: ["funnel", "engagement", "conversion"] },
  { title: "Best time to send", titleFr: "Meilleur moment pour envoyer", section: "Analytics", sectionFr: "Analytiques", href: "/docs/analytics#best-time", keywords: ["best time", "send", "optimal", "timing", "meilleur moment", "envoyer", "optimal"] },
  // Contacts
  { title: "Contacts", titleFr: "Contacts", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/contacts", keywords: ["contacts", "crm", "people", "recipients", "audience", "destinataires"] },
  { title: "Managing contacts", titleFr: "Gérer les contacts", section: "Contacts", sectionFr: "Contacts", href: "/docs/contacts#managing", keywords: ["managing", "add", "import", "create", "contact", "gérer", "ajouter", "importer"] },
  { title: "Groups and tags", titleFr: "Groupes et tags", section: "Contacts", sectionFr: "Contacts", href: "/docs/contacts#groups", keywords: ["groups", "tags", "segment", "label", "organize", "groupes", "organiser"] },
  { title: "Engagement scoring", titleFr: "Scoring d'engagement", section: "Contacts", sectionFr: "Contacts", href: "/docs/contacts#scoring", keywords: ["scoring", "engagement", "score", "hot", "warm", "cold"] },
  { title: "Contact timeline", titleFr: "Timeline de contact", section: "Contacts", sectionFr: "Contacts", href: "/docs/contacts#timeline", keywords: ["timeline", "activity", "history", "log", "activité", "historique"] },
  // Sales
  { title: "Sales & Marketplace", titleFr: "Ventes & Marketplace", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/sales", keywords: ["sales", "marketplace", "sell", "store", "commerce", "ventes", "vendre", "boutique"] },
  { title: "License types", titleFr: "Types de licences", section: "Sales", sectionFr: "Ventes", href: "/docs/sales#licenses", keywords: ["license", "types", "basic", "premium", "stems", "exclusive", "unlimited", "sound kit", "licences"] },
  { title: "Pricing", titleFr: "Tarification", section: "Sales", sectionFr: "Ventes", href: "/docs/sales#pricing", keywords: ["pricing", "price", "cost", "set price", "tarifs", "prix"] },
  { title: "Commission", titleFr: "Commission", section: "Sales", sectionFr: "Ventes", href: "/docs/sales#commission", keywords: ["commission", "fee", "percentage", "5%", "0%", "frais"] },
  { title: "Payouts", titleFr: "Paiements", section: "Sales", sectionFr: "Ventes", href: "/docs/sales#payouts", keywords: ["payouts", "payout", "withdrawal", "money", "payment", "7-day", "paiements", "retrait", "argent"] },
  { title: "Checkout flow", titleFr: "Flux de paiement", section: "Sales", sectionFr: "Ventes", href: "/docs/sales#checkout", keywords: ["checkout", "flow", "purchase", "buy", "paiement", "achat", "acheter"] },
  // Opportunities
  { title: "Opportunities", titleFr: "Opportunités", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/opportunities", keywords: ["opportunities", "placements", "submissions", "requests", "opportunités", "soumissions", "demandes"] },
  { title: "How it works", titleFr: "Comment ça marche", section: "Opportunities", sectionFr: "Opportunités", href: "/docs/opportunities#how-it-works", keywords: ["how", "works", "process", "comment", "marche", "processus"] },
  { title: "Categories", titleFr: "Catégories", section: "Opportunities", sectionFr: "Opportunités", href: "/docs/opportunities#categories", keywords: ["categories", "types", "genres", "catégories"] },
  { title: "Submissions", titleFr: "Soumissions", section: "Opportunities", sectionFr: "Opportunités", href: "/docs/opportunities#submissions", keywords: ["submissions", "submit", "apply", "send", "soumissions", "soumettre", "envoyer"] },
  { title: "Paid submissions", titleFr: "Soumissions payantes", section: "Opportunities", sectionFr: "Opportunités", href: "/docs/opportunities#paid", keywords: ["paid", "submissions", "premium", "cost", "payantes", "coût"] },
  // Profile
  { title: "Profile", titleFr: "Profil", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/profile", keywords: ["profile", "page", "public", "artist", "profil", "artiste"] },
  { title: "Public page", titleFr: "Page publique", section: "Profile", sectionFr: "Profil", href: "/docs/profile#public-page", keywords: ["public", "page", "profile", "visible", "publique", "profil"] },
  { title: "Placements", titleFr: "Placements", section: "Profile", sectionFr: "Profil", href: "/docs/profile#placements", keywords: ["placements", "credits", "work", "crédits"] },
  { title: "Social links", titleFr: "Liens sociaux", section: "Profile", sectionFr: "Profil", href: "/docs/profile#social", keywords: ["social", "links", "instagram", "spotify", "youtube", "liens", "sociaux"] },
  { title: "Theme customization", titleFr: "Personnalisation du thème", section: "Profile", sectionFr: "Profil", href: "/docs/profile#themes", keywords: ["theme", "customization", "colors", "appearance", "design", "thème", "personnalisation", "couleurs", "apparence"] },
  // Link in Bio
  { title: "Link in Bio", titleFr: "Lien en Bio", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/link-in-bio", keywords: ["link in bio", "bio", "linktree", "links", "landing", "lien"] },
  { title: "Overview", titleFr: "Aperçu", section: "Link in Bio", sectionFr: "Lien en Bio", href: "/docs/link-in-bio#overview", keywords: ["overview", "about", "aperçu", "à propos"] },
  { title: "What's included", titleFr: "Ce qui est inclus", section: "Link in Bio", sectionFr: "Lien en Bio", href: "/docs/link-in-bio#included", keywords: ["included", "features", "what", "inclus", "fonctionnalités"] },
  // Studio
  { title: "Studio", titleFr: "Studio", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/studio", keywords: ["studio", "video", "content", "create", "automated", "publishing", "vidéo", "contenu", "créer", "automatique"] },
  { title: "Automated publishing", titleFr: "Publication automatique", section: "Studio", sectionFr: "Studio", href: "/docs/studio#automated-publishing", keywords: ["automated", "publishing", "auto", "post", "social", "publication", "automatique"] },
  { title: "Video specs", titleFr: "Spécifications vidéo", section: "Studio", sectionFr: "Studio", href: "/docs/studio#specs", keywords: ["video", "specs", "specifications", "format", "resolution", "vidéo", "spécifications", "résolution"] },
  { title: "Templates", titleFr: "Templates", section: "Studio", sectionFr: "Studio", href: "/docs/studio#templates", keywords: ["templates", "tokens", "dynamic", "name", "bpm", "key", "link", "description", "title"] },
  { title: "Scheduling", titleFr: "Programmation", section: "Studio", sectionFr: "Studio", href: "/docs/studio#scheduling", keywords: ["scheduling", "interval", "timezone", "queue", "programmation", "intervalle", "fuseau"] },
  { title: "Availability", titleFr: "Disponibilité", section: "Studio", sectionFr: "Studio", href: "/docs/studio#availability", keywords: ["availability", "available", "access", "disponibilité", "disponible", "accès"] },
  // WaveMatch
  { title: "WaveMatch", titleFr: "WaveMatch", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/wavematch", keywords: ["wavematch", "content id", "identification", "beat matching", "find who used my beat", "beat stolen", "content identification", "unauthorized use"] },
  { title: "Upload methods", titleFr: "Méthodes d'upload", section: "WaveMatch", sectionFr: "WaveMatch", href: "/docs/wavematch#upload-methods", keywords: ["upload", "scan", "local", "storage", "autoscan", "file", "fichier"] },
  { title: "Results & history", titleFr: "Résultats & historique", section: "WaveMatch", sectionFr: "WaveMatch", href: "/docs/wavematch#results", keywords: ["results", "history", "matches", "platform", "résultats", "historique", "correspondances"] },
  { title: "Use cases", titleFr: "Cas d'utilisation", section: "WaveMatch", sectionFr: "WaveMatch", href: "/docs/wavematch#use-cases", keywords: ["use cases", "royalties", "content id", "unauthorized", "placements", "cas", "utilisation"] },
  // Certificate
  { title: "Certificate", titleFr: "Certificat", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/certificate", keywords: ["certificate", "verification", "proof", "authenticity", "certificat", "vérification", "preuve", "authenticité"] },
  { title: "Protection", titleFr: "Protection", section: "Certificate", sectionFr: "Certificat", href: "/docs/certificate#protection", keywords: ["protection", "copyright", "ownership", "droits", "propriété"] },
  // Writing Sessions
  { title: "Writing Sessions", titleFr: "Sessions d'écriture", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/writing-sessions", keywords: ["writing sessions", "collaborative beat making", "producer collaboration tool", "music writing session", "beat battle platform", "split sheet management", "producer credits", "sessions", "écriture", "collaboration"] },
  { title: "Session dashboard", titleFr: "Tableau de bord de session", section: "Writing Sessions", sectionFr: "Sessions d'écriture", href: "/docs/writing-sessions#session-dashboard", keywords: ["dashboard", "tracks", "participants", "activity", "tableau de bord", "morceaux", "participants", "activité"] },
  { title: "Voting & tagging", titleFr: "Votes et tags", section: "Writing Sessions", sectionFr: "Sessions d'écriture", href: "/docs/writing-sessions#voting-system", keywords: ["voting", "tagging", "upvote", "reactions", "keeper", "maybe", "scratch", "votes", "tags"] },
  { title: "Split management", titleFr: "Gestion des splits", section: "Writing Sessions", sectionFr: "Sessions d'écriture", href: "/docs/writing-sessions#splits", keywords: ["splits", "royalty", "credits", "contributor", "shares", "royalties", "crédits", "contributeur"] },
  { title: "Use cases", titleFr: "Cas d'utilisation", section: "Writing Sessions", sectionFr: "Sessions d'écriture", href: "/docs/writing-sessions#use-cases", keywords: ["beat battle", "collaborative pack", "A&R review", "team production", "cas", "utilisation"] },
  // Teams
  { title: "Teams", titleFr: "Équipes", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/teams", keywords: ["teams", "producer team management", "music production team", "collaborative workspace producers", "shared beat library", "équipes", "collectif", "label"] },
  { title: "Creating a team", titleFr: "Créer une équipe", section: "Teams", sectionFr: "Équipes", href: "/docs/teams#creating-teams", keywords: ["create", "team", "name", "avatar", "banner", "créer", "équipe"] },
  { title: "Inviting members", titleFr: "Inviter des membres", section: "Teams", sectionFr: "Équipes", href: "/docs/teams#inviting-members", keywords: ["invite", "members", "join", "link", "token", "role", "inviter", "membres", "lien", "rôle"] },
  { title: "Team profile", titleFr: "Profil d'équipe", section: "Teams", sectionFr: "Équipes", href: "/docs/teams#team-profile", keywords: ["team profile", "branding", "public", "shared workspace", "profil", "équipe"] },
  { title: "Use cases", titleFr: "Cas d'utilisation", section: "Teams", sectionFr: "Équipes", href: "/docs/teams#use-cases", keywords: ["collective", "label", "beat-selling", "group", "collectif", "groupe"] },
  // Access Links
  { title: "Access Links", titleFr: "Liens d'accès", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/access-links", keywords: ["access links", "secure beat sharing", "private music sharing link", "beat pack access control", "share beats securely", "liens", "accès", "partage", "sécurisé"] },
  { title: "Permission tiers", titleFr: "Niveaux de permissions", section: "Access Links", sectionFr: "Liens d'accès", href: "/docs/access-links#permission-tiers", keywords: ["permission", "tiers", "viewer", "commenter", "editor", "niveaux", "permissions", "lecteur", "éditeur"] },
  { title: "Audience modes", titleFr: "Modes d'audience", section: "Access Links", sectionFr: "Liens d'accès", href: "/docs/access-links#audience-modes", keywords: ["audience", "anyone", "invites only", "revoke", "regenerate", "public", "privé", "invitation"] },
  { title: "Access requests", titleFr: "Demandes d'accès", section: "Access Links", sectionFr: "Liens d'accès", href: "/docs/access-links#access-requests", keywords: ["access request", "approve", "deny", "notification", "demande", "accès", "approuver", "refuser"] },
  // Audio Player
  { title: "Audio Player", titleFr: "Lecteur audio", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/audio-player", keywords: ["audio player", "player", "playback", "waveform", "queue", "beat player", "music player", "lecteur", "audio", "lecture"] },
  { title: "Playback modes", titleFr: "Modes de lecture", section: "Audio Player", sectionFr: "Lecteur audio", href: "/docs/audio-player#playback-modes", keywords: ["playback", "repeat", "shuffle", "loop", "lecture", "aléatoire", "boucle"] },
  { title: "Audio quality", titleFr: "Qualité audio", section: "Audio Player", sectionFr: "Lecteur audio", href: "/docs/audio-player#audio-quality", keywords: ["quality", "ultra", "compressed", "lossless", "qualité", "compressé"] },
  { title: "Queue management", titleFr: "Gestion de la file", section: "Audio Player", sectionFr: "Lecteur audio", href: "/docs/audio-player#queue", keywords: ["queue", "next", "previous", "pack", "file", "suivant", "précédent"] },
  // Embed Player
  { title: "Embed Player", titleFr: "Lecteur embarqué", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/embed-player", keywords: ["embed", "player", "widget", "website", "portfolio", "iframe", "embarqué", "site web", "embed beat player on website", "music embed player"] },
  { title: "Track embed", titleFr: "Embed de track", section: "Embed Player", sectionFr: "Lecteur embarqué", href: "/docs/embed-player#track-embed", keywords: ["track", "single", "embed", "waveform"] },
  { title: "Pack embed", titleFr: "Embed de pack", section: "Embed Player", sectionFr: "Lecteur embarqué", href: "/docs/embed-player#pack-embed", keywords: ["pack", "multi", "tracklist", "album"] },
  { title: "Embed tracking", titleFr: "Suivi des embeds", section: "Embed Player", sectionFr: "Lecteur embarqué", href: "/docs/embed-player#tracking", keywords: ["tracking", "analytics", "plays", "embed source", "suivi"] },
  // Desktop App
  { title: "Desktop App", titleFr: "Application bureau", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/desktop-app", keywords: ["desktop", "app", "native", "macos", "windows", "electron", "offline", "sync", "application", "bureau", "producer desktop app"] },
  { title: "File sync", titleFr: "Synchronisation de fichiers", section: "Desktop App", sectionFr: "Application bureau", href: "/docs/desktop-app#file-sync", keywords: ["sync", "folder", "upload", "local", "synchronisation", "dossier"] },
  { title: "Native notifications", titleFr: "Notifications natives", section: "Desktop App", sectionFr: "Application bureau", href: "/docs/desktop-app#notifications", keywords: ["notifications", "alerts", "native", "os", "alertes"] },
  { title: "Download desktop app", titleFr: "Télécharger l'application", section: "Desktop App", sectionFr: "Application bureau", href: "/docs/desktop-app#download", keywords: ["download", "install", "macos", "windows", "télécharger", "installer"] },
  // Share Links
  { title: "Share Links", titleFr: "Liens de partage", section: "Features", sectionFr: "Fonctionnalités", href: "/docs/share-links", keywords: ["share", "links", "download", "pack", "track", "send beats", "share beat pack link", "tracked music sharing", "partage", "liens", "télécharger"] },
  { title: "Share pages", titleFr: "Pages de partage", section: "Share Links", sectionFr: "Liens de partage", href: "/docs/share-links#share-pages", keywords: ["share page", "preview", "tracklist", "cover", "page", "partage"] },
  { title: "Downloads", titleFr: "Téléchargements", section: "Share Links", sectionFr: "Liens de partage", href: "/docs/share-links#downloads", keywords: ["download", "zip", "password", "rate limit", "téléchargement"] },
  { title: "Short links", titleFr: "Liens courts", section: "Share Links", sectionFr: "Liens de partage", href: "/docs/share-links#short-links", keywords: ["short", "link", "slug", "social media", "court", "lien"] },
  // Smart Segments (in Contacts)
  { title: "Smart Segments", titleFr: "Segments intelligents", section: "Contacts", sectionFr: "Contacts", href: "/docs/contacts#smart-segments", keywords: ["smart segments", "segmentation", "rules", "AND/OR", "hot leads", "warm leads", "cold leads", "audience", "segments", "intelligents", "règles"] },
  // Email Sequences (in Campaigns)
  { title: "Email Sequences", titleFr: "Séquences email", section: "Campaigns", sectionFr: "Campagnes", href: "/docs/campaigns#email-sequences", keywords: ["email sequences", "drip", "automation", "multi-step", "automated campaign", "séquences", "email", "automatisation"] },
  // Placements (in Profile)
  { title: "Placements & Credits", titleFr: "Placements & crédits", section: "Profile", sectionFr: "Profil", href: "/docs/profile#placements", keywords: ["placements", "credits", "production credits", "spotify", "youtube", "apple music", "verified", "crédits", "production"] },
  // Marketplace Checkout (in Sales)
  { title: "Checkout details", titleFr: "Détails du checkout", section: "Sales", sectionFr: "Ventes", href: "/docs/sales#checkout-details", keywords: ["checkout", "license", "PDF", "mp3 lease", "wav lease", "stems", "exclusive", "paiement", "licence"] },
  // Plans
  { title: "Plans & Pricing", titleFr: "Plans & Tarifs", section: "Account", sectionFr: "Compte", href: "/docs/plans", keywords: ["plans", "pricing", "subscription", "cost", "free", "pro", "ultra", "tarifs", "abonnement", "coût", "gratuit"] },
  { title: "Free plan", titleFr: "Plan Free", section: "Plans", sectionFr: "Plans", href: "/docs/plans#free", keywords: ["free", "plan", "starter", "basic", "gratuit"] },
  { title: "Pro plan", titleFr: "Plan Pro", section: "Plans", sectionFr: "Plans", href: "/docs/plans#pro", keywords: ["pro", "plan", "8.99", "paid", "payant"] },
  { title: "Ultra plan", titleFr: "Plan Ultra", section: "Plans", sectionFr: "Plans", href: "/docs/plans#ultra", keywords: ["ultra", "plan", "24.99", "premium", "top"] },
  { title: "Comparison table", titleFr: "Tableau comparatif", section: "Plans", sectionFr: "Plans", href: "/docs/plans#comparison", keywords: ["comparison", "compare", "table", "differences", "comparaison", "comparer", "tableau", "différences"] },
];

/* ------------------------------------------------------------------ */
/*  i18n                                                              */
/* ------------------------------------------------------------------ */

type Lang = "en" | "fr";

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    "Getting started": "Getting started",
    Features: "Features",
    Account: "Account",
    Introduction: "Introduction",
    Quickstart: "Quickstart",
    Library: "Library",
    Campaigns: "Campaigns",
    Analytics: "Analytics",
    Contacts: "Contacts",
    "Sales & Marketplace": "Sales & Marketplace",
    Opportunities: "Opportunities",
    Profile: "Profile",
    "Link in Bio": "Link in Bio",
    Studio: "Studio",
    WaveMatch: "WaveMatch",
    Certificate: "Certificate",
    "Writing Sessions": "Writing Sessions",
    Teams: "Teams",
    "Audio Player": "Audio Player",
    "Embed Player": "Embed Player",
    "Desktop App": "Desktop App",
    "Access Links": "Access Links",
    "Share Links": "Share Links",
    Overview: "Overview",
    "vvault Studio": "vvault Studio",
    "Plans & Pricing": "Plans & Pricing",
    "Search docs...": "Search docs...",
    "On this page": "On this page",
    "Log in": "Log in",
    "Sign up": "Sign up",
    "Back to home": "Back to home",
    "Get started": "Get started",
    Light: "Light",
    Dark: "Dark",
    English: "English",
    French: "French",
    Homepage: "Homepage",
    "Links menu": "Links menu",
    "Toggle navigation": "Toggle navigation",
  },
  fr: {
    "Getting started": "Pour commencer",
    Features: "Fonctionnalités",
    Account: "Compte",
    Introduction: "Introduction",
    Quickstart: "Démarrage rapide",
    Library: "Bibliothèque",
    Campaigns: "Campagnes",
    Analytics: "Analytiques",
    Contacts: "Contacts",
    "Sales & Marketplace": "Ventes & Marketplace",
    Opportunities: "Opportunités",
    Profile: "Profil",
    "Link in Bio": "Lien en Bio",
    Studio: "Studio",
    WaveMatch: "WaveMatch",
    Certificate: "Certificat",
    "Writing Sessions": "Sessions d'écriture",
    Teams: "Équipes",
    "Audio Player": "Lecteur audio",
    "Embed Player": "Lecteur embarqué",
    "Desktop App": "Application bureau",
    "Access Links": "Liens d'accès",
    "Share Links": "Liens de partage",
    Overview: "Vue d'ensemble",
    "vvault Studio": "vvault Studio",
    "Plans & Pricing": "Plans & Tarifs",
    "Search docs...": "Rechercher...",
    "On this page": "Sur cette page",
    "Log in": "Connexion",
    "Sign up": "S'inscrire",
    "Back to home": "Retour à l'accueil",
    "Get started": "Commencer",
    Light: "Clair",
    Dark: "Sombre",
    English: "Anglais",
    French: "Français",
    Homepage: "Accueil",
    "Links menu": "Menu des liens",
    "Toggle navigation": "Basculer la navigation",
  },
};

function t(key: string, lang: Lang): string {
  return TRANSLATIONS[lang]?.[key] ?? key;
}

/* ------------------------------------------------------------------ */
/*  Search bar with live suggestions                                  */
/* ------------------------------------------------------------------ */

function SearchBar({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isFr = lang === "fr";
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const scored = SEARCH_INDEX.map((entry) => {
      const displayTitle = isFr ? entry.titleFr : entry.title;
      const displaySection = isFr ? entry.sectionFr : entry.section;
      let score = 0;
      if (displayTitle.toLowerCase().includes(q)) score += 10;
      if (displayTitle.toLowerCase().startsWith(q)) score += 5;
      if (entry.title.toLowerCase().includes(q)) score += 8;
      if (entry.title.toLowerCase().startsWith(q)) score += 4;
      if (displaySection.toLowerCase().includes(q)) score += 3;
      if (entry.section.toLowerCase().includes(q)) score += 2;
      for (const kw of entry.keywords) {
        if (kw.includes(q)) score += 4;
        if (kw.startsWith(q)) score += 2;
      }
      return { ...entry, displayTitle, displaySection, score };
    }).filter((e) => e.score > 0);
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 8);
  }, [query, isFr]);

  useEffect(() => setSelectedIndex(-1), [results]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "/") {
        if (focused) {
          e.preventDefault();
          inputRef.current?.blur();
        } else if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
      if (e.key === "Escape" && focused) {
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [focused]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex].href);
    }
  }

  function navigate(href: string) {
    setQuery("");
    setFocused(false);
    inputRef.current?.blur();
    router.push(href);
  }

  const showDropdown = focused && results.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-1.5 text-[13px] outline-none transition-all duration-300 ease-out ${
          focused ? "border-[#ccc] shadow-sm" : "border-[#e5e5e5] hover:border-[#ccc]"
        }`}
        style={{}}
        onClick={() => inputRef.current?.focus()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={focused ? "#666" : "#bbb"} strokeWidth="2" strokeLinecap="round" className="shrink-0 transition-colors">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("Search docs...", lang)}
          className="min-w-0 flex-1 bg-transparent text-[#333] placeholder-[#bbb] outline-none focus:outline-none focus:ring-0"
          style={{ outline: "none", boxShadow: "none" }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
        <kbd className={`rounded-md border border-[#e5e5e5] bg-[#fafafa] px-1.5 py-0.5 font-sans text-[11px] text-[#bbb] transition-opacity duration-150 ${focused ? "opacity-0" : "opacity-100"}`}>/</kbd>
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-lg">
          {results.map((r, i) => (
            <button
              key={r.href}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); navigate(r.href); }}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[13px] transition-colors ${
                i === selectedIndex ? "bg-[#f5f5f5]" : "hover:bg-[#fafafa]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
                <path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[#111]">{r.displayTitle}</p>
                <p className="truncate text-[12px] text-[#999]">{r.displaySection}</p>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                           */
/* ------------------------------------------------------------------ */

function Sidebar({ pathname, onNavigate, lang }: { pathname: string; onNavigate?: () => void; lang: Lang }) {
  return (
    <nav className="flex flex-col gap-6">
      {getNavSections(lang).map((section) => (
        <div key={section.title}>
          <p className="mb-1.5 text-[13px] font-semibold text-[#1a1a1a]">
            {section.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`block rounded-xl px-2.5 py-1.5 text-[13.5px] transition-colors ${
                      active
                        ? "bg-[#f0f0f0] font-medium text-[#111]"
                        : "text-[#666] hover:bg-[#f5f5f5] hover:text-[#222]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  "On this page" TOC with progress bar                              */
/* ------------------------------------------------------------------ */

function TableOfContents({ lang }: { lang: Lang }) {
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const isClickScrolling = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    // Re-read headings whenever the route OR the language changes — docs
    // pages render their h2 text via useDocsLocale(), so a language switch
    // mutates textContent in place without changing the route. We need to
    // pick up the new strings immediately, not on next focus.
    const readHeadings = () => {
      const container = document.getElementById("docs-content");
      if (!container) return;
      const els = container.querySelectorAll("h2[id]");
      const items: { id: string; text: string }[] = [];
      els.forEach((el) => items.push({ id: el.id, text: el.textContent ?? "" }));
      setHeadings(items);
      if (items.length > 0) {
        setActiveId((current) =>
          current && items.some((i) => i.id === current) ? current : items[0].id,
        );
      }
    };
    // Fast path: pick up the new language synchronously after React commits.
    const rafId = requestAnimationFrame(readHeadings);
    // Safety net: also re-read after a tick in case content streams in.
    const timer = setTimeout(readHeadings, 150);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [pathname, lang]);

  useEffect(() => {
    if (headings.length === 0) return;
    const scrollRoot = document.getElementById("docs-content")?.closest("main") as HTMLElement | null;
    if (!scrollRoot) return;

    const updateActive = () => {
      if (isClickScrolling.current) return;

      // Hard guard: when we're at the very top of the page, always highlight
      // the first heading — regardless of how tall the first section is or
      // how far the threshold line sits.
      if (scrollRoot.scrollTop < 40) {
        setActiveId(headings[0].id);
        return;
      }

      const rootTop = scrollRoot.getBoundingClientRect().top;
      // Active heading = last heading whose top has crossed this threshold line.
      // Threshold sits ~1/3 down the viewport so the indicator flips to the next
      // section while the heading is still a comfortable reading-distance below
      // the top, but not so far that it reaches the middle of the page.
      const viewportH = scrollRoot.clientHeight;
      const threshold = rootTop + Math.max(140, viewportH * 0.33);
      let currentId = headings[0].id;
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= threshold) {
          currentId = id;
        } else {
          break;
        }
      }
      setActiveId(currentId);
    };

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        updateActive();
      });
    };

    updateActive();
    scrollRoot.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      scrollRoot.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [headings]);

  const handleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActiveId(id);
    isClickScrolling.current = true;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => { isClickScrolling.current = false; }, 800);
    }
  }, []);

  if (headings.length === 0) return null;

  const activeIndex = headings.findIndex((h) => h.id === activeId);

  return (
    <div>
      <p className="mb-3 pl-3 text-[13px] font-semibold text-[#1a1a1a]">
        {t("On this page", lang)}
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-[#e5e5e5]" />
        {activeIndex >= 0 && (
          <div
            className="absolute left-0 w-0.5 rounded-full bg-[#111] transition-[top] duration-200 ease-out"
            style={{ top: `${activeIndex * 32 + 4}px`, height: "24px" }}
          />
        )}
        <div className="flex flex-col">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={`block py-1 pl-3 text-[13px] leading-snug transition-colors ${
                activeId === h.id ? "font-medium text-[#111]" : "text-[#999] hover:text-[#444]"
              }`}
              style={{ minHeight: "32px", display: "flex", alignItems: "center" }}
            >
              {h.text}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile hamburger icon                                             */
/* ------------------------------------------------------------------ */

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#666]">
      {open ? (
        <>
          <path d="M4.5 4.5l9 9" />
          <path d="M13.5 4.5l-9 9" />
        </>
      ) : (
        <>
          <path d="M3 5.5h12" />
          <path d="M3 9h12" />
          <path d="M3 12.5h12" />
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Language selector                                                 */
/* ------------------------------------------------------------------ */

function LanguageSelector({
  lang,
  setLang,
  placement = "bottom-right",
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  /**
   * Where the dropdown panel opens relative to the trigger button.
   * - "bottom-right" (default): opens below, right-aligned (header / desktop)
   * - "top-left": opens above, left-aligned (mobile sidebar bottom bar)
   */
  placement?: "bottom-right" | "top-left";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const dropdownPositionClass =
    placement === "top-left"
      ? "left-0 bottom-full mb-1"
      : "right-0 top-full mt-1";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-[13px] text-[#666] transition-colors hover:text-[#111]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{lang === "en" ? "EN" : "FR"}</span>
      </button>
      {open && (
        <div className={`absolute ${dropdownPositionClass} z-50 w-36 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-lg`}>
          <button
            type="button"
            onClick={() => { setLang("en"); setOpen(false); }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${lang === "en" ? "bg-[#f5f5f5] font-medium text-[#111]" : "text-[#666] hover:bg-[#fafafa]"}`}
          >
            {t("English", lang)}
          </button>
          <button
            type="button"
            onClick={() => { setLang("fr"); setOpen(false); }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${lang === "fr" ? "bg-[#f5f5f5] font-medium text-[#111]" : "text-[#666] hover:bg-[#fafafa]"}`}
          >
            {t("French", lang)}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Links menu (link icon → homepage)                                 */
/* ------------------------------------------------------------------ */

function LinksMenu({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-xl px-2 py-1.5 text-[#666] transition-colors hover:text-[#111]"
        aria-label={t("Links menu", lang)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-lg">
          <a
            href="/"
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#666] transition-colors hover:bg-[#fafafa] hover:text-[#111]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {t("Homepage", lang)}
          </a>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout                                                            */
/* ------------------------------------------------------------------ */

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [mounted, setMounted] = useState(false);

  /* Detect language from landing page (localStorage), cookie (IP detection), or browser */
  useEffect(() => {
    try {
      // 1. Check localStorage (set by landing page or docs language selector)
      const shared = localStorage.getItem("vvault-locale") as Lang | null;
      const stored = localStorage.getItem("vvault-docs-lang") as Lang | null;
      const fromStorage = shared ?? stored;
      if (fromStorage === "en" || fromStorage === "fr") {
        setLang(fromStorage);
      } else {
        // 2. Check cookie set by proxy (IP-based detection)
        const cookieMatch = document.cookie.match(/(?:^|;\s*)vvault_locale=(en|fr)/);
        if (cookieMatch) {
          setLang(cookieMatch[1] as Lang);
        } else {
          // 3. Check browser language
          const browserLang = navigator.language.toLowerCase();
          if (browserLang.startsWith("fr")) {
            setLang("fr");
          }
        }
      }
    } catch {}
    setMounted(true);
  }, []);

  /* Persist language to both keys */
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("vvault-docs-lang", lang);
      localStorage.setItem("vvault-locale", lang);
    } catch {}
  }, [lang, mounted]);

  /* Force light scrollbar + background on docs pages */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.style.colorScheme = "light";
    body.style.background = "#fafafa";
    return () => {
      html.style.colorScheme = "";
      body.style.background = "";
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    requestAnimationFrame(() => {
      if (mainRef.current) mainRef.current.scrollTop = 0;
    });
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* Sidebar scroll indicator — show on scroll, auto-hide after 1s */
  useEffect(() => {
    const el = sidebarScrollRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      el.classList.add("is-scrolling");
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove("is-scrolling"), 1000);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="docs-root flex h-screen flex-col bg-[#fafafa] font-sans text-[#1a1a1a]" suppressHydrationWarning>
      {/* -------- Top bar (fixed height) -------- */}
      <header className="z-50 shrink-0 bg-[#fafafa]">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between">
          <div className="flex shrink-0 items-center gap-3 pl-[18px] md:w-60">
            {/* Logo + animated "Back to home" arrow.
                The whole thing is ONE Link so a single tap on mobile (or
                anywhere on desktop, even mid-animation) navigates home. */}
            <Link
              href={lang === "fr" ? "/fr" : "/"}
              aria-label={t("Back to home", lang)}
              className="relative flex items-center"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
              onTouchStart={() => setLogoHovered(true)}
            >
              <span
                className="pointer-events-none flex items-center gap-1.5 transition-transform duration-300 ease-out"
                style={{
                  transform: logoHovered ? "translate3d(24px, 0, 0)" : "translate3d(0, 0, 0)",
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                }}
              >
                <span className="font-semibold text-[#111]" style={{ fontSize: "20px", lineHeight: 1, letterSpacing: "0.14em" }}>
                  VVAULT
                </span>
                <span className="font-semibold text-[#111]" style={{ fontSize: "20px", lineHeight: 1 }}>
                  Docs
                </span>
              </span>

              {/* "Back to home" arrow — centered with logo, decorative only */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-1/2 flex items-center whitespace-nowrap rounded-xl text-[#999] transition-all duration-300 ease-out"
                style={{
                  transform: logoHovered ? "translate3d(0, calc(-50% + 1px), 0)" : "translate3d(12px, calc(-50% + 1px), 0)",
                  opacity: logoHovered ? 1 : 0,
                  filter: logoHovered ? "blur(0px)" : "blur(4px)",
                  willChange: "transform, opacity, filter",
                  backfaceVisibility: "hidden",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Desktop / iPad: all buttons */}
          <div className="hidden flex-1 items-center justify-end gap-1.5 px-6 md:flex">
            <LinksMenu lang={lang} />
            <LanguageSelector lang={lang} setLang={setLang} />
            <a
              href="https://vvault.app/login"
              className="rounded-xl px-3 py-1.5 text-[13px] text-[#666] transition-colors hover:text-[#111]"
            >
              {t("Log in", lang)}
            </a>
            <a
              href="https://vvault.app/signup"
              className="rounded-xl bg-[#111] px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#333]"
            >
              {t("Sign up", lang)}
            </a>
          </div>
          {/* Small mobile only (< iPad portrait): sign up + hamburger */}
          <div className="flex flex-1 items-center justify-end gap-2 px-4 md:hidden">
            <a
              href="https://vvault.app/signup"
              className="rounded-xl bg-[#111] px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#333]"
            >
              {t("Sign up", lang)}
            </a>
            <button type="button" onClick={() => setMobileOpen((v) => !v)} aria-label={t("Toggle navigation", lang)} className="flex h-9 w-9 items-center justify-center rounded-xl text-[#666] transition-colors hover:text-[#111]">
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* -------- Mobile overlay (< iPad portrait only) -------- */}
      {mobileOpen && (
        <div className="fixed inset-0 top-14 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={closeMobile} />
      )}

      {/* -------- Three-column body (fills remaining height) -------- */}
      <div className="mx-auto flex w-full min-h-0 flex-1 max-w-[1440px] px-2 sm:px-0">
        {/* Left sidebar — scrolls independently */}
        <aside
          className={`docs-mobile-sidebar fixed left-0 top-14 z-40 flex w-60 shrink-0 flex-col bg-[#fafafa] transition-transform duration-200 ease-in-out md:relative md:left-auto md:top-0 md:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Scrollable nav content — native scroll with visible
              indicator. `WebKitOverflowScrolling: touch` enables
              momentum scrolling on iOS Safari so the sidebar doesn't
              feel dead when swiped on iPad. */}
          <div
            ref={sidebarScrollRef}
            className="docs-sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pl-[18px] pr-2 pb-4 pt-5"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {/* Search bar in sidebar */}
            <div className="mb-5">
              <SearchBar lang={lang} />
            </div>
            <Sidebar pathname={pathname} onNavigate={closeMobile} lang={lang} />
          </div>

          {/* Small-mobile-only (< iPad portrait): pinned bottom bar */}
          <div className="shrink-0 border-t border-[#e5e5e5] bg-[#fafafa] px-[18px] md:hidden" style={{ padding: "12px 18px calc(12px + env(safe-area-inset-bottom))" }}>
            <div className="flex items-center justify-between">
              <LanguageSelector lang={lang} setLang={setLang} placement="top-left" />
              <a
                href="https://vvault.app/signup"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] font-semibold text-[#111] transition-colors hover:border-[#ccc] hover:bg-[#fafafa]"
              >
                {t("Get started", lang)}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </aside>

        {/* Main content — scrolls internally, rounded corners stay */}
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto rounded-t-2xl border border-b-0 border-[#e5e5e5] bg-white">
          <div className="px-6 pb-24 pt-8 sm:px-10 lg:px-16">
            <div id="docs-content" className="mx-auto max-w-[720px]" suppressHydrationWarning>
              {/* Always render children so SSR exposes the H1, headings and body
                  text to crawlers. Locale defaults to "en" on the server and
                  switches client-side once useEffect resolves the user's
                  preference. */}
              <DocsLocaleContext.Provider value={lang}>
                {children}
              </DocsLocaleContext.Provider>
            </div>
          </div>
        </main>

        {/* Right sidebar — TOC, scrolls independently. Shown from
            `lg` (1024px) up so iPad landscape and most laptops get
            the "On this page" panel. Previously `xl:block` gated
            this at 1280px, which left every iPad and smaller
            laptop without it. */}
        <aside className="hidden w-52 shrink-0 overflow-y-auto bg-[#fafafa] pl-5 pr-3 pb-10 pt-8 lg:block">
          <TableOfContents lang={lang} />
        </aside>
      </div>
    </div>
  );
}
