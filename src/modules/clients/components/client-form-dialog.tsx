"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormSection } from "@/components/forms/form-section";
import { HelpButton } from "@/components/forms/help-button";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { clientSchema, type ClientSchema } from "../schemas/client.schema";
import { useCreateClient, useUpdateClient } from "../hooks/use-client-mutations";
import { useClientCategories } from "../hooks/use-client-categories";
import { useCountries } from "@/modules/reference-data/hooks/use-countries";
import { useCurrencies } from "@/modules/reference-data/hooks/use-currencies";
import { countryFlagEmoji } from "@/lib/countries";
import { CLIENT_STATUS_LABELS, CLIENT_TYPE_LABELS, CLIENT_LANGUAGE_LABELS, BILLING_MODE_LABELS } from "../badges";
import { ClientPickerField } from "./client-picker-field";
import type { Client } from "../types";
import { translate } from "@/i18n/translate";

const helpEntries = () => [
  { field: "Nom complet", help: "Nom de la personne, ou raison sociale si le client est une entreprise. Requis." },
  { field: translate("t.categorie"), help: "Provenance du client (Ecom-Rich, Direct…). Facultative, peut rester vide." },
  { field: translate("t.devisePreferee"), help: translate("t.deviseUtiliseeParDefautPourCeClientSiNonRenseignee") },
  { field: translate("field.recommandePar"), help: translate("t.clientParrainPourLaCategorieRecommandationRecherch") },
  { field: "Mode de facturation", help: translate("t.commissionVisiblePrixEtCommissionSeparesSurLePdfPr") },
  { field: translate("t.commissionDerogatoire"), help: translate("t.activeUnTauxOuForfaitDeCommissionPropreACeClientDi") },
  { field: translate("field.validiteProformaJours"), help: translate("t.remplaceLeDefautDe7JoursSiRenseigne") },
];

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}) {
  const isEdit = Boolean(client);
  const categories = useClientCategories();
  const countries = useCountries();
  const currencies = useCurrencies();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient(client?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ClientSchema>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      client_type: "PARTICULIER",
      full_name: "",
      preferred_language: "FR",
      billing_mode: "COMMISSION_VISIBLE",
      has_custom_commission: false,
      status: "ACTIF",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      client
        ? {
            client_type: client.client_type,
            full_name: client.full_name,
            legal_name: client.legal_name ?? "",
            category_id: client.category?.id,
            country_id: client.country?.id,
            city: client.city ?? "",
            region: client.region ?? "",
            address_line: client.address_line ?? "",
            preferred_currency_id: client.preferred_currency?.id,
            preferred_language: client.preferred_language,
            referred_by_client_id: client.referred_by_client?.id,
            billing_mode: client.billing_mode,
            has_custom_commission: client.has_custom_commission,
            custom_commission_rate: client.custom_commission_rate ?? undefined,
            proforma_validity_days: client.proforma_validity_days ?? undefined,
            status: client.status,
            internal_notes: client.internal_notes ?? "",
          }
        : {
            client_type: "PARTICULIER",
            full_name: "",
            preferred_language: "FR",
            billing_mode: "COMMISSION_VISIBLE",
            has_custom_commission: false,
            status: "ACTIF",
          },
    );
  }, [open, client, reset]);

  const hasCustomCommission = watch("has_custom_commission");
  const clientType = watch("client_type");

  function onSubmit(values: ClientSchema) {
    const payload = {
      ...values,
      legal_name: values.legal_name || undefined,
      city: values.city || undefined,
      region: values.region || undefined,
      address_line: values.address_line || undefined,
      internal_notes: values.internal_notes || undefined,
      custom_commission_rate: values.has_custom_commission ? values.custom_commission_rate : undefined,
    };
    if (isEdit && client) {
      updateMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[88vh] flex-col">
          <DialogFormHeader
            title={isEdit ? "Modifier le client" : "Nouveau client"}
            actions={<HelpButton entries={helpEntries()} />}
            pending={isPending}
          />

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <FormSection title={translate("section.identite")} cols={2}>
              <FormField label={translate("field.typeDeClient")} htmlFor="client_type">
                <Controller
                  control={control}
                  name="client_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="client_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={clientType === "ENTREPRISE" ? "Raison sociale" : "Nom complet"} htmlFor="full_name" required error={errors.full_name?.message}>
                <Input id="full_name" {...register("full_name")} />
              </FormField>
              <FormField label={translate("field.denominationLegale")} htmlFor="legal_name" span={2}>
                <Input id="legal_name" {...register("legal_name")} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.categorieProvenance")} cols={2}>
              <FormField label={translate("field.categorie")} htmlFor="category_id">
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}>
                      <SelectTrigger id="category_id">
                        <SelectValue placeholder={translate("ph.aucune")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories.data ?? []).map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.localisation")} cols={2}>
              <FormField label={translate("field.pays")} htmlFor="country_id">
                <Controller
                  control={control}
                  name="country_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}>
                      <SelectTrigger id="country_id">
                        <SelectValue placeholder={translate("ph.selectionner")} />
                      </SelectTrigger>
                      <SelectContent>
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
              <FormField label={translate("field.ville")} htmlFor="city">
                <Input id="city" {...register("city")} />
              </FormField>
              <FormField label={translate("field.region")} htmlFor="region">
                <Input id="region" {...register("region")} />
              </FormField>
              <FormField label={translate("field.adresse")} htmlFor="address_line" span={2}>
                <Textarea id="address_line" {...register("address_line")} rows={2} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.preferences")} cols={2}>
              <FormField label={translate("field.devisePreferee")} htmlFor="preferred_currency_id">
                <Controller
                  control={control}
                  name="preferred_currency_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}>
                      <SelectTrigger id="preferred_currency_id">
                        <SelectValue placeholder={translate("ph.deviseParDefaut")} />
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
              <FormField label={translate("field.languePreferee")} htmlFor="preferred_language">
                <Controller
                  control={control}
                  name="preferred_language"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="preferred_language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CLIENT_LANGUAGE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.recommandePar")} htmlFor="referred_by_client_id" span={2}>
                <Controller
                  control={control}
                  name="referred_by_client_id"
                  render={({ field }) => <ClientPickerField value={field.value} onChange={field.onChange} excludeId={client?.id} />}
                />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.facturationCommission")} cols={2}>
              <FormField label={translate("field.modeDeFacturation")} htmlFor="billing_mode">
                <Controller
                  control={control}
                  name="billing_mode"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="billing_mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BILLING_MODE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.validiteProformaJours")} htmlFor="proforma_validity_days" error={errors.proforma_validity_days?.message}>
                <Input id="proforma_validity_days" type="number" min={1} {...register("proforma_validity_days")} placeholder="7" />
              </FormField>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 sm:col-span-2">
                <Label htmlFor="has_custom_commission">{translate("t.commissionDerogatoire")}</Label>
                <Switch id="has_custom_commission" checked={hasCustomCommission} onCheckedChange={(value) => setValue("has_custom_commission", value)} />
              </div>
              {hasCustomCommission ? (
                <FormField label={translate("field.tauxForfaitDerogatoire")} htmlFor="custom_commission_rate" required error={errors.custom_commission_rate?.message} span={2}>
                  <Input id="custom_commission_rate" type="number" step="0.01" {...register("custom_commission_rate")} disabled={isEdit} />
                </FormField>
              ) : null}
            </FormSection>

            <FormSection title={translate("ph.statut")} cols={2}>
              <FormField label={translate("ph.statut")} htmlFor="status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.notesInternes")}>
              <FormField label={translate("field.notesJamaisVisiblesDuClient")} htmlFor="internal_notes">
                <Textarea id="internal_notes" {...register("internal_notes")} rows={3} />
              </FormField>
            </FormSection>
          </div>

          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : translate("t.creerLeClient")}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
