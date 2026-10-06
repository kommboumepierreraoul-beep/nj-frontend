"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormSection } from "@/components/forms/form-section";
import { HelpButton } from "@/components/forms/help-button";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { ClientPickerField } from "@/modules/clients/components/client-picker-field";
import { useCurrencies } from "@/modules/reference-data/hooks/use-currencies";
import { useCompanySettings } from "@/modules/company/hooks/use-company";
import { salesOrderSchema, type SalesOrderSchema } from "../schemas/sales-order.schema";
import { useCreateSalesOrder } from "../hooks/use-sales-order-mutations";
import { SalesOrderItemRow } from "./sales-order-item-row";
import { SALES_ORDER_TYPE_LABELS, TRANSPORT_MODE_LABELS } from "../badges";
import type { SalesOrderItemType, SalesOrderType } from "../types";
import { translate } from "@/i18n/translate";

const helpEntries = () => [
  {
    field: "Type de commande",
    help: translate("t.piloteLaSectionLignesProduitUnique3ChoixProposeJus"),
  },
  { field: "Mode de facturation", help: translate("t.surchargePonctuelleDuModeParDefautDuClientPourCett") },
  { field: translate("field.validiteJours"), help: translate("t.remplaceLeDefautDuClientOu7JoursSiNonRenseignePour") },
  { field: "Commission", help: translate("t.calculeeEtFigeeAutomatiquementALaCreationSelonLeBa") },
];

function itemTypeForOrderType(type: SalesOrderType): SalesOrderItemType {
  return type === "PRESTATION_SERVICE" ? "SERVICE" : "PRODUIT";
}

function blankItem(type: SalesOrderType) {
  return {
    item_type: itemTypeForOrderType(type),
    quantity: 1,
    unit_price: 0,
    is_selected: true,
  };
}

/**
 * Doc/spec_pages_commandes.md § 1 « Formulaire Nouvelle commande » — commande
 * et lignes créées en une seule fois (création imbriquée). Pas de formulaire
 * d'édition ici : après création, seuls les champs logistiques restent
 * modifiables (voir `SalesOrderEditDialog`), les lignes se gèrent depuis
 * l'onglet « Lignes » de la fiche commande.
 */
export function SalesOrderFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const currencies = useCurrencies();
  const companySettings = useCompanySettings();
  const defaultTaxRate = companySettings.data?.default_tax_rate ?? 0;
  const createMutation = useCreateSalesOrder();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<SalesOrderSchema>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      type: "MULTI_PRODUITS",
      order_date: new Date().toISOString().slice(0, 10),
      items: [blankItem("MULTI_PRODUITS")],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: "items" });
  const orderType = watch("type");

  useEffect(() => {
    if (!open) return;
    reset({
      type: "MULTI_PRODUITS",
      order_date: new Date().toISOString().slice(0, 10),
      tax_rate: defaultTaxRate,
      items: [blankItem("MULTI_PRODUITS")],
    });
  }, [open, reset, defaultTaxRate]);

  function handleTypeChange(nextType: SalesOrderType) {
    setValue("type", nextType);
    replace([blankItem(nextType)]);
  }

  function onSubmit(values: SalesOrderSchema) {
    const payload = {
      ...values,
      carrier_name: values.carrier_name || undefined,
      tracking_number: values.tracking_number || undefined,
      notes: values.notes || undefined,
      internal_notes: values.internal_notes || undefined,
      items: values.items.map((item) => ({
        ...item,
        label: item.label || undefined,
        description: item.description || undefined,
        notes: item.notes || undefined,
      })),
    };
    createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[90vh] flex-col">
          <DialogFormHeader title={translate("form.head.nouvelleCommandeClient")} actions={<HelpButton entries={helpEntries()} />} pending={createMutation.isPending} />

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <FormSection title={translate("section.commande")} cols={2}>
              <FormField label={translate("ph.client")} required error={errors.client_id?.message}>
                <Controller control={control} name="client_id" render={({ field }) => <ClientPickerField value={field.value} onChange={field.onChange} />} />
              </FormField>
              <FormField label={translate("ph.typeDeCommande")} htmlFor="type" required>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(value) => handleTypeChange(value as SalesOrderType)}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SALES_ORDER_TYPE_LABELS).map(([value, label]) => (
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
              <FormField label={translate("field.dateDeCommande")} htmlFor="order_date" required error={errors.order_date?.message}>
                <Input id="order_date" type="date" {...register("order_date")} />
              </FormField>
              <FormField label={translate("field.remise")} htmlFor="discount_amount">
                <Input id="discount_amount" type="number" step="0.01" min={0} {...register("discount_amount")} placeholder="0" />
              </FormField>
              <FormField label={translate("field.tva")} htmlFor="tax_rate">
                <Input id="tax_rate" type="number" step="0.01" min={0} max={100} {...register("tax_rate")} placeholder={translate("ph.0AucuneTva")} />
              </FormField>
              <FormField label={translate("field.validiteJours")} htmlFor="validity_days">
                <Input id="validity_days" type="number" min={1} {...register("validity_days")} placeholder={translate("ph.defautDuClientOu7")} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.logistique")} cols={2}>
              <FormField label={translate("field.modeDeTransport")} htmlFor="transport_mode">
                <Controller
                  control={control}
                  name="transport_mode"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="transport_mode">
                        <SelectValue placeholder={translate("ph.nonRenseigne")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TRANSPORT_MODE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.transporteur")} htmlFor="carrier_name">
                <Input id="carrier_name" {...register("carrier_name")} />
              </FormField>
              <FormField label={translate("field.nDeSuivi")} htmlFor="tracking_number">
                <Input id="tracking_number" {...register("tracking_number")} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.lignes")}>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <SalesOrderItemRow
                    key={field.id}
                    index={index}
                    control={control}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    errors={errors.items}
                    orderType={orderType}
                    onRemove={() => remove(index)}
                  />
                ))}
                {errors.items?.message ? <p className="text-xs text-destructive">{errors.items.message}</p> : null}
                <Button type="button" variant="outline" size="sm" onClick={() => append(blankItem(orderType))}>
                  <Plus className="h-4 w-4" />
                  Ajouter une ligne
                </Button>
              </div>
            </FormSection>

            <FormSection title={translate("section.notes")}>
              <FormField label={translate("field.notesVisiblesSurLeProforma")} htmlFor="notes">
                <Textarea id="notes" {...register("notes")} rows={2} />
              </FormField>
              <FormField label={translate("section.notesInternes")} htmlFor="internal_notes">
                <Textarea id="internal_notes" {...register("internal_notes")} rows={2} />
              </FormField>
            </FormSection>
          </div>

          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Créer la commande
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
