import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full px-4 py-2.5 bg-[#151618] border border-border rounded-2xl text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        autoComplete="off"
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
