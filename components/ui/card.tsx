"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";
