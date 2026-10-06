"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-section";
import { useChangeClientStatus } from "../hooks/use-client-mutations";
import { CLIENT_STATUS_LABELS } from "../badges";
import type { ClientStatus } from "../types";
import { translate } from "@/i18n/translate";

export function ChangeStatusDialog({
  open,
  onOpenChange,
  clientId,
  currentStatus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: number;
  currentStatus: ClientStatus;
}) {
  const [status, setStatus] = useState<ClientStatus>(currentStatus);
  const mutation = useChangeClientStatus(clientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] p-[26px]">
        <DialogTitle className="sr-only">{translate("t.changerLeStatut")}</DialogTitle>
        <div className="flex items-start gap-3.5">
          <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] bg-accent-bg text-link">
            <RefreshCw className="h-[23px] w-[23px]" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
            <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground text-pretty">{translate("t.changerLeStatut")}</p>
            <p className="text-[13.5px] leading-[1.55] text-muted-foreground text-pretty">
              Sélectionnez le nouveau statut à appliquer à ce client.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <FormField label={translate("field.nouveauStatut")} htmlFor="status">
            <Select value={status} onValueChange={(value) => setStatus(value as ClientStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
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
            onClick={() => mutation.mutate(status, { onSuccess: () => onOpenChange(false) })}
          >{translate("action.confirm")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
