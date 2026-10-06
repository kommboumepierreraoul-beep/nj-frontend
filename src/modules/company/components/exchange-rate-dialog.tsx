"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { exchangeRateSchema, type ExchangeRateSchema } from "../schemas";
import { useCurrencyMutations } from "../hooks/use-company";
import type { AdminCurrency } from "../types";
import { translate } from "@/i18n/translate";

/** Ajoute un taux de change (vers XAF) daté — l'historique est en append seul, la conversion prend toujours le taux le plus récent ≤ date pertinente. */
export function ExchangeRateDialog({
  open,
  onOpenChange,
  currency,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: AdminCurrency | null;
}) {
  const { addRate } = useCurrencyMutations();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExchangeRateSchema>({
    resolver: zodResolver(exchangeRateSchema),
    defaultValues: { rate_to_xaf: 0, effective_date: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => {
    if (open) reset({ rate_to_xaf: 0, effective_date: new Date().toISOString().slice(0, 10) });
  }, [open, reset]);

  function onSubmit(values: ExchangeRateSchema) {
    if (!currency) return;
    addRate.mutate({ id: currency.id, payload: values }, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <DialogFormHeader
            title={`Nouveau taux — ${currency?.code ?? ""}`}
            subtitle={`Combien vaut 1 ${currency?.code ?? translate("t.unite")} en XAF à la date d'effet.`}
            pending={addRate.isPending}
          />
          <div className="space-y-5 px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.taux1UniteXXaf")} htmlFor="rate" required error={errors.rate_to_xaf?.message}>
                <Input id="rate" type="number" step="0.000001" min={0} {...register("rate_to_xaf")} placeholder="605" />
              </FormField>
              <FormField label={translate("field.dateDEffet")} htmlFor="rate-date" required error={errors.effective_date?.message}>
                <Input id="rate-date" type="date" {...register("effective_date")} />
              </FormField>
            </FormSection>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={addRate.isPending}>
              Enregistrer le taux
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
