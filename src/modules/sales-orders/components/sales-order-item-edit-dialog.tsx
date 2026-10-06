"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { salesOrderItemUpdateSchema, type SalesOrderItemUpdateSchema } from "../schemas/sales-order-item-update.schema";
import { useUpdateSalesOrderItem } from "../hooks/use-sales-order-items";
import type { SalesOrderItem } from "../types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_commandes.md § 2 « Formulaire Modifier une ligne » — `item_type`/`product_variant_id` non modifiables (supprimer et recréer la ligne si le produit change). */
export function SalesOrderItemEditDialog({
  open,
  onOpenChange,
  salesOrderId,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesOrderId: number;
  item: SalesOrderItem | null;
}) {
  const mutation = useUpdateSalesOrderItem(salesOrderId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SalesOrderItemUpdateSchema>({ resolver: zodResolver(salesOrderItemUpdateSchema), defaultValues: {} });

  useEffect(() => {
    if (open && item) {
      reset({
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        is_selected: item.is_selected,
        notes: item.notes ?? "",
      });
    }
  }, [open, item, reset]);

  if (!item) return null;

  function onSubmit(values: SalesOrderItemUpdateSchema) {
    if (!item) return;
    mutation.mutate({ itemId: item.id, payload: { ...values, notes: values.notes || undefined } }, { onSuccess: () => onOpenChange(false) });
  }

  const subtitle = item.product_variant ? `${item.product_variant.sku} — ${item.product_variant.name}` : (item.label ?? undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={translate("form.head.modifierLaLigne")} subtitle={subtitle} pending={mutation.isPending} />
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.quantite")} htmlFor="quantity" error={errors.quantity?.message}>
                <Input id="quantity" type="number" step="0.01" min={0.01} {...register("quantity")} />
              </FormField>
              <FormField label={translate("field.prixUnitaire")} htmlFor="unit_price" error={errors.unit_price?.message}>
                <Input id="unit_price" type="number" step="0.01" min={0} {...register("unit_price")} />
              </FormField>
              <FormField label={translate("field.remise")} htmlFor="discount_amount">
                <Input id="discount_amount" type="number" step="0.01" min={0} {...register("discount_amount")} />
              </FormField>
              <FormField label={translate("section.notes")} htmlFor="notes" span={2}>
                <Input id="notes" {...register("notes")} />
              </FormField>
            </FormSection>
            <div className="flex items-center gap-2">
              <Controller control={control} name="is_selected" render={({ field }) => <Checkbox id="is_selected" checked={field.value ?? false} onCheckedChange={field.onChange} />} />
              <Label htmlFor="is_selected" className="font-normal">
                Sélectionnée par le client
              </Label>
            </div>
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
