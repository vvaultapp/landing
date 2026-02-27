"use client";

import { GlowEffect } from "@/components/ui/glow-effect";
import { cn } from "@/lib/utils";

interface GlowAvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
}

export function GlowAvatar({ src, alt = "Profile", size = 112, className }: GlowAvatarProps) {
  const dimension = `${size}px`;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: dimension, height: dimension }}
    >
      <GlowEffect
        className="rounded-full opacity-50"
        colors={['#FF5733', '#33FF57', '#3357FF', '#F1C40F']}
        mode="colorShift"
        blur="soft"
        duration={3}
        scale={0.8}
      />
      <div
        className="relative overflow-hidden rounded-full bg-zinc-950"
        style={{ width: dimension, height: dimension }}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-white">
            {alt?.[0]?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    </div>
  );
}
