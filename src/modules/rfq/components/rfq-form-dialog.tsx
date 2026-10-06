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
import { rfqSchema, type RfqSchema } from "../schemas/rfq.schema";
import { useCreateRfq, useUpdateRfq } from "../hooks/use-rfq-mutations";
import { RFQ_STATUS_LABELS } from "../badges";
import type { Rfq } from "../types";
import { translate } from "@/i18n/translate";

export function RfqFormDialog({ open, onOpenChange, rfq }: { open: boolean; onOpenChange: (open: boolean) => void; rfq?: Rfq | null }) {
  const isEdit = Boolean(rfq);
  const createMutation = useCreateRfq();
  const updateMutation = useUpdateRfq(rfq?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RfqSchema>({
    resolver: zodResolver(rfqSchema),
    defaultValues: { request_date: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      rfq
        ? {
            reference: rfq.reference,
            status: rfq.status,
            request_date: rfq.request_date,
            expected_response_date: rfq.expected_response_date ?? "",
            notes: rfq.notes ?? "",
          }
        : { request_date: new Date().toISOString().slice(0, 10) },
    );
  }, [open, rfq, reset]);

  function onSubmit(values: RfqSchema) {
    const payload = { ...values, reference: values.reference || undefined, expected_response_date: values.expected_response_date || undefined, notes: values.notes || undefined };
    if (isEdit && rfq) {
      updateMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier la RFQ" : "Nouvelle RFQ"} pending={isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.reference")} htmlFor="reference" error={errors.reference?.message}>
                <Input id="reference" {...register("reference")} placeholder={translate("ph.generationAutomatiqueSiVide")} />
              </FormField>
              <FormField label={translate("ph.statut")} htmlFor="status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value ?? "BROUILLON"} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RFQ_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.dateDeDemande")} htmlFor="request_date" required error={errors.request_date?.message}>
                <Input id="request_date" type="date" {...register("request_date")} />
              </FormField>
              <FormField label={translate("field.reponseAttendueLe")} htmlFor="expected_response_date" error={errors.expected_response_date?.message}>
                <Input id="expected_response_date" type="date" {...register("expected_response_date")} />
              </FormField>
            </FormSection>
            <FormField label={translate("section.notes")} htmlFor="notes">
              <Textarea id="notes" {...register("notes")} rows={3} />
            </FormField>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : translate("t.creer")}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
