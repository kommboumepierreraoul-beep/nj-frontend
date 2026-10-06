"use client";

import { useState } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Modale de confirmation destructive (§ 2.3), calquée sur NJ Global Trade
 * Clients.dc.html lignes 777-784 : puce d'icône 46×46 à angles 13px, texte
 * explicite de la conséquence à côté (jamais en dessous) — motif obligatoire
 * si l'action l'exige, bouton d'action en rouge.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmer",
  destructive = true,
  requireReason = false,
  isPending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  requireReason?: boolean;
  isPending?: boolean;
  onConfirm: (reason?: string) => void;
}) {
  const [reason, setReason] = useState("");
  const disabled = isPending || (requireReason && reason.trim().length === 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] p-[26px]">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex items-start gap-3.5">
          <span
            className={cn(
              "flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px]",
              destructive ? "bg-destructive-bg text-destructive" : "bg-accent-bg text-link",
            )}
          >
            {destructive ? <AlertTriangle className="h-[23px] w-[23px]" /> : <HelpCircle className="h-[23px] w-[23px]" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
            <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground text-pretty">{title}</p>
            <DialogDescription className="text-[13.5px] leading-[1.55] text-muted-foreground text-pretty">
              {description}
            </DialogDescription>
          </div>
        </div>
        {requireReason ? (
          <div className="mt-4 flex flex-col gap-1.5">
            <Label htmlFor="confirm-reason" className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              Motif
            </Label>
            <Input
              id="confirm-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Expliquez la raison de cette action"
            />
          </div>
        ) : null}
        <div className="mt-6 flex justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Annuler
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={disabled}
            onClick={() => onConfirm(requireReason ? reason.trim() : undefined)}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
