"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { Combobox } from "@/components/ui/combobox";
import { supplierEvaluationSchema, type SupplierEvaluationSchema } from "../schemas/supplier-evaluation.schema";
import { useCreateSupplierEvaluation } from "../hooks/use-supplier-evaluations";
import { usePurchaseOrdersList } from "@/modules/purchase-orders/hooks/use-purchase-orders-list";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { translate } from "@/i18n/translate";

/** Notation 1 à 5 (Doc/spec_pages_fournisseurs.md § 2, onglet « Évaluations »). Composant local : usage limité à ce formulaire pour l'instant. */
function StarRatingField({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className="p-0.5">
          <Star className={cn("h-5 w-5", star <= value ? "fill-accent text-accent" : "text-border-2")} />
        </button>
      ))}
    </div>
  );
}

/** Chaque création recalcule `reliability_score` côté serveur — pas d'édition prévue par la spec, uniquement l'ajout. */
export function SupplierEvaluationFormDialog({ open, onOpenChange, supplierId }: { open: boolean; onOpenChange: (open: boolean) => void; supplierId: number }) {
  const createMutation = useCreateSupplierEvaluation(supplierId);
  const purchaseOrders = usePurchaseOrdersList({ supplier_id: supplierId, per_page: 100 });
  const orderOptions = (purchaseOrders.data?.data ?? []).map((order) => ({
    value: String(order.id),
    label: order.reference,
    description: [order.status, order.order_date ? formatDate(order.order_date) : null].filter(Boolean).join(" · "),
  }));

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SupplierEvaluationSchema>({
    resolver: zodResolver(supplierEvaluationSchema),
    defaultValues: {
      quality_score: 3,
      communication_score: 3,
      delay_respect_score: 3,
      price_competitiveness_score: 3,
      evaluated_at: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        quality_score: 3,
        communication_score: 3,
        delay_respect_score: 3,
        price_competitiveness_score: 3,
        evaluated_at: new Date().toISOString().slice(0, 10),
      });
    }
  }, [open, reset]);

  function onSubmit(values: SupplierEvaluationSchema) {
    createMutation.mutate({ ...values, comment: values.comment || undefined }, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={translate("form.head.nouvelleEvaluation")} pending={createMutation.isPending} />

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.commandeFournisseurLieeOptionnel")} htmlFor="purchase_order_id">
                <Controller
                  control={control}
                  name="purchase_order_id"
                  render={({ field }) => (
                    <Combobox
                      id="purchase_order_id"
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(next) => field.onChange(next ? Number(next) : undefined)}
                      options={orderOptions}
                      loading={purchaseOrders.isFetching}
                      placeholder={translate("ph.aucuneCommandeLiee")}
                      searchPlaceholder={translate("ph.referenceDeCommande")}
                      emptyText={translate("ph.aucuneCommandeFournisseurPourCeFournisseur")}
                    />
                  )}
                />
              </FormField>
              <FormField label={translate("field.dateDEvaluation")} htmlFor="evaluated_at" required error={errors.evaluated_at?.message}>
                <Input id="evaluated_at" type="date" {...register("evaluated_at")} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.notes1A5")} cols={2}>
              <FormField label={translate("field.qualite")} htmlFor="quality_score">
                <Controller control={control} name="quality_score" render={({ field }) => <StarRatingField value={field.value} onChange={field.onChange} />} />
              </FormField>
              <FormField label={translate("field.communication")} htmlFor="communication_score">
                <Controller control={control} name="communication_score" render={({ field }) => <StarRatingField value={field.value} onChange={field.onChange} />} />
              </FormField>
              <FormField label={translate("field.respectDesDelais")} htmlFor="delay_respect_score">
                <Controller control={control} name="delay_respect_score" render={({ field }) => <StarRatingField value={field.value} onChange={field.onChange} />} />
              </FormField>
              <FormField label={translate("field.competitivitePrix")} htmlFor="price_competitiveness_score">
                <Controller control={control} name="price_competitiveness_score" render={({ field }) => <StarRatingField value={field.value} onChange={field.onChange} />} />
              </FormField>
            </FormSection>

            <FormField label={translate("field.commentaire")} htmlFor="comment">
              <Textarea id="comment" {...register("comment")} rows={3} />
            </FormField>
          </div>

          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={createMutation.isPending}>{translate("action.save")}</Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
