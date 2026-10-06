"use client";

import { X } from "lucide-react";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FormProgressBar } from "./form-progress-bar";
import { cn } from "@/lib/utils";

/**
 * En-tête et pied communs à tous les formulaires en modal (§ 2.3), calqués
 * sur NJ Global Trade Clients.dc.html lignes 633-648 (en-tête : titre
 * 20px/800, sous-titre facultatif, bouton de fermeture 36×36 à droite — à
 * côté du bouton « Aide sur les champs » quand il existe, voir `actions`) et
 * lignes 787-791 (pied : "Annuler" en outline puis l'action principale,
 * jamais l'inverse). Un formulaire sans sous-titre garde quand même une
 * `DialogDescription` (masquée) : Radix Dialog l'exige pour l'accessibilité.
 *
 * `pending` : passe la soumission en cours de la mutation du formulaire. Rend
 * une barre de progression indéterminée le long du filet bas de l'en-tête
 * (`FormProgressBar`) et désactive le bouton de fermeture — le retour visuel
 * standard de tous les formulaires en modal du projet.
 */
export function DialogFormHeader({
  title,
  subtitle,
  actions,
  pending = false,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  pending?: boolean;
  className?: string;
}) {
  return (
    <div data-tour="dialog-form" className={cn("relative flex items-start justify-between gap-5 border-b border-border px-6 py-[22px]", className)}>
      <div className="flex min-w-0 flex-col gap-1.5">
        <DialogTitle className="text-[20px] font-extrabold tracking-[-0.025em] text-foreground text-pretty">{title}</DialogTitle>
        {subtitle ? (
          <DialogDescription className="text-[13px] leading-[1.5] text-muted-foreground text-pretty">{subtitle}</DialogDescription>
        ) : (
          <DialogDescription className="sr-only">{title}</DialogDescription>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <DialogClose
          disabled={pending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-background text-muted-foreground hover:bg-border hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <X className="h-[19px] w-[19px]" />
        </DialogClose>
      </div>
      {pending ? <FormProgressBar /> : null}
    </div>
  );
}

export function DialogFormFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div data-tour="dialog-submit" className={cn("flex flex-wrap items-center justify-end gap-2.5 border-t border-border px-6 py-4", className)}>
      {children}
    </div>
  );
}
