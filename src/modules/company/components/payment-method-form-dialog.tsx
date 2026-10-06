"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { PAYMENT_METHOD_TYPES, paymentMethodSchema, type PaymentMethodSchema } from "../schemas";
import { useCompanyPaymentMethodMutations } from "../hooks/use-company";
import type { CompanyPaymentMethod } from "../types";
import { translate } from "@/i18n/translate";

const TYPE_LABELS: Record<(typeof PAYMENT_METHOD_TYPES)[number], string> = {
  MOBILE_MONEY: "Mobile Money",
  BANK_TRANSFER: "Virement bancaire",
  CASH: "Espèces",
  OTHER: "Autre",
};

/** Doc/proforma_generation_addendum.md § 2.2 — coordonnées imprimées au bas des proformas/factures. */
export function PaymentMethodFormDialog({
  open,
  onOpenChange,
  method,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method?: CompanyPaymentMethod | null;
}) {
  const isEdit = Boolean(method);
  const { create, update } = useCompanyPaymentMethodMutations();
  const isPending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentMethodSchema>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { label: "", method_type: "MOBILE_MONEY", is_active: true, show_on_documents: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      method
        ? {
            label: method.label,
            method_type: method.method_type,
            account_number: method.account_number ?? "",
            account_holder: method.account_holder ?? "",
            iban: method.iban ?? "",
            swift: method.swift ?? "",
            instructions: method.instructions ?? "",
            is_active: method.is_active,
            show_on_documents: method.show_on_documents,
            sort_order: method.sort_order,
          }
        : { label: "", method_type: "MOBILE_MONEY", is_active: true, show_on_documents: true },
    );
  }, [open, method, reset]);

  const isActive = watch("is_active");
  const showOnDocuments = watch("show_on_documents");

  function onSubmit(values: PaymentMethodSchema) {
    const payload = {
      ...values,
      account_number: values.account_number || undefined,
      account_holder: values.account_holder || undefined,
      iban: values.iban || undefined,
      swift: values.swift || undefined,
      instructions: values.instructions || undefined,
    };
    if (isEdit && method) {
      update.mutate({ id: method.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[88vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier le moyen de paiement" : "Nouveau moyen de paiement"} pending={isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection title={translate("section.identification")} cols={2}>
              <FormField label={translate("field.libelle")} htmlFor="pm-label" required error={errors.label?.message} span={2}>
                <Input id="pm-label" {...register("label")} placeholder={translate("ph.exVirementBancaireUba")} />
              </FormField>
              <FormField label={translate("ph.type")} htmlFor="pm-type" required>
                <Controller
                  control={control}
                  name="method_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="pm-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHOD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.ordreDAffichage")} htmlFor="pm-sort">
                <Input id="pm-sort" type="number" {...register("sort_order")} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.coordonnees")} cols={2}>
              <FormField label={translate("field.numeroDeCompte")} htmlFor="pm-account">
                <Input id="pm-account" {...register("account_number")} />
              </FormField>
              <FormField label={translate("field.titulaire")} htmlFor="pm-holder">
                <Input id="pm-holder" {...register("account_holder")} />
              </FormField>
              <FormField label={translate("field.iban")} htmlFor="pm-iban">
                <Input id="pm-iban" {...register("iban")} />
              </FormField>
              <FormField label={translate("field.swiftBic")} htmlFor="pm-swift">
                <Input id="pm-swift" {...register("swift")} />
              </FormField>
              <FormField label={translate("field.instructions")} htmlFor="pm-instructions" span={2}>
                <Textarea id="pm-instructions" rows={2} {...register("instructions")} placeholder={translate("ph.exCoordonneesCommuniqueesApresConfirmationDuProforma")} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.affichage")} cols={2}>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <Label htmlFor="pm-active">{translate("t.actif")}</Label>
                <Switch id="pm-active" checked={isActive} onCheckedChange={(v) => setValue("is_active", v)} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <Label htmlFor="pm-show">{translate("t.afficherSurLesDocuments")}</Label>
                <Switch id="pm-show" checked={showOnDocuments} onCheckedChange={(v) => setValue("show_on_documents", v)} />
              </div>
            </FormSection>
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
