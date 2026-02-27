import * as React from "react";
import { ShinyButton } from "@/components/ui/shiny-button";

export type PremiumButtonProps = React.ComponentPropsWithoutRef<
  typeof ShinyButton
>;

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (props, ref) => <ShinyButton ref={ref} {...props} />
);

PremiumButton.displayName = "PremiumButton";

export { PremiumButton };
