import * as React from "react";
import { cn } from "@/lib/utils";

export interface ShinyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "default" | "sm";
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ className, size = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "shiny-cta",
          size === "sm" ? "shiny-cta--sm" : "shiny-cta--default",
          className
        )}
        {...props}
      >
        <span>{children}</span>
      </button>
    );
  }
);

ShinyButton.displayName = "ShinyButton";

export { ShinyButton };
