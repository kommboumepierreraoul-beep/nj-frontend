"use client";

import { useState } from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue, type UseFormWatch } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/forms/form-section";
import { VariantPickerField } from "@/modules/purchase-orders/components/variant-picker-field";
import type { SalesOrderSchema } from "../schemas/sales-order.schema";
import type { SalesOrderType } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_commandes.md § 1 « Section Lignes » — une ligne du tableau
 * répétable du formulaire de création. `item_type` est verrouillé par le
 * `type` de commande (note « item_type » de la spec : PRODUIT pour
 * MULTI_PRODUITS/PRODUIT_UNIQUE_MULTI_CHOIX, SERVICE pour PRESTATION_SERVICE)
 * — jamais un champ éditable ici, `orderType` pilote uniquement l'affichage.
 */
export function SalesOrderItemRow({
  index,
  control,
  register,
  watch,
  setValue,
  errors,
  orderType,
  onRemove,
}: {
  index: number;
  control: Control<SalesOrderSchema>;
  register: UseFormRegister<SalesOrderSchema>;
  watch: UseFormWatch<SalesOrderSchema>;
  setValue: UseFormSetValue<SalesOrderSchema>;
  errors: FieldErrors<SalesOrderSchema>["items"];
  orderType: SalesOrderType;
  onRemove: () => void;
}) {
  const itemType = watch(`items.${index}.item_type`);
  const productVariantId = watch(`items.${index}.product_variant_id`);
  const rowErrors = errors?.[index];
  const [pickedVariantLabel, setPickedVariantLabel] = useState<string | null>(null);

  return (
    <div className="space-y-3 rounded-lg border border-border-2 bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ligne {index + 1}</p>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {itemType === "PRODUIT" ? (
          <FormField label={translate("field.varianteProduit")} required error={rowErrors?.product_variant_id?.message} span={2}>
            {productVariantId ? (
              <div className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
                <span>{pickedVariantLabel ?? translate("t.varianteSelectionnee")}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setValue(`items.${index}.product_variant_id`, undefined);
                    setPickedVariantLabel(null);
                  }}
                >
                  {translate("t.changer")}
                </Button>
              </div>
            ) : (
              <VariantPickerField
                onSelect={(variant) => {
                  setValue(`items.${index}.product_variant_id`, variant.id);
                  setPickedVariantLabel(`${variant.sku} — ${variant.name}`);
                }}
              />
            )}
          </FormField>
        ) : (
          <FormField label={translate("field.libelleDeLaPrestation")} htmlFor={`items.${index}.label`} required error={rowErrors?.label?.message} span={2}>
            <Input id={`items.${index}.label`} {...register(`items.${index}.label`)} />
          </FormField>
        )}

        <FormField label={translate("field.description")} htmlFor={`items.${index}.description`} span={2}>
          <Textarea id={`items.${index}.description`} {...register(`items.${index}.description`)} rows={2} />
        </FormField>

        <FormField label={translate("field.quantite")} htmlFor={`items.${index}.quantity`} required error={rowErrors?.quantity?.message}>
          <Input id={`items.${index}.quantity`} type="number" step="0.01" min={0.01} {...register(`items.${index}.quantity`)} />
        </FormField>
        <FormField label={translate("field.prixUnitaire")} htmlFor={`items.${index}.unit_price`} required error={rowErrors?.unit_price?.message}>
          <Input id={`items.${index}.unit_price`} type="number" step="0.01" min={0} {...register(`items.${index}.unit_price`)} />
        </FormField>
        <FormField label={translate("field.remise")} htmlFor={`items.${index}.discount_amount`}>
          <Input id={`items.${index}.discount_amount`} type="number" step="0.01" min={0} {...register(`items.${index}.discount_amount`)} placeholder="0" />
        </FormField>
        <FormField label={translate("section.notes")} htmlFor={`items.${index}.notes`}>
          <Input id={`items.${index}.notes`} {...register(`items.${index}.notes`)} />
        </FormField>
      </div>

      {orderType === "PRODUIT_UNIQUE_MULTI_CHOIX" ? (
        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name={`items.${index}.is_proposed_option`}
              render={({ field }) => <Checkbox id={`items.${index}.is_proposed_option`} checked={field.value ?? false} onCheckedChange={field.onChange} />}
            />
            <Label htmlFor={`items.${index}.is_proposed_option`} className="font-normal">
              Option proposée (comparatif 3 choix)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name={`items.${index}.is_selected`}
              render={({ field }) => <Checkbox id={`items.${index}.is_selected`} checked={field.value ?? true} onCheckedChange={field.onChange} />}
            />
            <Label htmlFor={`items.${index}.is_selected`} className="font-normal">
              Sélectionnée par le client
            </Label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
