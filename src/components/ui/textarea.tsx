import * as React from "react";
import { cn } from "@/lib/utils";

/** Zone de texte (§ 2.3), calquée sur NJ Global Trade Clients.dc.html ligne 702 : mêmes angles/bordure/focus que Input, hauteur minimale 84px. */
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[84px] w-full rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 py-3 text-[13.5px] leading-[1.5] text-foreground",
        "placeholder:text-text-quaternary focus-visible:border-accent focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
