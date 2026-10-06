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
import { purchaseOrderSchema, type PurchaseOrderSchema } from "../schemas/purchase-order.schema";
import { useCreatePurchaseOrder, useUpdatePurchaseOrder } from "../hooks/use-purchase-order-mutations";
import { useSuppliersList } from "@/modules/suppliers/hooks/use-suppliers-list";
import { useCurrencies } from "@/modules/reference-data/hooks/use-currencies";
import { PURCHASE_ORDER_STATUS_LABELS } from "../badges";
import type { PurchaseOrder } from "../types";
import { translate } from "@/i18n/translate";

export function PurchaseOrderFormDialog({
  open,
  onOpenChange,
  purchaseOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder?: PurchaseOrder | null;
}) {
  const isEdit = Boolean(purchaseOrder);
  const suppliers = useSuppliersList({ per_page: 100 });
  const currencies = useCurrencies();
  const createMutation = useCreatePurchaseOrder();
  const updateMutation = useUpdatePurchaseOrder(purchaseOrder?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PurchaseOrderSchema>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: { order_date: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      purchaseOrder
        ? {
            reference: purchaseOrder.reference,
            supplier_id: purchaseOrder.supplier.id,
            status: purchaseOrder.status,
            order_date: purchaseOrder.order_date,
            expected_delivery_date: purchaseOrder.expected_delivery_date ?? "",
            actual_delivery_date: purchaseOrder.actual_delivery_date ?? "",
            currency_id: purchaseOrder.currency.id,
            notes: purchaseOrder.notes ?? "",
          }
        : { order_date: new Date().toISOString().slice(0, 10) },
    );
  }, [open, purchaseOrder, reset]);

  function onSubmit(values: PurchaseOrderSchema) {
    const payload = {
      ...values,
      reference: values.reference || undefined,
      expected_delivery_date: values.expected_delivery_date || undefined,
      actual_delivery_date: values.actual_delivery_date || undefined,
      notes: values.notes || undefined,
    };
    if (isEdit && purchaseOrder) {
      updateMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier la commande" : "Nouvelle commande fournisseur"} pending={isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.reference")} htmlFor="reference" error={errors.reference?.message}>
                <Input id="reference" {...register("reference")} placeholder={translate("ph.generationAutomatiqueSiVide")} />
              </FormField>
              <FormField label={translate("ph.fournisseur")} htmlFor="supplier_id" required error={errors.supplier_id?.message}>
                <Controller
                  control={control}
                  name="supplier_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(Number(value))}>
                      <SelectTrigger id="supplier_id">
                        <SelectValue placeholder={translate("ph.selectionner")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(suppliers.data?.data ?? []).map((supplier) => (
                          <SelectItem key={supplier.id} value={String(supplier.id)}>
                            {supplier.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("ph.statut")} htmlFor="status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value ?? "DRAFT"} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PURCHASE_ORDER_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("ph.devise")} htmlFor="currency_id" required error={errors.currency_id?.message}>
                <Controller
                  control={control}
                  name="currency_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(Number(value))}>
                      <SelectTrigger id="currency_id">
                        <SelectValue placeholder={translate("ph.selectionner")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(currencies.data ?? []).map((currency) => (
                          <SelectItem key={currency.id} value={String(currency.id)}>
                            {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.dateDeCommande")} htmlFor="order_date" required error={errors.order_date?.message}>
                <Input id="order_date" type="date" {...register("order_date")} />
              </FormField>
              <FormField label={translate("field.livraisonPrevueLe")} htmlFor="expected_delivery_date" error={errors.expected_delivery_date?.message}>
                <Input id="expected_delivery_date" type="date" {...register("expected_delivery_date")} />
              </FormField>
              {isEdit ? (
                <FormField label={translate("field.livraisonEffectiveLe")} htmlFor="actual_delivery_date">
                  <Input id="actual_delivery_date" type="date" {...register("actual_delivery_date")} />
                </FormField>
              ) : null}
            </FormSection>
            <FormField label={translate("section.notes")} htmlFor="notes">
              <Textarea id="notes" {...register("notes")} rows={3} />
            </FormField>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : translate("t.creerLaCommande")}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
