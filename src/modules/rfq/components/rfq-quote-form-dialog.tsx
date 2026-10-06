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
import { rfqQuoteSchema, type RfqQuoteSchema } from "../schemas/rfq-quote.schema";
import { useCreateRfqQuote } from "../hooks/use-rfq-quotes";
import { useRfqItems } from "../hooks/use-rfq-items";
import { useCurrencies } from "@/modules/reference-data/hooks/use-currencies";
import { translate } from "@/i18n/translate";

export function RfqQuoteFormDialog({
  open,
  onOpenChange,
  rfqId,
  rfqSupplierId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfqId: number;
  rfqSupplierId: number;
}) {
  const items = useRfqItems(rfqId);
  const currencies = useCurrencies();
  const createMutation = useCreateRfqQuote(rfqSupplierId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RfqQuoteSchema>({
    resolver: zodResolver(rfqQuoteSchema),
    defaultValues: { quoted_unit_price: 0, quoted_at: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => {
    if (open) reset({ quoted_unit_price: 0, quoted_at: new Date().toISOString().slice(0, 10) });
  }, [open, reset]);

  function onSubmit(values: RfqQuoteSchema) {
    createMutation.mutate({ ...values, notes: values.notes || undefined }, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={translate("form.head.nouveauDevis")} pending={createMutation.isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.article")} htmlFor="rfq_item_id" required error={errors.rfq_item_id?.message} span={2}>
                <Controller
                  control={control}
                  name="rfq_item_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(Number(value))}>
                      <SelectTrigger id="rfq_item_id">
                        <SelectValue placeholder={translate("ph.selectionner")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(items.data ?? []).map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.product?.name ?? item.custom_description ?? translate("t.articleSansLibelle")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.prixUnitaireCote")} htmlFor="quoted_unit_price" required error={errors.quoted_unit_price?.message}>
                <Input id="quoted_unit_price" type="number" step="0.01" min={0} {...register("quoted_unit_price")} />
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
              <FormField label={translate("field.moqCote")} htmlFor="quoted_moq">
                <Input id="quoted_moq" type="number" min={1} {...register("quoted_moq")} />
              </FormField>
              <FormField label={translate("field.delaiCoteJours")} htmlFor="quoted_lead_time_days">
                <Input id="quoted_lead_time_days" type="number" min={0} {...register("quoted_lead_time_days")} />
              </FormField>
              <FormField label={translate("field.dateDeCotation")} htmlFor="quoted_at" required error={errors.quoted_at?.message}>
                <Input id="quoted_at" type="date" {...register("quoted_at")} />
              </FormField>
            </FormSection>
            <FormField label={translate("section.notes")} htmlFor="notes">
              <Textarea id="notes" {...register("notes")} rows={2} />
            </FormField>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={createMutation.isPending}>{translate("action.add")}</Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
