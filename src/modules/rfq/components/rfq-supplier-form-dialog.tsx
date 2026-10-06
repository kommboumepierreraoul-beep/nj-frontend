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
import { rfqSupplierSchema, type RfqSupplierSchema } from "../schemas/rfq-supplier.schema";
import { useCreateRfqSupplier, useUpdateRfqSupplier } from "../hooks/use-rfq-suppliers";
import { useSuppliersList } from "@/modules/suppliers/hooks/use-suppliers-list";
import { RFQ_SUPPLIER_STATUS_LABELS } from "../badges";
import type { RfqSupplier } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_fournisseurs.md § 4 — "un même fournisseur ne peut être
 * sollicité qu'une seule fois" : `excludeSupplierIds` retire du sélecteur les
 * fournisseurs déjà présents dans la liste, uniquement à la création.
 */
export function RfqSupplierFormDialog({
  open,
  onOpenChange,
  rfqId,
  entry,
  excludeSupplierIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfqId: number;
  entry?: RfqSupplier | null;
  excludeSupplierIds: number[];
}) {
  const isEdit = Boolean(entry);
  const suppliers = useSuppliersList({ per_page: 100 });
  const createMutation = useCreateRfqSupplier(rfqId);
  const updateMutation = useUpdateRfqSupplier(rfqId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<RfqSupplierSchema>({
    resolver: zodResolver(rfqSupplierSchema),
    defaultValues: { status: "PENDING" },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      entry
        ? { supplier_id: entry.supplier.id, status: entry.status, sent_at: entry.sent_at ?? "", response_date: entry.response_date ?? "", notes: entry.notes ?? "" }
        : { status: "PENDING" },
    );
  }, [open, entry, reset]);

  const availableSuppliers = (suppliers.data?.data ?? []).filter((supplier) => !excludeSupplierIds.includes(supplier.id) || supplier.id === entry?.supplier.id);

  function onSubmit(values: RfqSupplierSchema) {
    const payload = { ...values, sent_at: values.sent_at || undefined, response_date: values.response_date || undefined, notes: values.notes || undefined };
    if (isEdit && entry) {
      updateMutation.mutate({ rfqSupplierId: entry.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier la sollicitation" : "Solliciter un fournisseur"} pending={isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("ph.fournisseur")} htmlFor="supplier_id" required span={2}>
                <Controller
                  control={control}
                  name="supplier_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(Number(value))} disabled={isEdit}>
                      <SelectTrigger id="supplier_id">
                        <SelectValue placeholder={translate("ph.selectionner")} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSuppliers.map((supplier) => (
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
                    <Select value={field.value ?? "PENDING"} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RFQ_SUPPLIER_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.dateDEnvoi")} htmlFor="sent_at">
                <Input id="sent_at" type="date" {...register("sent_at")} />
              </FormField>
              {isEdit ? (
                <FormField label={translate("field.dateDeReponse")} htmlFor="response_date">
                  <Input id="response_date" type="date" {...register("response_date")} />
                </FormField>
              ) : null}
            </FormSection>
            <FormField label={translate("section.notes")} htmlFor="notes">
              <Textarea id="notes" {...register("notes")} rows={2} />
            </FormField>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : "Solliciter"}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
