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
import { rfqItemSchema, type RfqItemSchema } from "../schemas/rfq-item.schema";
import { useCreateRfqItem, useUpdateRfqItem } from "../hooks/use-rfq-items";
import { useProductsList } from "@/modules/products/hooks/use-products-list";
import { useUnits } from "@/modules/reference-data/hooks/use-units";
import type { RfqItem } from "../types";
import { translate } from "@/i18n/translate";

const NONE = "__none__";

export function RfqItemFormDialog({ open, onOpenChange, rfqId, item }: { open: boolean; onOpenChange: (open: boolean) => void; rfqId: number; item?: RfqItem | null }) {
  const isEdit = Boolean(item);
  const products = useProductsList({ per_page: 100 });
  const units = useUnits();
  const createMutation = useCreateRfqItem(rfqId);
  const updateMutation = useUpdateRfqItem(rfqId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RfqItemSchema>({
    resolver: zodResolver(rfqItemSchema),
    defaultValues: { target_quantity: 1 },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      item
        ? {
            product_id: item.product?.id,
            custom_description: item.custom_description ?? "",
            target_quantity: item.target_quantity,
            target_unit_id: item.target_unit?.id,
            target_price: item.target_price ?? undefined,
            notes: item.notes ?? "",
          }
        : { target_quantity: 1 },
    );
  }, [open, item, reset]);

  function onSubmit(values: RfqItemSchema) {
    const payload = { ...values, custom_description: values.custom_description || undefined, notes: values.notes || undefined };
    if (isEdit && item) {
      updateMutation.mutate({ itemId: item.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier l'article" : "Nouvel article"} pending={isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.produitDuCatalogue")} htmlFor="product_id" span={2}>
                <Controller
                  control={control}
                  name="product_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : NONE} onValueChange={(value) => field.onChange(value === NONE ? undefined : Number(value))}>
                      <SelectTrigger id="product_id">
                        <SelectValue placeholder={translate("ph.aucunDescriptionLibre")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>{translate("t.aucunDescriptionLibre")}</SelectItem>
                        {(products.data?.data ?? []).map((product) => (
                          <SelectItem key={product.id} value={String(product.id)}>
                            {product.name} ({product.reference})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.descriptionLibre")} htmlFor="custom_description" error={errors.custom_description?.message} span={2}>
                <Textarea id="custom_description" {...register("custom_description")} rows={2} />
              </FormField>
              <FormField label={translate("field.quantiteCible")} htmlFor="target_quantity" required error={errors.target_quantity?.message}>
                <Input id="target_quantity" type="number" min={1} {...register("target_quantity")} />
              </FormField>
              <FormField label={translate("field.unite")} htmlFor="target_unit_id">
                <Controller
                  control={control}
                  name="target_unit_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : NONE} onValueChange={(value) => field.onChange(value === NONE ? undefined : Number(value))}>
                      <SelectTrigger id="target_unit_id">
                        <SelectValue placeholder={translate("ph.selectionner")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>{translate("t.aucune")}</SelectItem>
                        {(units.data ?? []).map((unit) => (
                          <SelectItem key={unit.id} value={String(unit.id)}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.prixCible")} htmlFor="target_price">
                <Input id="target_price" type="number" step="0.01" min={0} {...register("target_price")} />
              </FormField>
            </FormSection>
            <FormField label={translate("section.notes")} htmlFor="notes">
              <Textarea id="notes" {...register("notes")} rows={2} />
            </FormField>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
