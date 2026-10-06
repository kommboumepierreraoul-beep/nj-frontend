"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { salesOrderUpdateSchema, type SalesOrderUpdateSchema } from "../schemas/sales-order-update.schema";
import { useUpdateSalesOrder } from "../hooks/use-sales-order-mutations";
import { TRANSPORT_MODE_LABELS } from "../badges";
import type { SalesOrder } from "../types";
import { translate } from "@/i18n/translate";

const BILLING_MODE_LABELS: Record<string, string> = {
  COMMISSION_VISIBLE: "Commission visible",
  PRIX_GLOBAL: "Prix global",
};

/** Doc/spec_pages_commandes.md § 1 « Formulaire Modifier la commande » — seuls les champs logistiques restent modifiables après création. */
export function SalesOrderEditDialog({ open, onOpenChange, salesOrder }: { open: boolean; onOpenChange: (open: boolean) => void; salesOrder: SalesOrder }) {
  const mutation = useUpdateSalesOrder(salesOrder.id);

  const {
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<SalesOrderUpdateSchema>({
    resolver: zodResolver(salesOrderUpdateSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!open) return;
    reset({
      billing_mode: salesOrder.billing_mode,
      transport_mode: salesOrder.transport_mode,
      estimated_weight_kg: salesOrder.estimated_weight_kg ?? undefined,
      estimated_volume_cbm: salesOrder.estimated_volume_cbm ?? undefined,
      actual_weight_kg: salesOrder.actual_weight_kg ?? undefined,
      actual_volume_cbm: salesOrder.actual_volume_cbm ?? undefined,
      carrier_name: salesOrder.carrier_name ?? "",
      tracking_number: salesOrder.tracking_number ?? "",
      tax_rate: salesOrder.tax_rate ?? undefined,
      notes: salesOrder.notes ?? "",
      internal_notes: salesOrder.internal_notes ?? "",
    });
  }, [open, salesOrder, reset]);

  function onSubmit(values: SalesOrderUpdateSchema) {
    const payload = {
      ...values,
      carrier_name: values.carrier_name || undefined,
      tracking_number: values.tracking_number || undefined,
      notes: values.notes || undefined,
      internal_notes: values.internal_notes || undefined,
    };
    mutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={translate("form.head.modifierLaCommande")} pending={mutation.isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection title={translate("section.facturationTransport")} cols={2}>
              <FormField label={translate("field.modeDeFacturation")} htmlFor="billing_mode">
                <Controller
                  control={control}
                  name="billing_mode"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="billing_mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BILLING_MODE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.modeDeTransport")} htmlFor="transport_mode">
                <Controller
                  control={control}
                  name="transport_mode"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="transport_mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TRANSPORT_MODE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.transporteur")} htmlFor="carrier_name">
                <Input id="carrier_name" {...register("carrier_name")} />
              </FormField>
              <FormField label={translate("field.nDeSuivi")} htmlFor="tracking_number">
                <Input id="tracking_number" {...register("tracking_number")} />
              </FormField>
              <FormField label={translate("field.tva")} htmlFor="tax_rate">
                <Input id="tax_rate" type="number" step="0.01" min={0} max={100} {...register("tax_rate")} placeholder={translate("ph.0Aucune")} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.poidsVolume")} description={translate("t.estimesALaCreationReelsConstatesALExpedition")} cols={2}>
              <FormField label={translate("field.poidsEstimeKg")} htmlFor="estimated_weight_kg">
                <Input id="estimated_weight_kg" type="number" step="0.01" min={0} {...register("estimated_weight_kg")} />
              </FormField>
              <FormField label={translate("field.volumeEstimeCbm")} htmlFor="estimated_volume_cbm">
                <Input id="estimated_volume_cbm" type="number" step="0.01" min={0} {...register("estimated_volume_cbm")} />
              </FormField>
              <FormField label={translate("field.poidsReelKg")} htmlFor="actual_weight_kg">
                <Input id="actual_weight_kg" type="number" step="0.01" min={0} {...register("actual_weight_kg")} />
              </FormField>
              <FormField label={translate("field.volumeReelCbm")} htmlFor="actual_volume_cbm">
                <Input id="actual_volume_cbm" type="number" step="0.01" min={0} {...register("actual_volume_cbm")} />
              </FormField>
            </FormSection>

            <FormField label={translate("field.notesVisiblesSurLeProforma")} htmlFor="notes">
              <Textarea id="notes" {...register("notes")} rows={2} />
            </FormField>
            <FormField label={translate("section.notesInternes")} htmlFor="internal_notes">
              <Textarea id="internal_notes" {...register("internal_notes")} rows={2} />
            </FormField>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={mutation.isPending}>{translate("action.save")}</Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
