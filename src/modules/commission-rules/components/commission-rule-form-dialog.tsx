"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { commissionRuleSchema, type CommissionRuleSchema } from "../schemas/commission-rule.schema";
import { useCreateCommissionRule, useUpdateCommissionRule } from "../hooks/use-commission-rule-mutations";
import { useCurrencies } from "@/modules/reference-data/hooks/use-currencies";
import { COMMISSION_TYPE_LABELS } from "@/modules/sales-orders/badges";
import type { CommissionRule } from "../types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_commandes.md § 3 « Formulaire Palier de commission ». Suppression non bloquée par l'API même si des commandes l'ont utilisé — recommandé de désactiver plutôt que supprimer, voir la page appelante. */
export function CommissionRuleFormDialog({ open, onOpenChange, rule }: { open: boolean; onOpenChange: (open: boolean) => void; rule?: CommissionRule | null }) {
  const isEdit = Boolean(rule);
  const currencies = useCurrencies();
  const createMutation = useCreateCommissionRule();
  const updateMutation = useUpdateCommissionRule(rule?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CommissionRuleSchema>({
    resolver: zodResolver(commissionRuleSchema),
    defaultValues: { commission_type: "POURCENTAGE", is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      rule
        ? {
            label: rule.label,
            min_amount: rule.min_amount,
            max_amount: rule.max_amount ?? undefined,
            commission_type: rule.commission_type,
            rate_or_amount: rule.rate_or_amount,
            currency_id: rule.currency?.id,
            is_active: rule.is_active,
            sort_order: rule.sort_order,
          }
        : { commission_type: "POURCENTAGE", is_active: true },
    );
  }, [open, rule, reset]);

  const isActive = watch("is_active");

  function onSubmit(values: CommissionRuleSchema) {
    if (isEdit && rule) {
      updateMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier le palier" : "Nouveau palier"} pending={isPending} />
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <FormField label={translate("field.libelle")} htmlFor="label" required error={errors.label?.message}>
              <Input id="label" {...register("label")} placeholder={translate("ph.exTauxStandard100000Fcfa")} />
            </FormField>
            <FormSection cols={2}>
              <FormField label={translate("field.montantMinimum")} htmlFor="min_amount" required error={errors.min_amount?.message}>
                <Input id="min_amount" type="number" step="0.01" min={0} {...register("min_amount")} />
              </FormField>
              <FormField label={translate("field.montantMaximum")} htmlFor="max_amount" error={errors.max_amount?.message}>
                <Input id="max_amount" type="number" step="0.01" min={0} {...register("max_amount")} placeholder={translate("ph.illimiteSiVide")} />
              </FormField>
              <FormField label={translate("ph.type")} htmlFor="commission_type">
                <Controller
                  control={control}
                  name="commission_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="commission_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COMMISSION_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.tauxOuMontantFixe")} htmlFor="rate_or_amount" required error={errors.rate_or_amount?.message}>
                <Input id="rate_or_amount" type="number" step="0.01" min={0} {...register("rate_or_amount")} />
              </FormField>
              <FormField label={translate("ph.devise")} htmlFor="currency_id">
                <Controller
                  control={control}
                  name="currency_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}>
                      <SelectTrigger id="currency_id">
                        <SelectValue placeholder={translate("ph.nonRenseignee")} />
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
              <FormField label={translate("field.ordreDEvaluation")} htmlFor="sort_order">
                <Input id="sort_order" type="number" {...register("sort_order")} />
              </FormField>
            </FormSection>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <Label htmlFor="is_active">Palier actif</Label>
              <Switch id="is_active" checked={isActive ?? true} onCheckedChange={(value) => setValue("is_active", value)} />
            </div>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : translate("t.creerLePalier")}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
