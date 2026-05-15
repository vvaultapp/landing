/* Shared review data used by both the landing's SocialProofSection
   (the small trustpilot card under the hero) and the dedicated
   /reviews page. These are the real fallback reviews — if
   /api/landing-stats returns admin-curated rows from the
   landing_trustpilot_reviews Supabase table, those take precedence.
   The fallback set are real reviews left by real users, kept here so
   the page renders meaningful copy on first paint even before any
   API call has resolved. */

export type LandingReview = {
  name: string;
  body: string;
  rating: number;
};

export type LandingReviewApi = {
  name: string;
  bodyEn: string;
  bodyFr: string;
  rating: number;
};

export const FALLBACK_REVIEWS_EN: LandingReview[] = [
  {
    name: "Hugo",
    body: "Best beat selling / stocking / sending app. Game changer.",
    rating: 5,
  },
  {
    name: "la croix",
    body: "It's the best platform for producers. It allows you to have your productions listened to and to sell them as well.",
    rating: 5,
  },
  {
    name: "Adrien D.",
    body: "An app for beatmakers, designed by a beatmaker! I highly recommend it.",
    rating: 5,
  },
  {
    name: "Alexandre G.",
    body: "A really good app for your beats management and track mail sending. 10/10 recommended!",
    rating: 5,
  },
  {
    name: "Sacha S.",
    body: "Best app. I use it all the time, everyday.",
    rating: 5,
  },
  {
    name: "Miko",
    body: "Best app for beatmakers.",
    rating: 5,
  },
  {
    name: "Saili",
    body: "This app is very useful if you want to have all your beats and songs in one place. It helps me schedule and send beats to artists more easily.",
    rating: 5,
  },
  {
    name: "Prostel A.",
    body: "That's a good app. I think it's the best on the market.",
    rating: 5,
  },
];

export const FALLBACK_REVIEWS_FR: LandingReview[] = [
  {
    name: "Hugo",
    body: "La meilleure app pour vendre / stocker / envoyer ses beats. Un game changer.",
    rating: 5,
  },
  {
    name: "la croix",
    body: "C'est la meilleure plateforme pour les producteurs. Elle permet de faire écouter et vendre ses prods.",
    rating: 5,
  },
  {
    name: "Adrien D.",
    body: "Une app pour les beatmakers, conçue par un beatmaker ! Je recommande vivement.",
    rating: 5,
  },
  {
    name: "Alexandre G.",
    body: "Une super app pour gérer tes beats et envoyer tes track mails. 10/10 !",
    rating: 5,
  },
  {
    name: "Sacha S.",
    body: "La meilleure app. Je l'utilise tout le temps, tous les jours.",
    rating: 5,
  },
  {
    name: "Miko",
    body: "La meilleure app pour les beatmakers.",
    rating: 5,
  },
  {
    name: "Saili",
    body: "Cette app est super utile pour avoir tous tes beats et morceaux au même endroit. Ça m'aide à planifier et envoyer mes beats aux artistes plus facilement.",
    rating: 5,
  },
  {
    name: "Prostel A.",
    body: "C'est une bonne app. Je pense que c'est la meilleure du marché.",
    rating: 5,
  },
];
