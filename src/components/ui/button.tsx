import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Dimensions calquées sur les boutons de NJ Global Trade Dashboard.dc.html
 * (actions d'en-tête lignes 360-362, modale de profil lignes 170-176) :
 * hauteur 42px, angles 10px, texte 13px — jamais les valeurs par défaut
 * shadcn/ui (40px, 6px, 14px). `default`/`destructive` (actions pleines,
 * dorées ou rouges) portent le texte en 700 ; `outline`/`ghost` en 600,
 * comme "Annuler"/"Se déconnecter" dans la maquette.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent font-bold text-accent-foreground hover:opacity-90",
        outline: "border-[1.5px] border-border bg-surface font-semibold text-muted-foreground hover:border-foreground hover:text-foreground",
        ghost: "font-semibold hover:bg-background",
        destructive: "bg-destructive font-bold text-white hover:opacity-90",
        link: "text-link underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[42px] px-4",
        sm: "h-9 rounded-[9px] px-3",
        lg: "h-[42px] px-8",
        icon: "h-[42px] w-[42px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
