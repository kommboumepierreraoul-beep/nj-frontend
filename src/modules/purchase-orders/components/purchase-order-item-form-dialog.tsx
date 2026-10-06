"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { VariantPickerField } from "./variant-picker-field";
import { purchaseOrderItemSchema, type PurchaseOrderItemSchema } from "../schemas/purchase-order-item.schema";
import { useCreatePurchaseOrderItem, useUpdatePurchaseOrderItem } from "../hooks/use-purchase-order-items";
import type { PurchaseOrderItem } from "../types";
import { translate } from "@/i18n/translate";

export function PurchaseOrderItemFormDialog({
  open,
  onOpenChange,
  poId,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poId: number;
  item?: PurchaseOrderItem | null;
}) {
  const isEdit = Boolean(item);
  const createMutation = useCreatePurchaseOrderItem(poId);
  const updateMutation = useUpdatePurchaseOrderItem(poId);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PurchaseOrderItemSchema>({
    resolver: zodResolver(purchaseOrderItemSchema),
    defaultValues: { quantity: 1, unit_price: 0 },
  });

  useEffect(() => {
    if (!open) return;
    if (item) {
      setSelectedLabel(`${item.product_variant.sku} — ${item.product_variant.name}`);
      reset({ product_variant_id: item.product_variant.id, quantity: item.quantity, unit_price: item.unit_price, notes: item.notes ?? "" });
    } else {
      setSelectedLabel(null);
      reset({ quantity: 1, unit_price: 0 });
    }
  }, [open, item, reset]);

  const variantId = watch("product_variant_id");

  function onSubmit(values: PurchaseOrderItemSchema) {
    const payload = { ...values, notes: values.notes || undefined };
    if (isEdit && item) {
      updateMutation.mutate({ itemId: item.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier l'article" : "Nouvel article"} pending={isPending} />

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormField label={translate("field.varianteDeProduit")} htmlFor="product_variant_id" required error={errors.product_variant_id?.message}>
              {isEdit ? (
                <Input value={selectedLabel ?? ""} disabled />
              ) : (
                <>
                  {selectedLabel ? <p className="mb-2 text-sm text-foreground">Sélection : {selectedLabel}</p> : null}
                  <VariantPickerField
                    onSelect={(variant) => {
                      setValue("product_variant_id", variant.id);
                      setValue("unit_price", variant.purchase_price);
                      setSelectedLabel(`${variant.sku} — ${variant.name}`);
                    }}
                  />
                </>
              )}
            </FormField>

            <FormField label={translate("field.quantite")} htmlFor="quantity" required error={errors.quantity?.message}>
              <Input id="quantity" type="number" min={1} {...register("quantity")} />
            </FormField>
            <FormField label={translate("field.prixUnitaire")} htmlFor="unit_price" required error={errors.unit_price?.message}>
              <Input id="unit_price" type="number" step="0.01" min={0} {...register("unit_price")} />
            </FormField>
            <FormField label={translate("section.notes")} htmlFor="notes">
              <Textarea id="notes" {...register("notes")} rows={2} />
            </FormField>
          </div>

          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending || !variantId}>
              {isEdit ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
