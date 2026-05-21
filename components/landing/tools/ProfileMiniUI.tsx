"use client";

import Image from "next/image";
import type { Locale } from "@/components/landing/content";

const PACK_COVERS = ["/covers/pack-2.jpg", "/covers/pack-3.jpg", "/covers/pack-4.jpg"];

export function ProfileMiniUI({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";

  return (
    <div className="flex h-full items-center justify-center">
      {/* phone frame */}
      <div
        className="relative h-[200px] w-[120px] overflow-hidden rounded-[22px] sm:h-[220px] sm:w-[132px]"
        style={{
          background:
            "linear-gradient(160deg, rgba(20,20,24,1) 0%, rgba(8,8,10,1) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow:
            "0 18px 44px -10px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* status bar */}
        <div className="flex items-center justify-between px-3 pt-2 text-[7px] text-white/50">
          <span>9:41</span>
          <div className="flex gap-1">
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span className="h-1 w-1 rounded-full bg-white/40" />
          </div>
        </div>

        {/* avatar */}
        <div className="mt-3 flex flex-col items-center">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-[14px] font-semibold text-white/90"
            style={{
              background:
                "linear-gradient(140deg, hsl(265,55%,32%) 0%, hsl(220,50%,28%) 100%)",
              boxShadow: "0 6px 14px -2px rgba(0,0,0,0.5)",
            }}
          >
            K
          </div>
          <p className="mt-1.5 text-[10px] font-semibold text-white/90">Kodaa</p>
          <p className="text-[7.5px] text-white/40">
            {fr ? "Producteur · Paris" : "Producer · Paris"}
          </p>
        </div>

        {/* pack covers row */}
        <div className="mt-3 grid grid-cols-3 gap-1 px-2.5">
          {PACK_COVERS.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-md"
              style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.4)" }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* contact CTA */}
        <div className="mt-3 px-2.5">
          <div
            className="flex h-6 items-center justify-center rounded-md text-[8.5px] font-semibold text-black"
            style={{
              background: "linear-gradient(to bottom, #ffffff, #d4d4d4)",
              boxShadow: "0 2px 6px rgba(255,255,255,0.08)",
            }}
          >
            {fr ? "Me contacter" : "Contact me"}
          </div>
          <div className="mt-1.5 flex h-5 items-center justify-center rounded-md text-[8px] font-medium text-white/65"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            vvault.app/kodaa
          </div>
        </div>

        {/* bottom indicator */}
        <div className="absolute inset-x-0 bottom-1.5 flex justify-center">
          <div className="h-[3px] w-12 rounded-full bg-white/35" />
        </div>
      </div>
    </div>
  );
}
