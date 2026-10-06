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
import { supplierBankAccountSchema, type SupplierBankAccountSchema } from "../schemas/supplier-bank-account.schema";
import { useCreateSupplierBankAccount, useUpdateSupplierBankAccount } from "../hooks/use-supplier-bank-accounts";
import { useCurrencies } from "@/modules/reference-data/hooks/use-currencies";
import { PAYMENT_METHOD_LABELS } from "../badges";
import type { SupplierBankAccount } from "../types";
import { translate } from "@/i18n/translate";

export function BankAccountFormDialog({
  open,
  onOpenChange,
  supplierId,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: number;
  account?: SupplierBankAccount | null;
}) {
  const isEdit = Boolean(account);
  const currencies = useCurrencies();
  const createMutation = useCreateSupplierBankAccount(supplierId);
  const updateMutation = useUpdateSupplierBankAccount(supplierId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<SupplierBankAccountSchema>({
    resolver: zodResolver(supplierBankAccountSchema),
    defaultValues: { method: "BANK_TRANSFER_CNY", account_name: "", account_number: "", is_default: false, is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      account
        ? {
            method: account.method,
            account_name: account.account_name,
            account_number: account.account_number,
            bank_name: account.bank_name ?? "",
            swift_code: account.swift_code ?? "",
            currency_id: account.currency.id,
            is_default: account.is_default,
            is_active: account.is_active,
          }
        : { method: "BANK_TRANSFER_CNY", account_name: "", account_number: "", is_default: false, is_active: true },
    );
  }, [open, account, reset]);

  const isDefault = watch("is_default");
  const isActive = watch("is_active");

  function onSubmit(values: SupplierBankAccountSchema) {
    const payload = { ...values, bank_name: values.bank_name || undefined, swift_code: values.swift_code || undefined };
    if (isEdit && account) {
      updateMutation.mutate({ accountId: account.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier le compte" : "Nouveau compte / moyen de paiement"} pending={isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("ph.methode")} htmlFor="method">
                <Controller
                  control={control}
                  name="method"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="method">
                        <SelectValue />
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
              <FormField label={translate("field.nomDuTitulaire")} htmlFor="account_name" required error={errors.account_name?.message}>
                <Input id="account_name" {...register("account_name")} />
              </FormField>
              <FormField label={translate("field.numeroDeCompte")} htmlFor="account_number" required error={errors.account_number?.message}>
                <Input id="account_number" {...register("account_number")} />
              </FormField>
              <FormField label={translate("field.banque")} htmlFor="bank_name">
                <Input id="bank_name" {...register("bank_name")} />
              </FormField>
              <FormField label={translate("field.codeSwift")} htmlFor="swift_code">
                <Input id="swift_code" {...register("swift_code")} />
              </FormField>
            </FormSection>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <Label htmlFor="is_default">{translate("t.compteParDefaut")}</Label>
              <Switch id="is_default" checked={isDefault} onCheckedChange={(value) => setValue("is_default", value)} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <Label htmlFor="is_active">Compte actif</Label>
              <Switch id="is_active" checked={isActive} onCheckedChange={(value) => setValue("is_active", value)} />
            </div>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
