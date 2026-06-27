"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { LandingNavItem } from "@/components/landing/content";
import { fetchJsonCached } from "@/lib/fetchJsonCached";

/* ogl bundle for the Studio card's Prism — dynamically imported so it only
   loads with this (already lazy) panel module, never on its own. */
const Prism = dynamic(() => import("@/components/landing/Prism"), {
  ssr: false,
});

/* Pulls the live Trustpilot rating from /api/landing-stats so the
   Testimonials dropdown card stays in sync with the SocialProofSection.
   fetchJsonCached dedupes this with the hero's + social proof's calls
   so the page makes ONE stats request, not three. */
function useTrustpilotScore() {
  const [score, setScore] = useState("4.7 / 5");
  useEffect(() => {
    let active = true;
    fetchJsonCached("/api/landing-stats")
      .then((data) => {
        const label = (data as { trustpilotScoreLabel?: string } | null)?.trustpilotScoreLabel;
        if (!active || !label) return;
        setScore(label.replace(/\s+/g, "").replace("/", " / "));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return score;
}

/* Menu-item icons — Streamline Solar (linear) from the vvault webapp set,
   inlined with currentColor. Each carries its own viewBox because the set mixes
   24-unit and 64-unit grids (24-unit paths keep their inline stroke-width). */
type DropdownIcon = { vb: string; body: React.ReactNode };
const I_ALL: DropdownIcon = { vb: "-2 -2 64 64", body: (<>
  <path d="M6.25 16.25c0 -4.71405 0 -7.071075 1.46447 -8.535525C9.178925 6.25 11.53595 6.25 16.25 6.25c4.71405 0 7.071075 0 8.535525 1.464475C26.25 9.178925 26.25 11.53595 26.25 16.25v27.5c0 4.714 0 7.071 -1.464475 8.5355C23.321075 53.75 20.96405 53.75 16.25 53.75c-4.71405 0 -7.071075 0 -8.535525 -1.4645C6.25 50.821 6.25 48.464 6.25 43.75v-27.5Z" />
  <path d="M33.75 38.75c0 -4.714 0 -7.071 1.4645 -8.5355C36.679 28.75 39.036 28.75 43.75 28.75c4.714 0 7.071 0 8.5355 1.4645 1.4645 1.4645 1.4645 3.8215 1.4645 8.5355v5c0 4.714 0 7.071 -1.4645 8.5355 -1.4645 1.4645 -3.8215 1.4645 -8.5355 1.4645 -4.714 0 -7.071 0 -8.5355 -1.4645C33.75 50.821 33.75 48.464 33.75 43.75v-5Z" />
  <path d="M33.75 13.75c0 -2.3297 0 -3.49455 0.3805 -4.413425 0.5075 -1.225125 1.481 -2.1985 2.706 -2.705975C37.7555 6.25 38.92025 6.25 41.25 6.25h5c2.32975 0 3.4945 0 4.4135 0.3806 1.225 0.507475 2.1985 1.48085 2.706 2.705975 0.3805 0.918875 0.3805 2.083725 0.3805 4.413425 0 2.3297 0 3.49455 -0.3805 4.413425 -0.5075 1.225125 -1.481 2.1985 -2.706 2.705975C49.7445 21.25 48.57975 21.25 46.25 21.25h-5c-2.32975 0 -3.4945 0 -4.4135 -0.3806 -1.225 -0.507475 -2.1985 -1.48085 -2.706 -2.705975C33.75 17.24455 33.75 16.0797 33.75 13.75Z" />
</>) };
const I_LIBRARY: DropdownIcon = { vb: "0 0 24 24", body: (<>
  <path strokeWidth={1.5} d="M19.562 7c0.2286 -1.30477 -0.7754 -2.5 -2.1001 -2.5H6.53812C5.21347 4.5 4.20946 5.69523 4.43809 7" />
  <path strokeWidth={1.5} d="M17.5001 4.5c0.0283 -0.25908 0.0425 -0.38865 0.0428 -0.49565 0.0022 -1.02363 -0.7689 -1.88371 -1.7866 -1.99293C15.6499 2 15.5195 2 15.2589 2H8.74111c-0.26064 0 -0.39097 0 -0.49736 0.01142 -1.01779 0.10922 -1.78882 0.9693 -1.78659 1.99292 0.00023 0.10701 0.01442 0.23656 0.04279 0.49566" />
  <path strokeWidth={1.5} strokeLinecap="round" d="M15 18H9" />
  <path strokeWidth={1.5} d="M2.38351 13.793c-0.44603 -3.1636 -0.66904 -4.74535 0.27881 -5.76917C3.61017 7 5.29758 7 8.67239 7h6.65521c3.3748 0 5.0622 0 6.0101 1.02383 0.9478 1.02382 0.7248 2.60557 0.2788 5.76917l-0.423 3c-0.3498 2.4809 -0.5246 3.7213 -1.4218 4.4642C18.8745 22 17.5512 22 14.9046 22H9.09536c-2.64655 0 -3.96983 0 -4.86702 -0.7428 -0.89719 -0.7429 -1.07208 -1.9833 -1.42186 -4.4642l-0.42297 -3Z" />
</>) };
const I_ANALYTICS: DropdownIcon = { vb: "-2 -2 64 64", body: (<>
  <path d="M5 30c0 -11.785125 0 -17.677675 3.661175 -21.338825C12.322325 5 18.214875 5 30 5c11.785 0 17.67775 0 21.33875 3.661175C55 12.322325 55 18.214875 55 30c0 11.785 0 17.67775 -3.66125 21.33875C47.67775 55 41.785 55 30 55c-11.785125 0 -17.677675 0 -21.338825 -3.66125C5 47.67775 5 41.785 5 30Z" />
  <path strokeLinecap="round" d="m17.5 35 4.492225 -5.39075c1.780125 -2.136 2.670175 -3.20425 3.841025 -3.20425 1.171 0 2.061 1.06825 3.84125 3.20425l0.651 0.7815c1.78025 2.136 2.67025 3.20425 3.84125 3.20425 1.17075 0 2.061 -1.06825 3.841 -3.20425L42.5 25" />
</>) };
const I_CAMPAIGNS: DropdownIcon = { vb: "-2 -2 64 64", body: (<>
  <path d="M5 30c0 -9.4281 0 -14.142125 2.928925 -17.071075C10.857875 10 15.5719 10 25 10h10c9.428 0 14.14225 0 17.071 2.928925C55 15.857875 55 20.5719 55 30c0 9.428 0 14.14225 -2.929 17.071C49.14225 50 44.428 50 35 50h-10c-9.4281 0 -14.142125 0 -17.071075 -2.929C5 44.14225 5 39.428 5 30Z" />
  <path strokeLinecap="round" d="m15 20 5.39725 4.4977C24.988825 28.324 27.28475 30.23725 30 30.23725s5.01125 -1.91325 9.60275 -5.73955L45 20" />
</>) };
const I_CONTACTS: DropdownIcon = { vb: "-2 -2 64 64", body: (<>
  <path d="M12.5 15a10 10 0 1 0 20 0 10 10 0 1 0 -20 0" />
  <path strokeLinecap="round" d="M37.5 22.5c4.14225 0 7.5 -3.357875 7.5 -7.5s-3.35775 -7.5 -7.5 -7.5" />
  <path d="M5 42.5a17.5 10 0 1 0 35 0 17.5 10 0 1 0 -35 0" />
  <path strokeLinecap="round" d="M45 35c4.3855 0.96175 7.5 3.39725 7.5 6.25 0 2.57325 -2.53425 4.80725 -6.25 5.926" />
</>) };
const I_OPPS: DropdownIcon = { vb: "0 0 24 24", body: (<>
  <path strokeWidth={1.5} d="M2 12c0 -4.71405 0 -7.07107 1.46447 -8.53553C4.92893 2 7.28595 2 12 2c4.714 0 7.0711 0 8.5355 1.46447C22 4.92893 22 7.28595 22 12c0 4.714 0 7.0711 -1.4645 8.5355C19.0711 22 16.714 22 12 22c-4.71405 0 -7.07107 0 -8.53553 -1.4645C2 19.0711 2 16.714 2 12Z" />
  <path strokeWidth={1.5} strokeLinecap="round" d="M2 13h3.16026c0.90517 0 1.35776 0 1.75558 0.183 0.39783 0.1829 0.69237 0.5266 1.28145 1.2138l0.60542 0.7064c0.58908 0.6872 0.88362 1.0309 1.28149 1.2138 0.3978 0.183 0.8504 0.183 1.7555 0.183h0.3206c0.9051 0 1.3577 0 1.7555 -0.183 0.3979 -0.1829 0.6924 -0.5266 1.2815 -1.2138l0.6054 -0.7064c0.5891 -0.6872 0.8836 -1.0309 1.2815 -1.2138 0.3978 -0.183 0.8504 -0.183 1.7555 -0.183H22" />
</>) };
const I_SALES: DropdownIcon = { vb: "0 0 24 24", body: (<>
  <path strokeWidth={1.5} d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0 -20 0" />
  <path strokeWidth={1.5} strokeLinecap="round" d="M12 6v12" />
  <path strokeWidth={1.5} strokeLinecap="round" d="M15 9.5C15 8.11929 13.6569 7 12 7S9 8.11929 9 9.5c0 1.3807 1.3431 2.5 3 2.5s3 1.1193 3 2.5 -1.3431 2.5 -3 2.5 -3 -1.1193 -3 -2.5" />
</>) };
const I_PROFILE: DropdownIcon = { vb: "-2 -2 64 64", body: (<>
  <path d="M20 15a10 10 0 1 0 20 0 10 10 0 1 0 -20 0" />
  <path d="M12.5 42.5a17.5 10 0 1 0 35 0 17.5 10 0 1 0 -35 0" />
</>) };
const I_LINKBIO: DropdownIcon = { vb: "-2 -2 64 64", body: (<>
  <path strokeLinecap="round" d="m35.40625 46.219 -1.802 1.802c-5.97175 5.97175 -15.653775 5.97175 -21.625475 0 -5.9717 -5.9715 -5.9717 -15.65375 0 -21.62525l1.802125 -1.80225" />
  <path strokeLinecap="round" d="m24.5935 35.40625 10.81275 -10.81275" />
  <path strokeLinecap="round" d="m24.5935 13.7809 1.80225 -1.802125c5.9715 -5.9717 15.65375 -5.9717 21.62525 0 5.97175 5.9717 5.97175 15.653725 0 21.625475l-1.802 1.802" />
</>) };
const I_CERT: DropdownIcon = { vb: "-2 -2 64 64", body: (
  <path d="M7.5 26.04175c0 -7.994075 0 -11.99105 0.9438 -13.335725 0.943775 -1.344675 4.702 -2.631125 12.218475 -5.20405l1.432025 -0.490175C26.0125 5.6706 27.9715 5 30 5c2.0285 0 3.9875 0.6706 7.90575 2.0118l1.432 0.490175c7.5165 2.572925 11.27475 3.859375 12.2185 5.20405C52.5 14.0507 52.5 18.047675 52.5 26.04175v3.93675c0 14.095 -10.5975 20.93525 -17.2465 23.83975C33.45 54.606 32.54825 55 30 55c-2.54825 0 -3.45 -0.394 -5.2536 -1.18175C18.0974 50.91375 7.5 44.0735 7.5 29.9785v-3.93675Z" />
) };

const I_STORIES: DropdownIcon = { vb: "-2 -2 64 64", body: (
  <path d="M30 55c13.807 0 25 -11.193 25 -25 0 -13.807125 -11.193 -25 -25 -25C16.192875 5 5 16.192875 5 30c0 3.99925 0.93905 7.779 2.60865 11.13125 0.4437 0.89075 0.591375 1.909 0.33415 2.87025l-1.489025 5.56525c-0.6464 2.41575 1.56375 4.62575 3.9796 3.9795l5.5651 -1.489c0.96135 -0.25725 1.97955 -0.1095 2.87035 0.334C22.220925 54.061 26.00075 55 30 55Z" />
) };
const I_VIDEO: DropdownIcon = { vb: "0 0 24 24", body: (<>
  <path strokeWidth={1.5} d="M2 12c0 -4.71405 0 -7.07107 1.46447 -8.53553C4.92893 2 7.28595 2 12 2c4.714 0 7.0711 0 8.5355 1.46447C22 4.92893 22 7.28595 22 12c0 4.714 0 7.0711 -1.4645 8.5355C19.0711 22 16.714 22 12 22c-4.71405 0 -7.07107 0 -8.53553 -1.4645C2 19.0711 2 16.714 2 12Z" />
  <path strokeWidth={1.5} strokeLinecap="round" d="M21.5 8h-19" />
  <path strokeWidth={1.5} strokeLinecap="round" d="M10.5 2.5 7 8" />
  <path strokeWidth={1.5} strokeLinecap="round" d="M17 2.5 13.5 8" />
  <path strokeWidth={1.5} strokeLinecap="round" d="M15 14.5c0 -0.6334 -0.662 -1.0605 -1.986 -1.9148 -1.3421 -0.8659 -2.0132 -1.2989 -2.5136 -0.981C10 11.9221 10 12.7814 10 14.5s0 2.5779 0.5004 2.8958c0.5004 0.3179 1.1715 -0.1151 2.5136 -0.981C14.338 15.5605 15 15.1334 15 14.5Z" />
</>) };
const I_INTRO: DropdownIcon = { vb: "-2 -2 64 64", body: (<>
  <path d="m50.779 31.61825 1.29425 -4.82975c1.5105 -5.63765 2.26575 -8.4565 1.697 -10.895925 -0.449 -1.92615 -1.45925 -3.675875 -2.90275 -5.0279 -1.82825 -1.7123 -4.64725 -2.4676 -10.28475 -3.978225 -5.63775 -1.510625 -8.45675 -2.265925 -10.896 -1.697125 -1.92625 0.4491 -3.676 1.4593 -5.027975 2.90285 -1.46605 1.565275 -2.230575 3.85675 -3.36825 8.02185 -0.19105 0.699475 -0.39265 1.4518 -0.60985 2.2624l-0.000125 0.0005 -1.2941 4.82965c-1.510625 5.637675 -2.265925 8.456425 -1.697125 10.895925 0.4491 1.92625 1.4593 3.676 2.90285 5.028 1.8282 1.71225 4.647075 2.4675 10.284825 3.97825 5.0815 1.3615 7.87275 2.1095 10.1605 1.82725 0.2505 -0.03075 0.49475 -0.074 0.7355 -0.13025 1.926 -0.449 3.67575 -1.45925 5.02775 -2.90275 1.71225 -1.82825 2.46775 -4.647 3.97825 -10.28475Z" />
  <path d="M41.0375 44.93525c-0.52125 1.59625 -1.43775 3.04025 -2.67 4.1945 -1.82825 1.71225 -4.64725 2.4675 -10.28475 3.97825 -5.6378 1.5105 -8.45665 2.26575 -10.8961 1.697 -1.926125 -0.449 -3.67585 -1.45925 -5.027875 -2.90275 -1.7123 -1.82825 -2.4676 -4.647 -3.978225 -10.28475l-1.2941 -4.82975c-1.510625 -5.63775 -2.265925 -8.4565 -1.697125 -10.896 0.4491 -1.926075 1.4593 -3.6758 2.90285 -5.027825 1.8282 -1.7123 4.64705 -2.4676 10.28475 -3.978225 1.0666 -0.2858 2.032275 -0.54455 2.9136 -0.772425" />
</>) };
const I_QUICK: DropdownIcon = { vb: "0 0 24 24", body: (
  <path strokeWidth={1.5} d="M12 21c4.4183 0 8 -3.3561 8 -7.496 0 -3.74143 -2.0346 -6.66589 -3.438 -8.05964 -0.2603 -0.25852 -0.6937 -0.1443 -0.8408 0.18852 -0.747 1.69002 -2.3034 4.12319 -4.2926 4.12319 -1.2311 0.16479 -3.11172 -0.88763 -1.59377 -6.10739 0.13668 -0.47 -0.36511 -0.84755 -0.74838 -0.53329C6.9046 4.90436 4 8.51143 4 13.504 4 17.6439 7.58172 21 12 21Z" />
) };
const I_PLANS: DropdownIcon = { vb: "-2 -2 64 64", body: (<>
  <path d="M44.0625 52.5005c1.604 -1.42575 4.021 -1.42575 5.625 0 1.08975 0.9685 2.8125 0.195 2.8125 -1.263V8.762975c0 -1.458075 -1.72275 -2.2317 -2.8125 -1.263 -1.604 1.42575 -4.021 1.42575 -5.625 0s-4.021 -1.42575 -5.625 0 -4.021 1.42575 -5.625 0 -4.021 -1.42575 -5.625 0 -4.021025 1.42575 -5.625 0c-1.603975 -1.42575 -4.021025 -1.42575 -5.625 0 -1.603975 1.42575 -4.021025 1.42575 -5.625 0C9.222725 6.531275 7.5 7.3049 7.5 8.762975V51.2375c0 1.458 1.722725 2.2315 2.8125 1.263 1.603975 -1.42575 4.021025 -1.42575 5.625 0 1.603975 1.42575 4.021025 1.42575 5.625 0 1.603975 -1.42575 4.021 -1.42575 5.625 0s4.021 1.42575 5.625 0 4.021 -1.42575 5.625 0 4.021 1.42575 5.625 0Z" />
  <path strokeLinecap="round" d="M18.75 38.75h22.5" />
  <path strokeLinecap="round" d="M18.75 30h22.5" />
  <path strokeLinecap="round" d="M18.75 21.25h22.5" />
</>) };
const I_ABOUT: DropdownIcon = { vb: "-2 -2 64 64", body: (<>
  <path d="M55 30c0 3.283 -0.64675 6.534 -1.903 9.567 -1.2565 3.033250 -3.09775 5.78925 -5.41925 8.11075 -2.3215 2.3215 -5.0775 4.16275 -8.11075 5.41925C36.534 54.35325 33.283 55 30 55c-3.283 0 -6.53395 -0.64675 -9.567075 -1.903 -3.03315 -1.2565 -5.789125 -3.09775 -8.1106 -5.41925 -2.32145 -2.3215 -4.16295 -5.0775 -5.419325 -8.11075C5.64665 36.534 5 33.283 5 30c0 -3.283 0.64665 -6.53395 1.903025 -9.5671 1.25635 -3.033125 3.09785 -5.7891 5.4193 -8.110575 2.321475 -2.32145 5.07745 -4.16295 8.1106 -5.419325C23.46605 5.64665 26.717 5 30 5c3.283 0 6.534 0.64665 9.567 1.903025 3.03325 1.25635 5.78925 3.09785 8.11075 5.4193 2.3215 2.321475 4.16275 5.07745 5.41925 8.1106C54.35325 23.46605 55 26.717 55 30Z" />
  <path d="M40 30c0 3.283 -0.25875 6.534 -0.76125 9.567 -0.5025 3.033250 -1.239 5.78925 -2.16775 8.11075 -0.9285 2.3215 -2.031 4.16275 -3.24425 5.41925C32.6135 54.35325 31.31325 55 30 55c-1.31325 0 -2.6135 -0.64675 -3.82675 -1.903 -1.21335 -1.2565 -2.315725 -3.09775 -3.244325 -5.41925 -0.928575 -2.3215 -1.665175 -5.0775 -2.167725 -8.11075C20.25865 36.534 20 33.283 20 30c0 -3.283 0.25865 -6.53395 0.7612 -9.5671 0.50255 -3.033125 1.23915 -5.7891 2.167725 -8.110575 0.9286 -2.32145 2.030975 -4.16295 3.244325 -5.419325C27.3865 5.64665 28.68675 5 30 5c1.31325 0 2.6135 0.64665 3.82675 1.903025 1.21325 1.25635 2.31575 3.09785 3.24425 5.4193 0.92875 2.321475 1.66525 5.07745 2.16775 8.1106C39.74125 23.46605 40 26.717 40 30Z" />
  <path strokeLinecap="round" d="M5 30h50" />
</>) };
const I_HELP: DropdownIcon = { vb: "0 0 24 24", body: (<>
  <path strokeWidth={1.5} d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0 -20 0" />
  <path strokeWidth={1.5} d="M8 12a4 4 0 1 0 8 0 4 4 0 1 0 -8 0" />
  <path strokeWidth={1.5} d="m15 9 4 -4" />
  <path strokeWidth={1.5} d="m5 19 4 -4" />
  <path strokeWidth={1.5} d="M9 9 5 5" />
  <path strokeWidth={1.5} d="m19 19 -4 -4" />
</>) };

const DROPDOWN_ICONS: Record<string, DropdownIcon> = {
  /* Testimonials */
  "Customer Stories": I_STORIES,
  "Video Reviews": I_VIDEO,
  "Histoires clients": I_STORIES,
  "Vidéos": I_VIDEO,
  /* Docs */
  "Introduction": I_INTRO,
  "Quickstart": I_QUICK,
  "Démarrage rapide": I_QUICK,
  "Plans & Pricing": I_PLANS,
  "Plans & Tarifs": I_PLANS,
  "About": I_ABOUT,
  "À propos": I_ABOUT,
  "Help": I_HELP,
  "Aide": I_HELP,
  /* English */
  "All Features": I_ALL,
  "Library": I_LIBRARY,
  "Analytics": I_ANALYTICS,
  "Campaigns": I_CAMPAIGNS,
  "Contacts": I_CONTACTS,
  "Opportunities": I_OPPS,
  "Sales": I_SALES,
  "Profile": I_PROFILE,
  "Link in Bio": I_LINKBIO,
  "Certificate": I_CERT,
  /* French */
  "Toutes les features": I_ALL,
  "Toutes les fonctionnalités": I_ALL,
  "Bibliothèque": I_LIBRARY,
  "Campagnes": I_CAMPAIGNS,
  "Opportunités": I_OPPS,
  "Ventes": I_SALES,
  "Profil": I_PROFILE,
  "Certificat": I_CERT,
  "Analytiques": I_ANALYTICS,
  "Lien en Bio": I_LINKBIO,
};

/* Studio featured card — mounts the Prism ONCE on first open and keeps it
   alive so subsequent opens never pay a WebGL init cost. */
function StudioFeaturedCard({
  href,
  description,
  open,
}: {
  href: string;
  description?: string;
  open: boolean;
}) {
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    if (open) setEverOpened(true);
  }, [open]);

  return (
    <Link
      href={href}
      className="group relative flex flex-1 flex-col overflow-hidden rounded-[14px]"
      style={{
        background: "rgb(var(--surface))",
      }}
    >
      {everOpened && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        >
          <Prism
            animationType="rotate"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0}
            glow={1}
            suspendWhenOffscreen
          />
        </div>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 130% 110% at 50% 50%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.12) 45%, transparent 75%)",
        }}
      />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8">
        <span
          className="font-sans text-[rgb(var(--fg))]"
          style={{
            fontWeight: 900,
            fontSize: "22px",
            letterSpacing: "0.24em",
            lineHeight: 1,
            paddingLeft: "0.24em",
            color: "#ffffff",
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "#ffffff",
          }}
        >
          STUDIO
        </span>
        <span className="mt-1 block text-center text-[11px] leading-snug text-[rgb(var(--fg)_/_0.6)]">
          {description || "Automated video posting"}
        </span>
      </div>
    </Link>
  );
}

