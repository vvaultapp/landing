"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "soft" | "accent";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-white text-black shadow-[0_12px_30px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(255,255,255,0.22)]",
  outline:
    "border border-white/15 bg-black/30 text-white hover:-translate-y-0.5 hover:border-white/30 hover:bg-black/40",
  ghost: "text-white/70 hover:text-white",
  soft: "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
  accent:
    "bg-gradient-to-r from-emerald-200 via-white to-sky-200 text-black shadow-[0_12px_30px_rgba(56,189,248,0.22)] hover:-translate-y-0.5",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild, children, ...props }, ref) => {
    const classes = cn(base, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn(classes, children.props.className),
      });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
