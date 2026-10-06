"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { assignAttributeSchema, type AssignAttributeSchema } from "../schemas/assign-attribute.schema";
import { useAssignVariantAttribute, useUpdateVariantAttribute } from "../hooks/use-variant-attributes";
import { useProductAttributes } from "../hooks/use-product-attributes";
import type { VariantAttributeValue } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_produits.md § 4, onglet « Attributs personnalisés ». Le champ
 * affiché (valeur prédéfinie vs. saisie libre) dépend du `input_type` de
 * l'attribut sélectionné ; `product_attribute_id` n'est modifiable qu'à la
 * création (spec : "non modifiable ensuite").
 */
export function AssignAttributeDialog({
  open,
  onOpenChange,
  productId,
  variantId,
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  variantId: number;
  entry?: VariantAttributeValue | null;
}) {
  const isEdit = Boolean(entry);
  const attributesQuery = useProductAttributes();
  const assignMutation = useAssignVariantAttribute(productId, variantId);
  const updateMutation = useUpdateVariantAttribute(productId, variantId);
  const isPending = assignMutation.isPending || updateMutation.isPending;

  const {
    handleSubmit,
    reset,
    watch,
    control,
    register,
  } = useForm<AssignAttributeSchema>({
    resolver: zodResolver(assignAttributeSchema),
    defaultValues: { product_attribute_id: undefined, product_attribute_value_id: undefined, custom_value: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      entry
        ? {
            product_attribute_id: entry.product_attribute.id,
            product_attribute_value_id: entry.product_attribute_value?.id,
            custom_value: entry.custom_value ?? "",
          }
        : { product_attribute_id: undefined, product_attribute_value_id: undefined, custom_value: "" },
    );
  }, [open, entry, reset]);

  const selectedAttributeId = watch("product_attribute_id");
  const selectedAttribute = (attributesQuery.data ?? []).find((attribute) => attribute.id === selectedAttributeId);
  const isSelectType = selectedAttribute?.input_type === "SELECT";

  function onSubmit(values: AssignAttributeSchema) {
    const payload = {
      product_attribute_id: values.product_attribute_id,
      product_attribute_value_id: isSelectType ? values.product_attribute_value_id : undefined,
      custom_value: !isSelectType ? values.custom_value || undefined : undefined,
    };
    if (isEdit && entry) {
      updateMutation.mutate(
        { valueId: entry.id, payload: { product_attribute_value_id: payload.product_attribute_value_id, custom_value: payload.custom_value } },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      assignMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier l'attribut" : "Assigner un attribut"} pending={isPending} />

          <div className="space-y-4 px-6 py-5">
          <FormField label={translate("field.attribut")} htmlFor="product_attribute_id" required>
            <Controller
              control={control}
              name="product_attribute_id"
              render={({ field }) => (
                <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(Number(value))} disabled={isEdit}>
                  <SelectTrigger id="product_attribute_id">
                    <SelectValue placeholder={translate("ph.selectionner")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(attributesQuery.data ?? []).map((attribute) => (
                      <SelectItem key={attribute.id} value={String(attribute.id)}>
                        {attribute.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {isSelectType ? (
            <FormField label={translate("field.valeur")} htmlFor="product_attribute_value_id">
              <Controller
                control={control}
                name="product_attribute_value_id"
                render={({ field }) => (
                  <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(Number(value))}>
                    <SelectTrigger id="product_attribute_value_id">
                      <SelectValue placeholder={translate("ph.selectionner")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedAttribute?.values ?? []).map((value) => (
                        <SelectItem key={value.id} value={String(value.id)}>
                          {value.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          ) : selectedAttributeId ? (
            <FormField label={translate("field.valeur")} htmlFor="custom_value">
              <Input
                id="custom_value"
                type={selectedAttribute?.input_type === "NUMBER" ? "number" : "text"}
                {...register("custom_value")}
                placeholder={selectedAttribute?.unit_suffix ? `en ${selectedAttribute.unit_suffix}` : undefined}
              />
            </FormField>
          ) : null}
          </div>

          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending || !selectedAttributeId}>
              {isEdit ? "Enregistrer" : "Assigner"}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