/* The heavy dropdown panel content (regular links + featured cards). Lives in
   its own module so LandingNav can dynamic-import it (ssr:false) and keep all
   of this out of the homepage's first-load JS — it loads after hydration. */
export default function NavDropdownPanel({
  item,
  navChildren,
  open,
}: {
  item: LandingNavItem;
  navChildren: LandingNavItem["children"];
  open: boolean;
}) {
  const trustpilotScore = useTrustpilotScore();
  const children = navChildren;

  const isFeatures = item.label === "Features" || item.label === "Fonctionnalités";
  const studioChild = isFeatures ? children!.find((c) => c.label === "Studio") : null;
  const featuredChildren = children!.filter((c) => c.featured);
  const regularChildren = children!.filter((c) => !c.featured && c !== studioChild);
  const hasFeaturedPanel = studioChild || featuredChildren.length > 0;

  const renderChild = (child: typeof children extends (infer U)[] | undefined ? U : never, i = 0) => {
    const isExternal = child.external || child.href.startsWith("http://") || child.href.startsWith("https://") || child.href.startsWith("mailto:");
    const Tag = isExternal ? "a" : Link;
    const extraProps = isExternal
      ? {
          target: child.href.startsWith("mailto:") ? undefined : "_blank" as const,
          rel: child.href.startsWith("mailto:") ? undefined : "noreferrer",
        }
      : {};
    const icon = DROPDOWN_ICONS[child.label];
    return (
      <Tag
        key={child.label}
        href={child.href}
        {...extraProps}
        className="flex h-9 items-center gap-2 rounded-xl px-3 hover:bg-[rgb(var(--ov)_/_0.06)]"
        style={{
          contain: "layout",
          opacity: open ? 1 : 0,
          transform: open ? "translateX(0)" : "translateX(9px)",
          transition: `opacity 0.34s cubic-bezier(0.22,1,0.36,1) ${i * 0.03}s, transform 0.34s cubic-bezier(0.22,1,0.36,1) ${i * 0.03}s`,
        }}
      >
        {icon ? (
          <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center" style={{ transform: "translateZ(0)" }}>
            <svg viewBox={icon.vb} className="block h-[18px] w-[18px] fill-none" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" style={{ color: "color-mix(in srgb, rgb(var(--fg)) 60%, rgb(var(--card)))", stroke: "currentColor" }}>
              {icon.body}
            </svg>
          </div>
        ) : null}
        <span className="text-[13px] font-medium leading-none text-[rgb(var(--fg)_/_0.75)] whitespace-nowrap">
          {child.label}
          {child.external && (
            <svg
              viewBox="0 0 12 12"
              className="mb-px ml-1 inline h-2.5 w-2.5 fill-none stroke-current stroke-[1.5] text-[rgb(var(--fg)_/_0.25)]"
            >
              <path d="M4 1h7v7M11 1L5 7" />
            </svg>
          )}
        </span>
      </Tag>
    );
  };

  /* ── Featured card wrapper — gradient border via background trick ── */
  const FeaturedCardWrap = ({ children: cardChildren, href, external, className = "" }: { children: React.ReactNode; href: string; external?: boolean; className?: string }) => {
    const isExt = external || href.startsWith("http://") || href.startsWith("https://");
    const Tag = isExt ? "a" : Link;
    const extraProps = isExt ? { target: "_blank" as const, rel: "noreferrer" } : {};
    return (
      <Tag href={href} {...extraProps} className={`group relative flex flex-1 flex-col rounded-[14px] p-px ${className}`}
        style={{
          background: "linear-gradient(180deg, rgb(var(--ov) / 0.13) 0%, rgb(var(--ov) / 0.05) 50%, rgb(var(--ov) / 0.01) 100%)",
        }}
      >
        {/* Inner fill */}
        <div className="relative flex h-full flex-1 flex-col overflow-hidden rounded-[13px]"
          style={{ background: "rgb(var(--surface))" }}
        >
          {/* Hover glow — soft radial from top */}
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: "radial-gradient(ellipse 90% 50% at 50% 0%, rgb(var(--ov) / 0.05) 0%, transparent 70%)" }}
          />
          {/* Content */}
          <div className="relative z-10 flex h-full flex-1 flex-col">{cardChildren}</div>
        </div>
      </Tag>
    );
  };

  /* ── Trustpilot star card (testimonials) ── */
  const isTrustpilotCard = (child: { label: string }) => child.label === "Trustpilot";

  const renderTrustpilotCard = (child: typeof children extends (infer U)[] | undefined ? U : never) => (
    <FeaturedCardWrap key={child.label} href={child.href} external={child.external}>
      <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-3 py-4">
        {/* Trustpilot logo */}
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path d="M12 2l2.09 6.26h6.6l-5.34 3.87 2.04 6.28L12 14.56l-5.39 3.85 2.04-6.28L3.31 8.26h6.6L12 2z" fill="#00b67a" />
        </svg>
        {/* Stars */}
        <div className="flex gap-0.5">
          {[1,2,3,4].map((i) => (
            <div key={i} className="flex h-[14px] w-[14px] items-center justify-center rounded-[2px] bg-[#00b67a]">
              <svg viewBox="0 0 12 12" className="h-[9px] w-[9px] fill-white"><path d="M6 1l1.25 3.75h3.94l-3.19 2.32 1.22 3.75L6 8.5 2.78 10.82 4 7.07.81 4.75h3.94L6 1z" /></svg>
            </div>
          ))}
          <div className="relative flex h-[14px] w-[14px] items-center justify-center overflow-hidden rounded-[2px] bg-[#dcdce6]">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-[#00b67a]" />
            <svg viewBox="0 0 12 12" className="relative z-10 h-[9px] w-[9px] fill-white"><path d="M6 1l1.25 3.75h3.94l-3.19 2.32 1.22 3.75L6 8.5 2.78 10.82 4 7.07.81 4.75h3.94L6 1z" /></svg>
          </div>
        </div>
        <div className="text-center">
          <span className="block text-[13px] font-semibold text-[rgb(var(--fg)_/_0.85)]">{trustpilotScore}</span>
          <span className="mt-0.5 block text-[10px] text-[rgb(var(--fg)_/_0.35)]">{child.description}</span>
        </div>
      </div>
    </FeaturedCardWrap>
  );

  /* ── Video card (YouTube thumbnail) ── */
  const renderVideoCard = (child: typeof children extends (infer U)[] | undefined ? U : never) => {
    const videoId = child.href.match(/(?:embed\/|v=|youtu\.be\/)([^?&/]+)/)?.[1] || "";
    return (
      <FeaturedCardWrap key={child.label} href={child.href} external>
        <div className="relative mx-1.5 mt-1.5 overflow-hidden rounded-lg" style={{ aspectRatio: "16/9" }}>
          <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(var(--bg)_/_0.5)] backdrop-blur-sm">
              <svg viewBox="0 0 16 16" className="ml-0.5 h-3 w-3 fill-white"><path d="M5 3.5l8 4.5-8 4.5V3.5z" /></svg>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 text-center">
          <span className="text-[12px] font-medium text-[rgb(var(--fg)_/_0.8)]">{child.label}</span>
          {child.description && <span className="mt-0.5 block text-[10px] text-[rgb(var(--fg)_/_0.35)]">{child.description}</span>}
        </div>
      </FeaturedCardWrap>
    );
  };

  /* ── Discord card ── */
  const isDiscordCard = (child: { href: string }) => child.href.includes("discord.gg");
  const renderDiscordCard = (child: typeof children extends (infer U)[] | undefined ? U : never) => (
    <FeaturedCardWrap key={child.label} href={child.href} external>
      <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-3 py-4">
        {/* Discord icon */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #5865F2 0%, #4752c4 100%)" }}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.227-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </div>
        <div className="text-center">
          <span className="block text-[13px] font-semibold text-[rgb(var(--fg)_/_0.85)]">{child.label}</span>
          <span className="mt-0.5 block text-[10px] text-[rgb(var(--fg)_/_0.35)]">{child.description}</span>
        </div>
      </div>
    </FeaturedCardWrap>
  );

  /* ── "For X" audience cards with icons ── */
  const _producerIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 1a11 11 0 0 0-11 11v7a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3H3.06A9 9 0 0 1 21 12h-.06a3 3 0 0 0-2.94 3v3a3 3 0 0 0 3 3h-2a1 1 0 0 1 0-2h1a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2v1a3 3 0 0 1-3 3h-2" opacity="0" />
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2.75A9.25 9.25 0 0 0 2.75 12v2.25H5a2.25 2.25 0 0 1 2.25 2.25v3A2.25 2.25 0 0 1 5 21.75H4A2.25 2.25 0 0 1 1.75 19.5V12a10.25 10.25 0 0 1 20.5 0v7.5A2.25 2.25 0 0 1 20 21.75h-1a2.25 2.25 0 0 1-2.25-2.25v-3A2.25 2.25 0 0 1 19 14.25h2.25V12A9.25 9.25 0 0 0 12 2.75zM3.25 15.75V19.5a.75.75 0 0 0 .75.75h1a.75.75 0 0 0 .75-.75v-3a.75.75 0 0 0-.75-.75H3.25zm17.5 0H19a.75.75 0 0 0-.75.75v3c0 .414.336.75.75.75h1a.75.75 0 0 0 .75-.75V15.75z" />
    </svg>
  );
  const _labelsIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M3.75 5A1.25 1.25 0 0 1 5 3.75h14A1.25 1.25 0 0 1 20.25 5v14A1.25 1.25 0 0 1 19 20.25H5A1.25 1.25 0 0 1 3.75 19V5ZM5 2.25A2.75 2.75 0 0 0 2.25 5v14A2.75 2.75 0 0 0 5 21.75h14A2.75 2.75 0 0 0 21.75 19V5A2.75 2.75 0 0 0 19 2.25H5ZM7.25 7a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5H8A.75.75 0 0 1 7.25 7Zm0 4a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75Zm0 4a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75Z" />
    </svg>
  );
  const audienceIcons: Record<string, React.ReactNode> = {
    "For Producers": _producerIcon,
    "Pour Producteurs": _producerIcon,
    "Pour les producteurs": _producerIcon,
    "For Labels": _labelsIcon,
    "Pour Labels": _labelsIcon,
    "Pour les labels": _labelsIcon,
  };
  const isAudienceCard = (child: { label: string }) => child.label in audienceIcons;
  const renderAudienceCard = (child: typeof children extends (infer U)[] | undefined ? U : never) => (
    <FeaturedCardWrap key={child.label} href={child.href} external={child.external}>
      <div className="flex flex-1 items-center gap-3 px-3.5 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[rgb(var(--fg)_/_0.5)]" style={{ background: "rgb(var(--ov) / 0.06)" }}>
          {audienceIcons[child.label]}
        </div>
        <div>
          <span className="block text-[13px] font-semibold text-[rgb(var(--fg)_/_0.85)]">{child.label}</span>
          {child.description && <span className="mt-0.5 block text-[10px] text-[rgb(var(--fg)_/_0.35)]">{child.description}</span>}
        </div>
      </div>
    </FeaturedCardWrap>
  );

  /* ── Generic featured card (fallback) ── */
  const renderGenericFeaturedCard = (child: typeof children extends (infer U)[] | undefined ? U : never) => {
    return (
      <FeaturedCardWrap key={child.label} href={child.href} external={child.external} className="items-center justify-center">
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-3 py-4">
          <span className="text-[13px] font-medium text-[rgb(var(--fg)_/_0.8)]">{child.label}</span>
          {child.description && <span className="text-[11px] text-[rgb(var(--fg)_/_0.35)]">{child.description}</span>}
        </div>
      </FeaturedCardWrap>
    );
  };

  const renderFeaturedCard = (child: typeof children extends (infer U)[] | undefined ? U : never) => {
    if (isTrustpilotCard(child)) return renderTrustpilotCard(child);
    if (isDiscordCard(child)) return renderDiscordCard(child);
    if (isAudienceCard(child)) return renderAudienceCard(child);
    if (child.href.startsWith("https://www.youtube.com/")) return renderVideoCard(child);
    return renderGenericFeaturedCard(child);
  };

  if (hasFeaturedPanel) {
    const hasVideoCard = featuredChildren.some((c) => c.href.includes("youtube.com"));
    const featuredPanelWidth = studioChild ? "w-[180px]" : hasVideoCard ? "w-[200px]" : featuredChildren.length > 1 ? "w-[220px]" : "w-[180px]";
    return (
      <div className="flex" style={{ minWidth: hasFeaturedPanel ? (regularChildren.length > 5 ? "520px" : "380px") : undefined }}>
        {/* Regular links — left side */}
        <div
          className="flex-1 p-2"
          style={{
            display: "grid",
            gridTemplateColumns: regularChildren.length > 5 ? "1fr 1fr" : "1fr",
            gap: "0px",
            alignContent: "start",
          }}
        >
          {regularChildren.map((child, i) => renderChild(child, i))}
        </div>
        {/* Featured cards — right side */}
        <div className={`flex ${featuredPanelWidth} shrink-0 flex-col gap-2 p-2`}>
          {studioChild && (
            <StudioFeaturedCard
              href={studioChild.href}
              description={studioChild.description}
              open={open}
            />
          )}
          {featuredChildren.map((child) => renderFeaturedCard(child))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-2"
      style={{
        display: "grid",
        gridTemplateColumns: children!.length > 6 ? "1fr 1fr" : "1fr",
        minWidth: children!.length > 6 ? "420px" : "220px",
        gap: "0px",
      }}
    >
      {children!.map((child, i) => renderChild(child, i))}
    </div>
  );
}
