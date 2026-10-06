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
import { supplierSchema, type SupplierSchema } from "../schemas/supplier.schema";
import { useCreateSupplier, useUpdateSupplier } from "../hooks/use-supplier-mutations";
import { useCountries } from "@/modules/reference-data/hooks/use-countries";
import { countryFlagEmoji } from "@/lib/countries";
import { SUPPLIER_RELIABILITY_LABELS } from "../badges";
import type { Supplier } from "../types";
import { translate } from "@/i18n/translate";

const NONE = "__none__";

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
}) {
  const isEdit = Boolean(supplier);
  const countries = useCountries();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier(supplier?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<SupplierSchema>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { company_name: "", is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      supplier
        ? {
            company_name: supplier.company_name,
            legal_name: supplier.legal_name ?? "",
            contact_name: supplier.contact_name ?? "",
            phone: supplier.phone ?? "",
            whatsapp: supplier.whatsapp ?? "",
            wechat_id: supplier.wechat_id ?? "",
            alibaba_profile_url: supplier.alibaba_profile_url ?? "",
            email: supplier.email ?? "",
            website: supplier.website ?? "",
            province: supplier.province ?? "",
            city: supplier.city ?? "",
            address_line: supplier.address_line ?? "",
            country_id: supplier.country?.id,
            reliability: supplier.reliability,
            payment_terms: supplier.payment_terms ?? "",
            notes: supplier.notes ?? "",
            is_active: supplier.is_active,
          }
        : { company_name: "", is_active: true },
    );
  }, [open, supplier, reset]);

  const isActive = watch("is_active");

  function onSubmit(values: SupplierSchema) {
    const payload = {
      ...values,
      legal_name: values.legal_name || undefined,
      contact_name: values.contact_name || undefined,
      phone: values.phone || undefined,
      whatsapp: values.whatsapp || undefined,
      wechat_id: values.wechat_id || undefined,
      alibaba_profile_url: values.alibaba_profile_url || undefined,
      email: values.email || undefined,
      website: values.website || undefined,
      province: values.province || undefined,
      city: values.city || undefined,
      address_line: values.address_line || undefined,
      payment_terms: values.payment_terms || undefined,
      notes: values.notes || undefined,
    };
    if (isEdit && supplier) {
      updateMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[88vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier le fournisseur" : "Nouveau fournisseur"} pending={isPending} />

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <FormSection title={translate("section.identite")} cols={2}>
              <FormField label={translate("field.raisonSociale")} htmlFor="company_name" required error={errors.company_name?.message}>
                <Input id="company_name" {...register("company_name")} />
              </FormField>
              <FormField label={translate("field.denominationLegale")} htmlFor="legal_name">
                <Input id="legal_name" {...register("legal_name")} />
              </FormField>
              <FormField label={translate("field.nomDuContact")} htmlFor="contact_name" span={2}>
                <Input id="contact_name" {...register("contact_name")} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.coordonnees")} cols={2}>
              <FormField label={translate("field.telephone")} htmlFor="phone">
                <Input id="phone" {...register("phone")} />
              </FormField>
              <FormField label={translate("field.whatsapp")} htmlFor="whatsapp">
                <Input id="whatsapp" {...register("whatsapp")} />
              </FormField>
              <FormField label={translate("field.wechatId")} htmlFor="wechat_id">
                <Input id="wechat_id" {...register("wechat_id")} />
              </FormField>
              <FormField label={translate("field.profilAlibaba")} htmlFor="alibaba_profile_url">
                <Input id="alibaba_profile_url" {...register("alibaba_profile_url")} placeholder="https://…" />
              </FormField>
              <FormField label={translate("field.eMail")} htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" {...register("email")} />
              </FormField>
              <FormField label={translate("field.siteWeb")} htmlFor="website">
                <Input id="website" {...register("website")} placeholder="https://…" />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.localisation")} cols={2}>
              <FormField label={translate("field.province")} htmlFor="province">
                <Input id="province" {...register("province")} />
              </FormField>
              <FormField label={translate("field.ville")} htmlFor="city">
                <Input id="city" {...register("city")} />
              </FormField>
              <FormField label={translate("field.pays")} htmlFor="country_id">
                <Controller
                  control={control}
                  name="country_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : NONE} onValueChange={(value) => field.onChange(value === NONE ? undefined : Number(value))}>
                      <SelectTrigger id="country_id">
                        <SelectValue placeholder={translate("ph.selectionner")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>{translate("t.aucun")}</SelectItem>
                        {(countries.data ?? []).map((country) => (
                          <SelectItem key={country.id} value={String(country.id)}>
                            {countryFlagEmoji(country.iso_code)} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.adresse")} htmlFor="address_line">
                <Textarea id="address_line" {...register("address_line")} rows={2} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.evaluationConditions")} cols={2}>
              <FormField label={translate("ph.fiabilite")} htmlFor="reliability">
                <Controller
                  control={control}
                  name="reliability"
                  render={({ field }) => (
                    <Select value={field.value ?? "INCONNU"} onValueChange={field.onChange}>
                      <SelectTrigger id="reliability">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SUPPLIER_RELIABILITY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.conditionsDePaiement")} htmlFor="payment_terms">
                <Textarea id="payment_terms" {...register("payment_terms")} rows={2} />
              </FormField>
              <FormField label={translate("section.notes")} htmlFor="notes" span={2}>
                <Textarea id="notes" {...register("notes")} rows={2} />
              </FormField>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 sm:col-span-2">
                <Label htmlFor="is_active">Fournisseur actif</Label>
                <Switch id="is_active" checked={isActive} onCheckedChange={(value) => setValue("is_active", value)} />
              </div>
            </FormSection>
          </div>

          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : translate("t.creerLeFournisseur")}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
