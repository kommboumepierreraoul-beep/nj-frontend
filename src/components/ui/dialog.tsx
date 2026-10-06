"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

/**
 * Primitive shadcn/ui classique (Radix Dialog), calquée sur le modal de
 * formulaire de NJ Global Trade Clients.dc.html lignes 630-632 (fond flouté,
 * angles 18px, ombre portée, padding supérieur 40px) — c'est le patron le
 * plus utilisé (tous les formulaires de création/édition) ; la modale de
 * profil de l'en-tête (NJ Global Trade Dashboard.dc.html lignes 126-180, un
 * peu différente : padding 70px, sans flou) surcharge `max-w-[480px]` via
 * `className` mais reprend ce même chrome, suffisamment proche visuellement.
 * L'animation d'ouverture (njFade sur l'overlay, njPop sur le contenu)
 * reprend celle du template plutôt que les valeurs par défaut de shadcn/ui.
 */
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-[65] bg-[#111111]/42 backdrop-blur-[3px]", className)}
    style={{ animation: "njFade 140ms ease" }}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <div className="fixed inset-0 z-[65] flex items-start justify-center overflow-y-auto px-6 py-10">
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "w-full max-w-[660px] overflow-hidden rounded-[18px] bg-surface shadow-[0_32px_80px_rgba(17,17,17,0.28)]",
          className,
        )}
        style={{ animation: "njPop 220ms cubic-bezier(.2,.7,.2,1)" }}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </div>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={className} {...props} />);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={className} {...props} />);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
};
