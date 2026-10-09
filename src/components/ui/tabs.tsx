"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

/**
 * Navigation par onglets (§ 2.3), calquée sur NJ Global Trade
 * Fournisseurs.dc.html lignes 444-453 : contrôle segmenté dans une carte
 * blanche à angles 12px (pas un soulignement sous un texte plat) — chaque
 * onglet est une pastille à angles 9px, fond noir plein pour l'onglet actif
 * (texte blanc), transparent sinon (survol léger).
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex max-w-full flex-nowrap items-center gap-1.5 overflow-x-auto rounded-[12px] border border-border bg-surface p-[5px] sm:flex-wrap sm:overflow-visible",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-[38px] items-center gap-2 whitespace-nowrap rounded-[9px] px-3.5 text-[13px] font-semibold text-muted-foreground transition-colors",
      "hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      "data-[state=active]:bg-foreground data-[state=active]:text-sidebar-foreground data-[state=active]:hover:bg-foreground",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/**
 * Pastille de comptage optionnelle à droite du libellé d'un onglet (ex.
 * lignes 449 de la maquette) — fond doré sur l'onglet actif, gris neutre
 * sinon. À utiliser seulement quand le compte est déjà connu de la page hôte
 * (jamais une requête dédiée rien que pour l'afficher).
 */
const TabsCount = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex h-[19px] min-w-[20px] items-center justify-center rounded-full bg-neutral-bg px-1.5 text-[10.5px] font-bold text-muted-foreground",
      "[[data-state=active]_&]:bg-accent [[data-state=active]_&]:text-accent-foreground",
      className,
    )}
    {...props}
  />
));
TabsCount.displayName = "TabsCount";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("pt-5 focus-visible:outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsCount };
