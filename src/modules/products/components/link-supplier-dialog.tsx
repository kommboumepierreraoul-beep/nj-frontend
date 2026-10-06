"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { FormField, FormSection } from "@/components/forms/form-section";
import { HelpButton } from "@/components/forms/help-button";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { linkSupplierSchema, type LinkSupplierSchema } from "../schemas/link-supplier.schema";
import { useLinkVariantSupplier, useUpdateVariantSupplierLink } from "../hooks/use-variant-suppliers";
import { useCurrencies } from "@/modules/reference-data/hooks/use-currencies";
import { useSuppliersList } from "@/modules/suppliers/hooks/use-suppliers-list";
import type { VariantSupplierLink } from "../types";
import { translate } from "@/i18n/translate";

const helpEntries = () => [
  { field: translate("field.fournisseur"), help: translate("t.linkSupplierHelp") },
  { field: translate("t.prefere"), help: translate("t.activerBasculeAutomatiquementLesAutresLiensFournis") },
];

export function LinkSupplierDialog({
  open,
  onOpenChange,
  productId,
  variantId,
  link,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  variantId: number;
  link?: VariantSupplierLink | null;
}) {
  const isEdit = Boolean(link);
  const currencies = useCurrencies();
  const [supplierSearch, setSupplierSearch] = useState("");
  const suppliers = useSuppliersList({ search: supplierSearch || undefined, per_page: 20 });
  const supplierOptions = useMemo(() => {
    const options = (suppliers.data?.data ?? []).map((supplier) => ({
      value: String(supplier.id),
      label: supplier.company_name,
      description: supplier.city || undefined,
    }));
    // Sur édition, garder le fournisseur lié affiché même hors résultats de recherche.
    if (link && !options.some((option) => option.value === String(link.supplier.id))) {
      options.unshift({ value: String(link.supplier.id), label: link.supplier.name, description: undefined });
    }
    return options;
  }, [suppliers.data, link]);
  const linkMutation = useLinkVariantSupplier(productId, variantId);
  const updateMutation = useUpdateVariantSupplierLink(productId, variantId);
  const isPending = linkMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<LinkSupplierSchema>({
    resolver: zodResolver(linkSupplierSchema),
    defaultValues: { unit_price: 0, is_preferred: false },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      link
        ? {
            supplier_id: link.supplier.id,
            supplier_sku: link.supplier_sku ?? "",
            unit_price: link.unit_price,
            currency_id: link.currency.id,
            moq: link.moq ?? undefined,
            lead_time_days: link.lead_time_days ?? undefined,
            is_preferred: link.is_preferred,
            last_quoted_at: link.last_quoted_at ?? "",
            notes: link.notes ?? "",
          }
        : { unit_price: 0, is_preferred: false },
    );
  }, [open, link, reset]);

  const isPreferred = watch("is_preferred");

  function onSubmit(values: LinkSupplierSchema) {
    const payload = { ...values, supplier_sku: values.supplier_sku || undefined, last_quoted_at: values.last_quoted_at || undefined, notes: values.notes || undefined };
    if (isEdit && link) {
      updateMutation.mutate({ linkId: link.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      linkMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader
            title={isEdit ? "Modifier la liaison" : "Lier un fournisseur"}
            actions={<HelpButton entries={helpEntries()} />}
            pending={isPending}
          />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.fournisseur")} htmlFor="supplier_id" required error={errors.supplier_id?.message}>
                <Controller
                  control={control}
                  name="supplier_id"
                  render={({ field }) => (
                    <Combobox
                      id="supplier_id"
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(next) => field.onChange(next ? Number(next) : undefined)}
                      options={supplierOptions}
                      loading={suppliers.isFetching}
                      disabled={isEdit}
                      clearable={!isEdit}
                      onSearchChange={setSupplierSearch}
                      placeholder={translate("ph.aucunFournisseur")}
                      searchPlaceholder={translate("ph.rechercherUnFournisseur")}
                    />
                  )}
                />
              </FormField>
              <FormField label={translate("field.skuFournisseur")} htmlFor="supplier_sku">
                <Input id="supplier_sku" {...register("supplier_sku")} />
              </FormField>
              <FormField label={translate("field.prixUnitaire")} htmlFor="unit_price" required error={errors.unit_price?.message}>
                <Input id="unit_price" type="number" step="0.01" min={0} {...register("unit_price")} />
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
              <FormField label={translate("field.moq")} htmlFor="moq">
                <Input id="moq" type="number" min={1} {...register("moq")} />
              </FormField>
              <FormField label={translate("field.delaiDeLivraisonJours")} htmlFor="lead_time_days">
                <Input id="lead_time_days" type="number" min={0} {...register("lead_time_days")} />
              </FormField>
              <FormField label={translate("field.derniereCotation")} htmlFor="last_quoted_at">
                <Input id="last_quoted_at" type="date" {...register("last_quoted_at")} />
              </FormField>
            </FormSection>
            <FormField label={translate("section.notes")} htmlFor="notes">
              <Textarea id="notes" {...register("notes")} rows={2} />
            </FormField>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <Label htmlFor="is_preferred">{translate("t.fournisseurPrefere")}</Label>
              <Switch id="is_preferred" checked={isPreferred} onCheckedChange={(value) => setValue("is_preferred", value)} />
            </div>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : "Lier"}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
