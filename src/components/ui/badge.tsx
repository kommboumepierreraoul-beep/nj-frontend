import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge de statut (§ 2.3 / § 4.4) : fond teinté + texte de la même famille de
 * couleur, jamais de couleur pleine agressive. `tone` couvre les 4 tons
 * génériques (succès/attention/erreur/neutre) + les couleurs de module déjà
 * définies dans globals.css ; un module futur ajoute son propre ton au même
 * endroit (theme + ici), jamais une couleur ad hoc dans un composant.
 *
 * Hauteur fixe 24px et angles pleinement arrondis, comme les pastilles de
 * NJ Global Trade Dashboard.dc.html (badges d'en-tête, lignes 352-354 ;
 * lignes du recouvrement, ~568-571) — jamais un padding vertical flottant
 * (`py-0.5`) qui rend chaque badge d'une hauteur légèrement différente.
 */
const badgeVariants = cva("inline-flex h-[24px] items-center rounded-full px-[10px] text-[11px] font-semibold whitespace-nowrap", {
  variants: {
    tone: {
      success: "bg-success-bg text-success",
      warning: "bg-warning-bg text-warning",
      destructive: "bg-destructive-bg text-destructive",
      neutral: "bg-neutral-bg text-neutral",
      /** Doré (§ 2.2) : VIP, mise en avant — même teinte que l'accent d'interface. */
      accent: "bg-accent-bg text-accent-hover",
      clients: "bg-module-clients-bg text-module-clients",
      products: "bg-module-products-bg text-module-products",
      suppliers: "bg-module-suppliers-bg text-module-suppliers",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, className }))} {...props} />;
}

export { Badge, badgeVariants };
