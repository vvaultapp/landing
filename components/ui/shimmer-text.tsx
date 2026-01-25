"use client";

import * as React from "react";
import { motion as motionPrimitive } from "motion/react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type ShimmerTextProps = React.ComponentPropsWithoutRef<typeof motionPrimitive.span> & {
  duration?: number;
};

export function ShimmerText({
  className,
  children,
  duration = 18,
  style,
  ...props
}: ShimmerTextProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motionPrimitive.span
      className={cn("text-transparent", className)}
      style={{
        ...style,
        backgroundImage:
          "linear-gradient(90deg, rgba(255,255,255,0.88), rgba(255,255,255,0.42), rgba(255,255,255,0.88))",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
      }}
      animate={
        prefersReducedMotion ? undefined : { backgroundPosition: ["0% 50%", "100% 50%"] }
      }
      transition={
        prefersReducedMotion ? undefined : { duration, ease: "linear", repeat: Infinity }
      }
      {...props}
    >
      {children}
    </motionPrimitive.span>
  );
}
