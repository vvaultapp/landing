"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "soft" | "outline" | "accent";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const base =
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]";

const variants: Record<BadgeVariant, string> = {
  default: "border border-white/15 bg-white/10 text-white/80",
  soft: "border border-white/10 bg-white/5 text-white/70",
  outline: "border border-white/20 text-white/70",
  accent: "bg-emerald-200 text-black",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn(base, variants[variant], className)} {...props} />;
}
