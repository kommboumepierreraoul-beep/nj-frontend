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
import { invoicePaymentSchema, type InvoicePaymentSchema } from "../schemas/invoice-payment.schema";
import { useRecordInvoicePayment } from "../hooks/use-invoice-mutations";
import { useCurrencies } from "@/modules/reference-data/hooks/use-currencies";
import { PAYMENT_METHOD_LABELS } from "@/modules/sales-orders/badges";
import type { Invoice } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_factures.md § 1.4 — même formulaire que « Enregistrer un
 * encaissement » (spec_pages_commandes.md), `invoice_id` fixé automatiquement
 * au document depuis lequel l'action est lancée, jamais visible ici.
 */
export function RecordInvoicePaymentDialog({
  open,
  onOpenChange,
  salesOrderId,
  invoice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesOrderId: number;
  invoice: Invoice | null;
}) {
  const currencies = useCurrencies();
  const mutation = useRecordInvoicePayment(salesOrderId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<InvoicePaymentSchema>({
    resolver: zodResolver(invoicePaymentSchema),
    defaultValues: { direction: "ENCAISSEMENT", paid_at: new Date().toISOString().slice(0, 16) },
  });

  useEffect(() => {
    if (open && invoice) {
      reset({ direction: "ENCAISSEMENT", currency_id: invoice.currency.id, paid_at: new Date().toISOString().slice(0, 16) });
    }
  }, [open, invoice, reset]);

  const direction = watch("direction");

  if (!invoice) return null;

  function onSubmit(values: InvoicePaymentSchema) {
    if (!invoice) return;
    const payload = { ...values, external_reference: values.external_reference || undefined, notes: values.notes || undefined };
    mutation.mutate({ invoiceId: invoice.id, payload }, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={`Paiement — ${invoice.invoice_number}`} pending={mutation.isPending} />
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.sensDuMouvement")} htmlFor="direction">
                <Controller
                  control={control}
                  name="direction"
                  render={({ field }) => (
                    <Select value={field.value ?? "ENCAISSEMENT"} onValueChange={field.onChange}>
                      <SelectTrigger id="direction">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENCAISSEMENT">{translate("t.encaissement")}</SelectItem>
                        <SelectItem value="REMBOURSEMENT">{translate("t.remboursement")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.montant")} htmlFor="amount" required error={errors.amount?.message}>
                <Input id="amount" type="number" step="0.01" min={0.01} {...register("amount")} />
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
              <FormField label={translate("field.methodeDePaiement")} htmlFor="payment_method" required error={errors.payment_method?.message}>
                <Controller
                  control={control}
                  name="payment_method"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="payment_method">
                        <SelectValue placeholder={translate("ph.selectionner")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.referenceExterne")} htmlFor="external_reference">
                <Input id="external_reference" {...register("external_reference")} />
              </FormField>
              <FormField label={translate("field.dateHeure")} htmlFor="paid_at" required error={errors.paid_at?.message}>
                <Input id="paid_at" type="datetime-local" {...register("paid_at")} />
              </FormField>
            </FormSection>
            <FormField label={translate("section.notes")} htmlFor="notes">
              <Textarea id="notes" {...register("notes")} rows={2} />
            </FormField>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {direction === "REMBOURSEMENT" ? "Enregistrer le remboursement" : "Enregistrer l'encaissement"}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
