"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { currencySchema, type CurrencySchema } from "../schemas";
import { useCurrencyMutations } from "../hooks/use-company";
import type { AdminCurrency } from "../types";
import { translate } from "@/i18n/translate";

export function CurrencyFormDialog({
  open,
  onOpenChange,
  currency,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency?: AdminCurrency | null;
}) {
  const isEdit = Boolean(currency);
  const { create, update } = useCurrencyMutations();
  const isPending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CurrencySchema>({
    resolver: zodResolver(currencySchema),
    defaultValues: { code: "", name: "", symbol: "", is_default: false, is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      currency
        ? { code: currency.code, name: currency.name, symbol: currency.symbol ?? "", is_default: currency.is_default, is_active: currency.is_active }
        : { code: "", name: "", symbol: "", is_default: false, is_active: true },
    );
  }, [open, currency, reset]);

  const isDefault = watch("is_default");
  const isActive = watch("is_active");

  function onSubmit(values: CurrencySchema) {
    const payload = { ...values, symbol: values.symbol || undefined };
    if (isEdit && currency) {
      update.mutate({ id: currency.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <DialogFormHeader
            title={isEdit ? "Modifier la devise" : "Nouvelle devise"}
            subtitle={translate("t.leCodeIso3LettresPivot")}
            pending={isPending}
          />
          <div className="space-y-5 px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.codeIso")} htmlFor="cur-code" required error={errors.code?.message}>
                <Input id="cur-code" maxLength={3} {...register("code")} placeholder="USD" className="uppercase" disabled={isEdit && currency?.code === "XAF"} />
              </FormField>
              <FormField label={translate("field.symbole")} htmlFor="cur-symbol">
                <Input id="cur-symbol" {...register("symbol")} placeholder="$" />
              </FormField>
              <FormField label={translate("field.nom")} htmlFor="cur-name" required error={errors.name?.message} span={2}>
                <Input id="cur-name" {...register("name")} placeholder={translate("t.phDollarAmericain")} />
              </FormField>
            </FormSection>
            <FormSection cols={2}>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <Label htmlFor="cur-default">{translate("t.deviseParDefaut")}</Label>
                <Switch id="cur-default" checked={isDefault} onCheckedChange={(v) => setValue("is_default", v)} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <Label htmlFor="cur-active">{translate("t.active")}</Label>
                <Switch id="cur-active" checked={isActive} onCheckedChange={(v) => setValue("is_active", v)} />
              </div>
            </FormSection>
            <p className="text-xs text-muted-foreground">
              Définir une devise par défaut retire automatiquement ce statut à l&apos;ancienne. Une devise déjà utilisée (commandes, factures, prix fournisseurs) ne peut pas être supprimée — désactivez-la.
            </p>
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
