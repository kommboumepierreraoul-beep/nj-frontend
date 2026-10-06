"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminUser } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_utilisateurs.md § 10.2 — suppression définitive, friction
 * volontairement élevée : saisie du nom complet OU de l'email de la personne
 * à supprimer, rappel explicite de l'irréversibilité. Réservé SUPER_ADMIN
 * (masqué en amont côté page, contrôle serveur qui fait foi).
 */
export function DeleteUserDialog({ open, onOpenChange, user, isPending, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; user: AdminUser | null; isPending?: boolean; onConfirm: () => void }) {
  const [confirmation, setConfirmation] = useState("");
  const isMatch = Boolean(user) && (confirmation.trim() === user?.full_name || confirmation.trim().toLowerCase() === user?.email.toLowerCase());

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setConfirmation("");
      }}
    >
      <DialogContent className="max-w-[460px] p-[26px]">
        <DialogTitle className="sr-only">{translate("t.supprimerDefinitivementCetUtilisateur")}</DialogTitle>
        <div className="flex items-start gap-3.5">
          <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] bg-destructive-bg text-destructive">
            <AlertTriangle className="h-[23px] w-[23px]" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
            <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground text-pretty">{translate("t.supprimerDefinitivementCetUtilisateur")}</p>
            <DialogDescription className="text-[13.5px] leading-[1.55] text-muted-foreground text-pretty">
              {translate("t.deleteUserP1")}<strong>{user?.full_name}</strong> ({user?.email}){translate("t.deleteUserP2")}
            </DialogDescription>
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <Label htmlFor="delete-confirmation">{translate("t.tapezLeNomCompletOuLEmailPourConfirmer")}</Label>
          <Input id="delete-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder={user?.full_name} autoComplete="off" />
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>{translate("action.cancel")}</Button>
          <Button type="button" variant="destructive" disabled={!isMatch || isPending} onClick={onConfirm}>
            {translate("t.supprimerDefinitivementBtn")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
