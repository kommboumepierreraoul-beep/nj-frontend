import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Champ texte (§ 2.3), calqué sur NJ Global Trade Clients.dc.html ligne 699 :
 * hauteur 46px, angles 10px, bordure 1.5px, texte 13.5px, focus doré (jamais
 * l'anneau bleu par défaut de shadcn/ui).
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-[46px] w-full rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 text-[13.5px] text-foreground",
        "placeholder:text-text-quaternary focus-visible:border-accent focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
