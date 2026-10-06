"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { shippingRateSchema, type ShippingRateSchema } from "../schemas/shipping-rate.schema";
import { useCreateShippingRate, useUpdateShippingRate } from "../hooks/use-shipping-rate-mutations";
import { SHIPPING_MODE_LABELS } from "../badges";
import type { ShippingRate } from "../types";
import { translate } from "@/i18n/translate";

export function ShippingRateFormDialog({ open, onOpenChange, rate }: { open: boolean; onOpenChange: (open: boolean) => void; rate?: ShippingRate | null }) {
  const isEdit = Boolean(rate);
  const createMutation = useCreateShippingRate();
  const updateMutation = useUpdateShippingRate(rate?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ShippingRateSchema>({ resolver: zodResolver(shippingRateSchema), defaultValues: { mode: "AERIEN", is_active: true } });

  useEffect(() => {
    if (!open) return;
    reset(
      rate
        ? {
            mode: rate.mode,
            min_quantity: rate.min_quantity,
            max_quantity: rate.max_quantity ?? undefined,
            rate: rate.rate,
            unit: rate.unit,
            lead_time_label: rate.lead_time_label,
            is_active: rate.is_active,
            sort_order: rate.sort_order,
          }
        : { mode: "AERIEN", is_active: true },
    );
  }, [open, rate, reset]);

  const isActive = watch("is_active");

  function onSubmit(values: ShippingRateSchema) {
    if (isEdit && rate) {
      updateMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier le palier" : "Nouveau palier de tarif"} pending={isPending} />
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("ph.mode")} htmlFor="mode">
                <Controller
                  control={control}
                  name="mode"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SHIPPING_MODE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.unite")} htmlFor="unit" required error={errors.unit?.message}>
                <Input id="unit" {...register("unit")} placeholder="kg, CBM…" />
              </FormField>
              <FormField label={translate("field.quantiteMinimum")} htmlFor="min_quantity" required error={errors.min_quantity?.message}>
                <Input id="min_quantity" type="number" step="0.01" min={0} {...register("min_quantity")} />
              </FormField>
              <FormField label={translate("field.quantiteMaximum")} htmlFor="max_quantity" error={errors.max_quantity?.message}>
                <Input id="max_quantity" type="number" step="0.01" min={0} {...register("max_quantity")} placeholder={translate("ph.illimiteSiVide")} />
              </FormField>
              <FormField label={translate("field.tarifFcfa")} htmlFor="rate" required error={errors.rate?.message}>
                <Input id="rate" type="number" step="0.01" min={0} {...register("rate")} />
              </FormField>
              <FormField label={translate("field.ordreDAffichage")} htmlFor="sort_order">
                <Input id="sort_order" type="number" {...register("sort_order")} />
              </FormField>
            </FormSection>
            <FormField label={translate("field.delaiIndicatif")} htmlFor="lead_time_label" required error={errors.lead_time_label?.message}>
              <Input id="lead_time_label" {...register("lead_time_label")} placeholder={translate("ph.ex7A10Jours")} />
            </FormField>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <Label htmlFor="is_active">Palier actif</Label>
              <Switch id="is_active" checked={isActive ?? true} onCheckedChange={(value) => setValue("is_active", value)} />
            </div>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : translate("t.creerLePalier")}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
