"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-section";
import { changeStatusSchema, type ChangeStatusSchema } from "../schemas/change-status.schema";
import { useChangeSalesOrderStatus } from "../hooks/use-sales-order-mutations";
import { SALES_ORDER_STATUS_LABELS } from "../badges";
import type { SalesOrder } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_commandes.md § « Action Changer le statut » — garde-fous
 * côté API reflétés tels quels : passer à `PROFORMA_ENVOYEE` exige au moins
 * une ligne `is_selected = true`, passer à `ANNULEE` exige un motif (validé
 * côté client en plus, mais le message 422 fait foi en cas de désaccord).
 */
export function ChangeStatusDialog({ open, onOpenChange, salesOrder }: { open: boolean; onOpenChange: (open: boolean) => void; salesOrder: SalesOrder }) {
  const mutation = useChangeSalesOrderStatus(salesOrder.id);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<ChangeStatusSchema>({ resolver: zodResolver(changeStatusSchema), defaultValues: { status: salesOrder.status } });

  useEffect(() => {
    if (open) reset({ status: salesOrder.status, reason: "" });
  }, [open, salesOrder.status, reset]);

  const status = watch("status");
  const hasSelectedItem = (salesOrder.items ?? []).some((item) => item.is_selected);

  function onSubmit(values: ChangeStatusSchema) {
    mutation.mutate({ status: values.status, reason: values.reason || undefined }, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-[26px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle className="sr-only">{translate("t.changerLeStatut")}</DialogTitle>
          <div className="flex items-start gap-3.5">
            <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] bg-accent-bg text-link">
              <RefreshCw className="h-[23px] w-[23px]" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
              <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground text-pretty">{translate("t.changerLeStatut")}</p>
              <DialogDescription className="text-[13.5px] leading-[1.55] text-muted-foreground text-pretty">
                Sélectionnez le nouveau statut de cette commande et précisez un motif si nécessaire.
              </DialogDescription>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            <FormField label={translate("field.nouveauStatut")} htmlFor="status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SALES_ORDER_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            {status === "PROFORMA_ENVOYEE" && !hasSelectedItem ? (
              <p className="text-xs text-warning">{translate("misc.aucuneLigneSelectionnee")}</p>
            ) : null}
            {status === "ANNULEE" ? (
              <FormField label={translate("field.motif")} htmlFor="reason" required error={errors.reason?.message}>
                <Textarea id="reason" {...register("reason")} rows={3} />
              </FormField>
            ) : (
              <FormField label={translate("field.motifFacultatif")} htmlFor="reason">
                <Textarea id="reason" {...register("reason")} rows={2} />
              </FormField>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={mutation.isPending}>{translate("action.confirm")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
