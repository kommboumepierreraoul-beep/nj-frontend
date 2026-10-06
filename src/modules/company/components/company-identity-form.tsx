"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, ImageUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormSection } from "@/components/forms/form-section";
import { Skeleton } from "@/components/ui/skeleton";
import { companySettingsSchema, type CompanySettingsSchema } from "../schemas";
import { useCompanySettings, useRemoveCompanyLogo, useUpdateCompanySettings } from "../hooks/use-company";
import { translate } from "@/i18n/translate";

/**
 * Doc/design_system_maquette_complete.md § 5.10, domaine Entreprise —
 * « Informations reprises en en-tête de tous les documents PDF » + bloc
 * « Valeurs par défaut proforma comparative » (Doc/proforma_comparatif_addendum.md
 * § 4, repris automatiquement à l'émission, surchargeable par l'émetteur).
 */
export function CompanyIdentityForm() {
  const query = useCompanySettings();
  const updateMutation = useUpdateCompanySettings();
  const removeLogoMutation = useRemoveCompanyLogo();
  const fileRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanySettingsSchema>({ resolver: zodResolver(companySettingsSchema) });

  useEffect(() => {
    if (!query.data) return;
    const s = query.data;
    reset({
      legal_name: s.legal_name,
      tagline: s.tagline ?? "",
      address_line: s.address_line,
      representation_line: s.representation_line ?? "",
      phone: s.phone ?? "",
      whatsapp: s.whatsapp ?? "",
      email: s.email ?? "",
      website: s.website ?? "",
      default_proforma_validity_days: s.default_proforma_validity_days,
      default_tax_rate: s.default_tax_rate ?? 0,
      default_proforma_conditions: s.default_proforma_conditions ?? "",
      default_proforma_production_delay: s.default_proforma_production_delay ?? "",
      default_proforma_payment_terms: s.default_proforma_payment_terms ?? "",
      default_proforma_customs: s.default_proforma_customs ?? "",
    });
  }, [query.data, reset]);

  function pickLogo(file: File) {
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function onSubmit(values: CompanySettingsSchema) {
    const payload = {
      ...values,
      tagline: values.tagline || null,
      representation_line: values.representation_line || null,
      phone: values.phone || null,
      whatsapp: values.whatsapp || null,
      email: values.email || null,
      website: values.website || null,
      default_proforma_conditions: values.default_proforma_conditions || null,
      default_proforma_production_delay: values.default_proforma_production_delay || null,
      default_proforma_payment_terms: values.default_proforma_payment_terms || null,
      default_proforma_customs: values.default_proforma_customs || null,
    };
    updateMutation.mutate(
      { payload, logo },
      {
        onSuccess: () => {
          setLogo(null);
          setLogoPreview(null);
        },
      },
    );
  }

  if (query.isLoading) return <Skeleton className="h-96 w-full" />;
  if (query.isError || !query.data) {
    return <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">{translate("t.chargementDesParametresImpossible")}</p>;
  }

  const currentLogo = logoPreview ?? query.data.logo_url;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title={translate("section.identiteDeLEntreprise")} cols={2}>
        <FormField label={translate("field.raisonSociale")} htmlFor="legal_name" required error={errors.legal_name?.message} span={2}>
          <Input id="legal_name" {...register("legal_name")} />
        </FormField>
        <FormField label={translate("field.signatureAccroche")} htmlFor="tagline" span={2}>
          <Input id="tagline" {...register("tagline")} placeholder="Your presence in China." />
        </FormField>
        <FormField label={translate("field.adresse")} htmlFor="address_line" required error={errors.address_line?.message} span={2}>
          <Input id="address_line" {...register("address_line")} />
        </FormField>
        <FormField label={translate("field.ligneDeRepresentation")} htmlFor="representation_line" span={2}>
          <Input id="representation_line" {...register("representation_line")} placeholder={translate("t.phRepresentationCameroun")} />
        </FormField>
        <FormField label={translate("field.telephone")} htmlFor="phone">
          <Input id="phone" {...register("phone")} />
        </FormField>
        <FormField label={translate("field.whatsapp")} htmlFor="whatsapp">
          <Input id="whatsapp" {...register("whatsapp")} />
        </FormField>
        <FormField label={translate("field.email")} htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </FormField>
        <FormField label={translate("field.siteWeb")} htmlFor="website">
          <Input id="website" {...register("website")} />
        </FormField>
      </FormSection>

      <FormSection title={translate("section.logo")}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-surface-subtle">
            {currentLogo ? (
              <Image src={currentLogo} alt="Logo" width={56} height={56} className="h-full w-full object-contain" unoptimized />
            ) : (
              <Building2 className="h-6 w-6 text-text-quaternary" />
            )}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) pickLogo(file);
              event.target.value = "";
            }}
          />
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
            <ImageUp className="h-4 w-4" />
            {currentLogo ? "Changer le logo" : "Ajouter un logo"}
          </Button>
          {query.data.logo_url && !logoPreview ? (
            <Button type="button" variant="ghost" disabled={removeLogoMutation.isPending} onClick={() => removeLogoMutation.mutate()}>
              <Trash2 className="h-4 w-4" />{translate("action.remove")}</Button>
          ) : null}
          <p className="text-xs text-muted-foreground">{translate("t.leLogoEstEnregistreAuMomentOuVousCliquezSurEnregistrer")}</p>
        </div>
      </FormSection>

      <FormSection title={translate("section.valeursParDefautDeLaProformaComparative")} cols={1}>
        <p className="text-xs text-muted-foreground">
          Reprises automatiquement à l&apos;émission d&apos;une proforma comparative. L&apos;émetteur peut les ajuster pour un document donné sans modifier ces valeurs par défaut.
        </p>
        <FormField label={translate("field.validiteParDefautJours")} htmlFor="validity" error={errors.default_proforma_validity_days?.message}>
          <Input id="validity" type="number" min={1} max={365} {...register("default_proforma_validity_days")} className="max-w-[160px]" />
        </FormField>
        <FormField label={translate("field.tvaParDefaut")} htmlFor="default-tax-rate" error={errors.default_tax_rate?.message}>
          <Input
            id="default-tax-rate"
            type="number"
            step="0.01"
            min={0}
            max={100}
            {...register("default_tax_rate")}
            className="max-w-[160px]"
            placeholder={translate("ph.0AucuneTva")}
          />
        </FormField>
        <FormField label={translate("field.conditionsCommerciales")} htmlFor="pf-cond">
          <Textarea id="pf-cond" rows={2} {...register("default_proforma_conditions")} />
        </FormField>
        <FormField label={translate("field.delaiDeProduction")} htmlFor="pf-delay">
          <Textarea id="pf-delay" rows={2} {...register("default_proforma_production_delay")} />
        </FormField>
        <FormField label={translate("field.paiement")} htmlFor="pf-pay">
          <Textarea id="pf-pay" rows={2} {...register("default_proforma_payment_terms")} />
        </FormField>
        <FormField label={translate("field.douaneLivraison")} htmlFor="pf-customs">
          <Textarea id="pf-customs" rows={2} {...register("default_proforma_customs")} />
        </FormField>
      </FormSection>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={updateMutation.isPending || (!isDirty && !logo)}>{translate("action.save")}</Button>
      </div>
    </form>
  );
}
