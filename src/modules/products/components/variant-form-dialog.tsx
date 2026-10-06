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
import { HelpButton } from "@/components/forms/help-button";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { variantSchema, type VariantSchema } from "../schemas/variant.schema";
import { useCreateVariant, useUpdateVariant } from "../hooks/use-variant-mutations";
import { useCurrencies } from "@/modules/reference-data/hooks/use-currencies";
import { VARIANT_LEVEL_LABELS } from "../badges";
import type { ProductVariant } from "../types";
import { translate } from "@/i18n/translate";

const helpEntries = () => [
  { field: "Niveau", help: translate("t.niveauDeQualiteDeLaVariantePremierChoixDeuxiemeCho") },
  { field: "Marge", help: translate("t.peutEtreCalculeeAutomatiquementAPartirDesPrixDAcha") },
  { field: translate("t.varianteParDefaut"), help: translate("t.activerBasculeAutomatiquementToutesLesAutresVarian") },
  { field: "MOQ", help: translate("t.quantiteMinimaleDeCommandeSpecifiqueACetteVariante") },
  { field: "Arguments proforma", help: translate("t.pointsFortsPointsDAttentionUnParLigneEtRecommandat") },
];

/** Textarea « un élément par ligne » -> tableau nettoyé (et inversement). */
function linesToArray(text?: string): string[] {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function VariantFormDialog({
  open,
  onOpenChange,
  productId,
  variant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  variant?: ProductVariant | null;
}) {
  const isEdit = Boolean(variant);
  const currencies = useCurrencies();
  const createMutation = useCreateVariant(productId);
  const updateMutation = useUpdateVariant(productId, variant?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<VariantSchema>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: "",
      name: "",
      level: "STANDARD",
      purchase_price: 0,
      is_recommended: false,
      is_default: false,
      is_active: true,
      proforma_strengths: "",
      proforma_weaknesses: "",
      proforma_recommendation: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      variant
        ? {
            sku: variant.sku,
            barcode: variant.barcode ?? "",
            name: variant.name,
            level: variant.level,
            description: variant.description ?? "",
            purchase_price: variant.purchase_price,
            purchase_currency_id: variant.purchase_currency.id,
            sale_price: variant.sale_price ?? undefined,
            sale_currency_id: variant.sale_currency?.id,
            margin_amount: variant.margin_amount ?? undefined,
            margin_rate: variant.margin_rate ?? undefined,
            estimated_weight_kg: variant.estimated_weight_kg ?? undefined,
            estimated_volume_cbm: variant.estimated_volume_cbm ?? undefined,
            moq: variant.moq ?? undefined,
            is_recommended: variant.is_recommended,
            is_default: variant.is_default,
            is_active: variant.is_active,
            sort_order: variant.sort_order,
            proforma_strengths: (variant.proforma_strengths ?? []).join("\n"),
            proforma_weaknesses: (variant.proforma_weaknesses ?? []).join("\n"),
            proforma_recommendation: variant.proforma_recommendation ?? "",
          }
        : {
            sku: "",
            name: "",
            level: "STANDARD",
            purchase_price: 0,
            is_recommended: false,
            is_default: false,
            is_active: true,
            proforma_strengths: "",
            proforma_weaknesses: "",
            proforma_recommendation: "",
          },
    );
  }, [open, variant, reset]);

  const isRecommended = watch("is_recommended");
  const isDefault = watch("is_default");
  const isActive = watch("is_active");

  function onSubmit(values: VariantSchema) {
    const payload = {
      ...values,
      barcode: values.barcode || undefined,
      description: values.description || undefined,
      proforma_strengths: linesToArray(values.proforma_strengths),
      proforma_weaknesses: linesToArray(values.proforma_weaknesses),
      proforma_recommendation: values.proforma_recommendation?.trim() || undefined,
    };
    if (isEdit && variant) {
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
            title={isEdit ? "Modifier la variante" : "Nouvelle variante"}
            actions={<HelpButton entries={helpEntries()} />}
            pending={isPending}
          />

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <FormSection title={translate("section.identification")} cols={2}>
              <FormField label={translate("field.sku")} htmlFor="sku" required error={errors.sku?.message}>
                <Input id="sku" {...register("sku")} />
              </FormField>
              <FormField label={translate("field.codeBarres")} htmlFor="barcode">
                <Input id="barcode" {...register("barcode")} />
              </FormField>
              <FormField label={translate("field.nom")} htmlFor="name" required error={errors.name?.message}>
                <Input id="name" {...register("name")} />
              </FormField>
              <FormField label={translate("field.niveau")} htmlFor="level">
                <Controller
                  control={control}
                  name="level"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(VARIANT_LEVEL_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.description")} htmlFor="description" span={2}>
                <Textarea id="description" {...register("description")} rows={2} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.prix")} cols={2}>
              <FormField label={translate("field.prixDAchat")} htmlFor="purchase_price" required error={errors.purchase_price?.message}>
                <Input id="purchase_price" type="number" step="0.01" min={0} {...register("purchase_price")} />
              </FormField>
              <FormField label={translate("field.deviseDAchat")} htmlFor="purchase_currency_id" required error={errors.purchase_currency_id?.message}>
                <Controller
                  control={control}
                  name="purchase_currency_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(Number(value))}>
                      <SelectTrigger id="purchase_currency_id">
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
              <FormField label={translate("field.prixDeVente")} htmlFor="sale_price">
                <Input id="sale_price" type="number" step="0.01" min={0} {...register("sale_price")} />
              </FormField>
              <FormField label={translate("field.deviseDeVente")} htmlFor="sale_currency_id">
                <Controller
                  control={control}
                  name="sale_currency_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}>
                      <SelectTrigger id="sale_currency_id">
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
              <FormField label={translate("field.margeMontant")} htmlFor="margin_amount">
                <Input id="margin_amount" type="number" step="0.01" {...register("margin_amount")} />
              </FormField>
              <FormField label={translate("field.margeTaux")} htmlFor="margin_rate">
                <Input id="margin_rate" type="number" step="0.01" {...register("margin_rate")} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.logistique")} cols={2}>
              <FormField label={translate("field.poidsEstimeKg")} htmlFor="estimated_weight_kg">
                <Input id="estimated_weight_kg" type="number" step="0.01" {...register("estimated_weight_kg")} />
              </FormField>
              <FormField label={translate("field.volumeEstimeM3")} htmlFor="estimated_volume_cbm">
                <Input id="estimated_volume_cbm" type="number" step="0.001" {...register("estimated_volume_cbm")} />
              </FormField>
              <FormField label={translate("field.moq")} htmlFor="moq">
                <Input id="moq" type="number" min={1} {...register("moq")} />
              </FormField>
              <FormField label={translate("field.ordreDAffichage")} htmlFor="sort_order">
                <Input id="sort_order" type="number" {...register("sort_order")} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.argumentsProformaComparative")} cols={1}>
              <p className="text-xs text-muted-foreground">
                Repris automatiquement dans la proforma comparative de cette variante. L&apos;émetteur peut les ajuster au moment de l&apos;émission.
              </p>
              <FormField label={translate("field.pointsForts")} htmlFor="proforma_strengths">
                <Textarea
                  id="proforma_strengths"
                  rows={3}
                  placeholder={"Un point par ligne, ex.\nQualité supérieure\nLivraison plus rapide"}
                  {...register("proforma_strengths")}
                />
              </FormField>
              <FormField label={translate("field.pointsDAttention")} htmlFor="proforma_weaknesses">
                <Textarea id="proforma_weaknesses" rows={3} placeholder={translate("ph.unPointParLigne")} {...register("proforma_weaknesses")} />
              </FormField>
              <FormField label={translate("field.recommandation")} htmlFor="proforma_recommendation">
                <Input id="proforma_recommendation" placeholder={translate("ph.exRecommandePourUnPremierEssai")} {...register("proforma_recommendation")} />
              </FormField>
            </FormSection>

            <FormSection title={translate("section.options")} cols={2}>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <Label htmlFor="is_recommended">{translate("t.varianteRecommandee")}</Label>
                <Switch id="is_recommended" checked={isRecommended} onCheckedChange={(value) => setValue("is_recommended", value)} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <Label htmlFor="is_default">{translate("t.varianteParDefaut")}</Label>
                <Switch id="is_default" checked={isDefault} onCheckedChange={(value) => setValue("is_default", value)} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <Label htmlFor="is_active">Variante active</Label>
                <Switch id="is_active" checked={isActive} onCheckedChange={(value) => setValue("is_active", value)} />
              </div>
            </FormSection>
          </div>

          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : translate("t.creerLaVariante")}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
