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
  "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  default: "border border-white/20 bg-white/10 text-white hover:bg-white/15 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
  outline:
    "border border-white/20 bg-transparent text-white/80 hover:text-white hover:border-white/30 hover:shadow-[0_6px_18px_rgba(0,0,0,0.3)]",
  ghost: "text-white/70 hover:text-white",
  soft: "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
  accent: "bg-white text-black hover:bg-white/90 hover:shadow-[0_10px_26px_rgba(255,255,255,0.18)]",
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
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        ...props,
        className: cn(classes, child.props?.className),
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
