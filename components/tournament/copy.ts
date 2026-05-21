import type { Locale } from "@/lib/useLocale";

export type TournamentCopy = {
  eyebrow: string;
  comingSoonTitle: string;
  comingSoonBody: string;
  comingSoonCta: string;
  comingSoonCtaHref: string;
  comingSoonStats: { value: string; label: string }[];
  phaseBadge: { submission: string; qualification: string };
  countdownLabel: string;
  closesIn: string;
  closedLabel: string;
  notStartedLabel: string;
  submission: {
    title: string;
    subtitle: string;
    rules: string[];
    connectCta: string;
    pasteLabel: string;
    placeholder: string;
    confirmCta: string;
    submittingCta: string;
    submitted: string;
    fullState: string;
    countLabel: (count: number, cap: number) => string;
  };
  auth: {
    connectTitle: string;
    google: string;
    orDivider: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    signinCta: string;
    signupCta: string;
    magicLinkCta: string;
    magicLinkSent: (email: string) => string;
    toggleToSignup: string;
    toggleToSignin: string;
    sending: string;
  };
  qualification: {
    title: string;
    subtitle: string;
    voteCta: string;
    votedCta: string;
    sortNew: string;
    sortPopular: string;
    sortRandom: string;
  };
  round: {
    title: (label: string) => string;
    subtitle: string;
    voteCta: string;
    votedCta: string;
    waitingLabel: string;
    advancesLabel: string;
    nextLabel: string;
    bracketCta: string;
  };
  champion: {
    eyebrow: string;
    title: string;
    cta: string;
    ctaHref: string;
  };
};

export function getTournamentCopy(locale: Locale): TournamentCopy {
  if (locale === "fr") {
    return {
      eyebrow: "VVault Tournament",
      comingSoonTitle: "Le tournoi arrive.",
      comingSoonBody:
        "Mille producteurs, un seul gagnant. Crée ton compte VVault dès maintenant pour être prêt quand les inscriptions ouvrent.",
      comingSoonCta: "Créer mon compte VVault",
      comingSoonCtaHref: "https://vvault.app/signup",
      comingSoonStats: [
        { value: "1 000", label: "Producteurs max" },
        { value: "16", label: "Passent au bracket" },
        { value: "4", label: "Tours à élimination" },
      ],
      phaseBadge: { submission: "Soumissions", qualification: "Qualifications" },
      countdownLabel: "Temps restant",
      closesIn: "Termine dans",
      closedLabel: "Phase terminée",
      notStartedLabel: "Bientôt",
      submission: {
        title: "Soumets ton morceau.",
        subtitle: "Connecte ton compte VVault, colle le lien d'un morceau que tu possèdes, et tu seras dans le tournoi.",
        rules: [
          "Un morceau par producteur.",
          "Lien VVault uniquement (vvault.app/<pseudo>/track/...)",
          "Tu peux retirer ta soumission tant que la phase est ouverte.",
        ],
        connectCta: "Connecter VVault",
        pasteLabel: "Lien du morceau",
        placeholder: "https://vvault.app/tonpseudo/track/...",
        confirmCta: "Soumettre",
        submittingCta: "Envoi…",
        submitted: "Ton morceau est en lice ✓",
        fullState: "Le tournoi est complet.",
        countLabel: (count, cap) => `${count} / ${cap} producteurs inscrits`,
      },
      auth: {
        connectTitle: "Connecte ton compte VVault",
        google: "Continuer avec Google",
        orDivider: "ou",
        emailLabel: "Email",
        emailPlaceholder: "toi@email.com",
        passwordLabel: "Mot de passe",
        passwordPlaceholder: "••••••••",
        signinCta: "Se connecter",
        signupCta: "Créer un compte",
        magicLinkCta: "Envoyer un lien magique",
        magicLinkSent: (email) => `Lien envoyé à ${email}. Vérifie tes mails.`,
        toggleToSignup: "Pas encore de compte ? S'inscrire",
        toggleToSignin: "Déjà inscrit ? Se connecter",
        sending: "Envoi…",
      },
      qualification: {
        title: "Phase de qualifications.",
        subtitle: "Vote pour tous les morceaux que tu aimes. Les 16 plus populaires entrent dans le bracket.",
        voteCta: "Voter",
        votedCta: "Voté ✓",
        sortNew: "Nouveaux",
        sortPopular: "Populaires",
        sortRandom: "Aléatoire",
      },
      round: {
        title: (label) => label,
        subtitle: "Écoute. Vote. Les gagnants passent au tour suivant.",
        voteCta: "Voter",
        votedCta: "Voté ✓",
        waitingLabel: "En attente",
        advancesLabel: "passe au tour suivant",
        nextLabel: "Match suivant",
        bracketCta: "Voir le tableau complet",
      },
      champion: {
        eyebrow: "Champion",
        title: "Le gagnant",
        cta: "Inscris-toi au prochain tournoi",
        ctaHref: "https://vvault.app/signup",
      },
    };
  }
  return {
    eyebrow: "VVAULT TOURNAMENT",
    comingSoonTitle: "The tournament is coming.",
    comingSoonBody:
      "1,000 producers. One winner. Sign up to VVault now so you're ready when submissions open.",
    comingSoonCta: "Create my VVault account",
    comingSoonCtaHref: "https://vvault.app/signup",
    comingSoonStats: [
      { value: "1,000", label: "Producers max" },
      { value: "16", label: "Advance to bracket" },
      { value: "4", label: "Knockout rounds" },
    ],
    phaseBadge: { submission: "Submissions", qualification: "Qualification" },
    countdownLabel: "Time remaining",
    closesIn: "Closes in",
    closedLabel: "Phase closed",
    notStartedLabel: "Soon",
    submission: {
      title: "Drop your best track.",
      subtitle: "Connect your VVault account, paste a link to a track you own, and you're in.",
      rules: [
        "One track per producer.",
        "Must be a VVault link (vvault.app/<username>/track/...)",
        "You can swap it while submissions are open.",
      ],
      connectCta: "Connect VVault",
      pasteLabel: "Track link",
      placeholder: "https://vvault.app/yourname/track/...",
      confirmCta: "Submit",
      submittingCta: "Submitting…",
      submitted: "You're in the tournament ✓",
      fullState: "The tournament is full.",
      countLabel: (count, cap) => `${count} / ${cap} producers in`,
    },
    auth: {
      connectTitle: "Connect your VVault account",
      google: "Continue with Google",
      orDivider: "or",
      emailLabel: "Email",
      emailPlaceholder: "you@email.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      signinCta: "Sign in",
      signupCta: "Create account",
      magicLinkCta: "Send magic link",
      magicLinkSent: (email) => `Link sent to ${email}. Check your inbox.`,
      toggleToSignup: "No account? Sign up",
      toggleToSignin: "Already registered? Sign in",
      sending: "Sending…",
    },
    qualification: {
      title: "Qualification round.",
      subtitle: "Like as many tracks as you want. The 16 most loved advance.",
      voteCta: "Vote",
      votedCta: "Voted ✓",
      sortNew: "Newest",
      sortPopular: "Most voted",
      sortRandom: "Random",
    },
    round: {
      title: (label) => label,
      subtitle: "Listen. Vote. Winners advance.",
      voteCta: "Vote",
      votedCta: "Voted ✓",
      waitingLabel: "Waiting…",
      advancesLabel: "advances",
      nextLabel: "Next match",
      bracketCta: "See the full bracket",
    },
    champion: {
      eyebrow: "Champion",
      title: "The winner",
      cta: "Sign up for the next one",
      ctaHref: "https://vvault.app/signup",
    },
  };
}
