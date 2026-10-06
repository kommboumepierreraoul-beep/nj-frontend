"use client";

import { useEffect, useState } from "react";
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
import { HelpButton } from "@/components/forms/help-button";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { Combobox } from "@/components/forms/combobox";
import { productSchema, type ProductSchema } from "../schemas/product.schema";
import { useCreateProduct, useUpdateProduct } from "../hooks/use-product-mutations";
import { useProductCategories } from "../hooks/use-product-categories";
import { CategoryTreeSelect } from "./category-tree-select";
import { useCountries } from "@/modules/reference-data/hooks/use-countries";
import { useUnits } from "@/modules/reference-data/hooks/use-units";
import { countryFlagEmoji } from "@/lib/countries";
import { PRODUCT_STATUS_LABELS } from "../badges";
import { slugify } from "@/lib/utils";
import type { Product } from "../types";
import { translate } from "@/i18n/translate";

const NONE = "__none__";

const helpEntries = () => [
  { field: translate("col.reference"), help: "Code interne unique du produit, ex. NJ-2024-001." },
  { field: "Slug", help: translate("t.genereDepuisLeNomModifiableDoitResterUnique") },
  { field: "Produit sensible", help: translate("t.signaleUnProduitSoumisARestrictionDouaneReglementa") },
  { field: translate("field.uniteDeMesure"), help: translate("t.uniteParDefautUtiliseePourLesQuantitesDeCeProduitP") },
  { field: translate("t.quantiteMinimaleDeCommande"), help: translate("t.moqParDefautDuProduitPeutEtreSurchargeAuNiveauDeCh") },
];

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}) {
  const isEdit = Boolean(product);
  const categories = useProductCategories();
  const countries = useCountries();
  const units = useUnits();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(product?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: { reference: "", name: "", slug: "", status: "ACTIVE", is_sensitive: false },
  });

  useEffect(() => {
    if (!open) return;
    setSlugTouched(Boolean(product));
    reset(
      product
        ? {
            category_id: product.category?.id,
            reference: product.reference,
            name: product.name,
            slug: product.slug,
            description: product.description ?? "",
            status: product.status,
            is_sensitive: product.is_sensitive,
            sensitivity_reason: product.sensitivity_reason ?? "",
            default_unit_id: product.default_unit?.id,
            default_weight_kg: product.default_weight_kg ?? undefined,
            default_volume_cbm: product.default_volume_cbm ?? undefined,
            min_order_quantity: product.min_order_quantity ?? undefined,
            brand: product.brand ?? "",
            country_of_origin_id: product.country_of_origin?.id,
          }
        : { reference: "", name: "", slug: "", status: "ACTIVE", is_sensitive: false },
    );
  }, [open, product, reset]);

  const name = watch("name");
  const isSensitive = watch("is_sensitive");

  useEffect(() => {
    if (!slugTouched && name) setValue("slug", slugify(name));
  }, [name, slugTouched, setValue]);

  function onSubmit(values: ProductSchema) {
    const payload = {
      ...values,
      description: values.description || undefined,
      sensitivity_reason: values.is_sensitive ? values.sensitivity_reason || undefined : undefined,
      brand: values.brand || undefined,
    };
    if (isEdit && product) {
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
            title={isEdit ? "Modifier le produit" : "Nouveau produit"}
            actions={<HelpButton entries={helpEntries()} />}
            pending={isPending}
          />

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <FormSection title={translate("section.identification")} cols={2}>
              <FormField label={translate("field.categorie")} htmlFor="category_id">
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <CategoryTreeSelect
                      id="category_id"
                      categories={categories.data ?? []}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormField>
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
                        {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.reference")} htmlFor="reference" required error={errors.reference?.message}>
                <Input id="reference" {...register("reference")} />
              </FormField>
              <FormField label={translate("field.nom")} htmlFor="name" required error={errors.name?.message}>
                <Input id="name" {...register("name")} />
              </FormField>
              <FormField label={translate("field.slug")} htmlFor="slug" required error={errors.slug?.message} span={2}>
                <Input
                  id="slug"
                  {...register("slug")}
                  onChange={(event) => {
                    setSlugTouched(true);
                    register("slug").onChange(event);
                  }}
                />
              </FormField>
              <FormField label={translate("field.description")} htmlFor="description" span={2}>
                <Textarea id="description" {...register("description")} rows={3} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.sensibilite")}>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <Label htmlFor="is_sensitive">Produit sensible</Label>
                <Switch id="is_sensitive" checked={isSensitive} onCheckedChange={(value) => setValue("is_sensitive", value)} />
              </div>
              {isSensitive ? (
                <FormField label={translate("field.motif")} htmlFor="sensitivity_reason" required error={errors.sensitivity_reason?.message}>
                  <Textarea id="sensitivity_reason" {...register("sensitivity_reason")} rows={2} />
                </FormField>
              ) : null}
            </FormSection>

            <FormSection title={translate("section.logistiqueOrigine")} cols={2}>
              <FormField label={translate("field.uniteDeMesure")} htmlFor="default_unit_id">
                <Controller
                  control={control}
                  name="default_unit_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : NONE} onValueChange={(value) => field.onChange(value === NONE ? undefined : Number(value))}>
                      <SelectTrigger id="default_unit_id">
                        <SelectValue placeholder={translate("ph.selectionner")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>{translate("t.aucune")}</SelectItem>
                        {(units.data ?? []).map((unit) => (
                          <SelectItem key={unit.id} value={String(unit.id)}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.paysDOrigine")} htmlFor="country_of_origin_id">
                <Controller
                  control={control}
                  name="country_of_origin_id"
                  render={({ field }) => (
                    <Combobox
                      id="country_of_origin_id"
                      value={field.value ? String(field.value) : undefined}
                      onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      placeholder={translate("ph.selectionner")}
                      searchPlaceholder={translate("ph.rechercherUnPays")}
                      clearLabel="Aucun"
                      options={(countries.data ?? []).map((country) => ({
                        value: String(country.id),
                        label: country.name,
                        keywords: country.iso_code,
                        icon: <span>{countryFlagEmoji(country.iso_code)}</span>,
                      }))}
                    />
                  )}
                />
              </FormField>
              <FormField label={translate("field.poidsParDefautKg")} htmlFor="default_weight_kg">
                <Input id="default_weight_kg" type="number" step="0.01" {...register("default_weight_kg")} />
              </FormField>
              <FormField label={translate("field.volumeParDefautM3")} htmlFor="default_volume_cbm">
                <Input id="default_volume_cbm" type="number" step="0.001" {...register("default_volume_cbm")} />
              </FormField>
              <FormField label={translate("field.quantiteMinimaleDeCommande")} htmlFor="min_order_quantity" error={errors.min_order_quantity?.message}>
                <Input id="min_order_quantity" type="number" min={1} {...register("min_order_quantity")} />
              </FormField>
              <FormField label={translate("field.marque")} htmlFor="brand">
                <Input id="brand" {...register("brand")} />
              </FormField>
            </FormSection>
          </div>

          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : translate("t.creerLeProduit")}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
