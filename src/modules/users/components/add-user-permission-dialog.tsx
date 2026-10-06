"use client";

import { useState } from "react";
import { ShieldPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-section";
import { usePermissionsCatalog } from "../hooks/use-permissions-catalog";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_utilisateurs.md § C2 « bouton Ajouter une permission → sélecteur parmi le catalogue (D1) ». */
export function AddUserPermissionDialog({
  open,
  onOpenChange,
  excludeCodes,
  isPending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeCodes: string[];
  isPending?: boolean;
  onConfirm: (code: string) => void;
}) {
  const catalog = usePermissionsCatalog();
  const [code, setCode] = useState("");
  const available = (catalog.data ?? []).filter((permission) => !excludeCodes.includes(permission.code));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setCode("");
      }}
    >
      <DialogContent className="max-w-[440px] p-[26px]">
        <DialogTitle className="sr-only">{translate("t.ajouterUnePermissionIndividuelle")}</DialogTitle>
        <div className="flex items-start gap-3.5">
          <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] bg-accent-bg text-link">
            <ShieldPlus className="h-[23px] w-[23px]" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
            <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground text-pretty">{translate("t.ajouterUnePermissionIndividuelle")}</p>
            <DialogDescription className="text-[13.5px] leading-[1.55] text-muted-foreground text-pretty">
              {translate("t.cettePermissionSajouteAuxDroits")}
            </DialogDescription>
          </div>
        </div>
        <div className="mt-4">
          <FormField label={translate("field.permission")} htmlFor="permission-code">
            <Select value={code} onValueChange={setCode}>
              <SelectTrigger id="permission-code">
                <SelectValue placeholder={translate("ph.selectionnerUnePermission")} />
              </SelectTrigger>
              <SelectContent>
                {available.map((permission) => (
                  <SelectItem key={permission.code} value={permission.code}>
                    {permission.label} ({permission.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
          <Button type="button" disabled={!code || isPending} onClick={() => onConfirm(code)}>{translate("action.add")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
