"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-section";
import { useVerifySupplier } from "../hooks/use-supplier-mutations";
import { VERIFICATION_METHOD_LABELS } from "../badges";
import type { SupplierVerificationMethod } from "../types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_fournisseurs.md § 1 — action « Vérifier le fournisseur ». */
export function VerifySupplierDialog({ open, onOpenChange, supplierId }: { open: boolean; onOpenChange: (open: boolean) => void; supplierId: number }) {
  const [method, setMethod] = useState<SupplierVerificationMethod>("DOCUMENTS_ONLY");
  const mutation = useVerifySupplier(supplierId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-[26px]">
        <DialogTitle className="sr-only">{translate("t.verifierLeFournisseur")}</DialogTitle>
        <div className="flex items-start gap-3.5">
          <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] bg-accent-bg text-link">
            <ShieldCheck className="h-[23px] w-[23px]" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
            <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground text-pretty">{translate("t.verifierLeFournisseur")}</p>
            <DialogDescription className="text-[13.5px] leading-[1.55] text-muted-foreground text-pretty">
              Confirme la vérification du fournisseur selon la méthode sélectionnée ci-dessous.
            </DialogDescription>
          </div>
        </div>
        <div className="mt-4">
          <FormField label={translate("field.methodeDeVerification")} htmlFor="verification_method">
            <Select value={method} onValueChange={(value) => setMethod(value as SupplierVerificationMethod)}>
              <SelectTrigger id="verification_method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VERIFICATION_METHOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ verification_method: method }, { onSuccess: () => onOpenChange(false) })}
          >{translate("action.confirm")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
