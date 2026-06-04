"use client";

import Image from "next/image";
import type { Locale } from "@/components/landing/content";

const COVERS = [
  "/covers/pack-1.jpg",
  "/covers/pack-2.jpg",
  "/covers/pack-3.jpg",
  "/covers/pack-4.jpg",
];

export function LibraryMiniUI({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";
  const labels = [
    { name: "Dark Melodies Vol.3", tracks: 12 },
    { name: "808 Rage Kit", tracks: 8 },
    { name: "Ambient Souls", tracks: 15 },
    { name: "Flute Gang", tracks: 6 },
  ];

  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold text-white/30">
          {fr ? "Bibliothèque" : "Library"}
        </span>
        <span className="text-[9.5px] text-white/30">
          {fr ? "4 packs" : "4 packs"}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {COVERS.map((src, i) => (
          <div
            key={i}
            className="group relative aspect-square overflow-hidden rounded-lg transition-transform duration-300 hover:-translate-y-0.5"
            style={{
              boxShadow: "0 6px 16px -4px rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Image
              src={src}
              alt={labels[i].name}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <span className="absolute bottom-1 left-1.5 text-[8.5px] font-semibold text-white drop-shadow">
              {labels[i].tracks}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-1.5">
        <span className="rounded-lg bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-white/55">
          {fr ? "Privé" : "Private"}
        </span>
        <span className="rounded-lg bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-white/55">
          {fr ? "Tokenisé" : "Tokenized"}
        </span>
        <span className="ml-auto text-[9px] text-white/30">
          {fr ? "+12 packs" : "+12 more"}
        </span>
      </div>
    </div>
  );
}
