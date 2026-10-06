"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { recordPriceSchema, type RecordPriceSchema } from "../schemas/record-price.schema";
import { useRecordVariantPrice } from "../hooks/use-variant-price-history";
import { useCurrencies } from "@/modules/reference-data/hooks/use-currencies";
import { PRICE_SOURCE_LABELS } from "../badges";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_produits.md § 4, onglet « Historique des prix » — lecture seule hors ajout. */
export function RecordPriceDialog({
  open,
  onOpenChange,
  productId,
  variantId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  variantId: number;
}) {
  const currencies = useCurrencies();
  const mutation = useRecordVariantPrice(productId, variantId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RecordPriceSchema>({
    resolver: zodResolver(recordPriceSchema),
    defaultValues: { price: 0, source: "MANUAL", effective_date: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => {
    if (open) reset({ price: 0, source: "MANUAL", effective_date: new Date().toISOString().slice(0, 10) });
  }, [open, reset]);

  function onSubmit(values: RecordPriceSchema) {
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={translate("form.head.nouveauReleveDePrix")} pending={mutation.isPending} />

          <div className="space-y-4 px-6 py-5">
          <FormField label={translate("field.fournisseurOptionnel")} htmlFor="supplier_id">
            <Input id="supplier_id" type="number" {...register("supplier_id")} placeholder={translate("ph.idFournisseurSiApplicable")} />
          </FormField>
          <FormField label={translate("section.prix")} htmlFor="price" required error={errors.price?.message}>
            <Input id="price" type="number" step="0.01" min={0} {...register("price")} />
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
          <FormField label={translate("field.source")} htmlFor="source">
            <Controller
              control={control}
              name="source"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRICE_SOURCE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label={translate("field.dateDEffet")} htmlFor="effective_date" required error={errors.effective_date?.message}>
            <Input id="effective_date" type="date" {...register("effective_date")} />
          </FormField>
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
