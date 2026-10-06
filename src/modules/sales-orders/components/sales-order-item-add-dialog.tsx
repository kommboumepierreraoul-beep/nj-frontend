"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { VariantPickerField } from "@/modules/purchase-orders/components/variant-picker-field";
import { salesOrderItemSchema, type SalesOrderItemSchema } from "../schemas/sales-order-item.schema";
import { useCreateSalesOrderItem } from "../hooks/use-sales-order-items";
import type { SalesOrderItemType, SalesOrderType } from "../types";
import { translate } from "@/i18n/translate";

function itemTypeForOrderType(type: SalesOrderType): SalesOrderItemType {
  return type === "PRESTATION_SERVICE" ? "SERVICE" : "PRODUIT";
}

/** Doc/spec_pages_commandes.md § 2 « Formulaire Ajouter une ligne » — mêmes champs que la section Lignes du formulaire de création (§1). */
export function SalesOrderItemAddDialog({
  open,
  onOpenChange,
  salesOrderId,
  orderType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesOrderId: number;
  orderType: SalesOrderType;
}) {
  const mutation = useCreateSalesOrderItem(salesOrderId);
  const itemType = itemTypeForOrderType(orderType);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<SalesOrderItemSchema>({
    resolver: zodResolver(salesOrderItemSchema),
    defaultValues: { item_type: itemType, quantity: 1, unit_price: 0, is_selected: true },
  });

  useEffect(() => {
    if (open) reset({ item_type: itemType, quantity: 1, unit_price: 0, is_selected: true });
  }, [open, itemType, reset]);

  const productVariantId = watch("product_variant_id");
  const [pickedVariantLabel, setPickedVariantLabel] = useState<string | null>(null);

  function onSubmit(values: SalesOrderItemSchema) {
    const payload = { ...values, label: values.label || undefined, description: values.description || undefined, notes: values.notes || undefined };
    mutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={translate("form.head.ajouterUneLigne")} pending={mutation.isPending} />
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              {itemType === "PRODUIT" ? (
                <FormField label={translate("field.varianteProduit")} required error={errors.product_variant_id?.message} span={2}>
                  {productVariantId ? (
                    <div className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
                      <span>{pickedVariantLabel ?? translate("t.varianteSelectionnee")}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setValue("product_variant_id", undefined);
                          setPickedVariantLabel(null);
                        }}
                      >
                        {translate("t.changer")}
                      </Button>
                    </div>
                  ) : (
                    <VariantPickerField
                      onSelect={(variant) => {
                        setValue("product_variant_id", variant.id);
                        setPickedVariantLabel(`${variant.sku} — ${variant.name}`);
                      }}
                    />
                  )}
                </FormField>
              ) : (
                <FormField label={translate("field.libelleDeLaPrestation")} htmlFor="label" required error={errors.label?.message} span={2}>
                  <Input id="label" {...register("label")} />
                </FormField>
              )}
              <FormField label={translate("field.description")} htmlFor="description" span={2}>
                <Textarea id="description" {...register("description")} rows={2} />
              </FormField>
              <FormField label={translate("field.quantite")} htmlFor="quantity" required error={errors.quantity?.message}>
                <Input id="quantity" type="number" step="0.01" min={0.01} {...register("quantity")} />
              </FormField>
              <FormField label={translate("field.prixUnitaire")} htmlFor="unit_price" required error={errors.unit_price?.message}>
                <Input id="unit_price" type="number" step="0.01" min={0} {...register("unit_price")} />
              </FormField>
              <FormField label={translate("field.remise")} htmlFor="discount_amount">
                <Input id="discount_amount" type="number" step="0.01" min={0} {...register("discount_amount")} placeholder="0" />
              </FormField>
              <FormField label={translate("section.notes")} htmlFor="notes">
                <Input id="notes" {...register("notes")} />
              </FormField>
            </FormSection>

            {orderType === "PRODUIT_UNIQUE_MULTI_CHOIX" ? (
              <div className="flex flex-wrap items-center gap-4 rounded-md border border-border-2 bg-background/40 p-3">
                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name="is_proposed_option"
                    render={({ field }) => <Checkbox id="is_proposed_option" checked={field.value ?? false} onCheckedChange={field.onChange} />}
                  />
                  <Label htmlFor="is_proposed_option" className="font-normal">
                    Option proposée (comparatif 3 choix)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name="is_selected"
                    render={({ field }) => <Checkbox id="is_selected" checked={field.value ?? true} onCheckedChange={field.onChange} />}
                  />
                  <Label htmlFor="is_selected" className="font-normal">
                    Sélectionnée par le client
                  </Label>
                </div>
              </div>
            ) : null}
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={mutation.isPending}>
              Ajouter la ligne
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
