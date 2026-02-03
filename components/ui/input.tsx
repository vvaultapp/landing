"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex w-full rounded-2xl border border-white/10 bg-[#101014] px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/30",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
