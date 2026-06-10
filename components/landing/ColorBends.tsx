"use client";

/* Decorative WebGL background — REMOVED site-wide (the design dropped all
   glow/plasma effects). This stub keeps the import sites compiling while
   shipping ZERO bytes of three.js: the old implementation imported the whole
   `three` package into a lazy chunk that pages (pricing, downloads) still
   downloaded on every visit just to render null. */

type ColorBendsProps = {
  className?: string;
  style?: React.CSSProperties;
  rotation?: number;
  speed?: number;
  colors?: string[];
  transparent?: boolean;
  autoRotate?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  parallax?: number;
  noise?: number;
  iterations?: number;
  intensity?: number;
  bandWidth?: number;
  initialTimeOffset?: number;
};

export default function ColorBends(_props: ColorBendsProps) {
  void _props;
  return null;
}
