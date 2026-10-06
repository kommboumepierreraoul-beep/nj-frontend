"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { productAttributeSchema, type ProductAttributeSchema } from "../schemas/product-attribute.schema";
import { useCreateProductAttribute, useUpdateProductAttribute } from "../hooks/use-product-attributes";
import { ATTRIBUTE_INPUT_TYPE_LABELS } from "../badges";
import { slugify } from "@/lib/utils";
import type { ProductAttribute } from "../types";
import { translate } from "@/i18n/translate";

export function ProductAttributeFormDialog({
  open,
  onOpenChange,
  attribute,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute?: ProductAttribute | null;
}) {
  const isEdit = Boolean(attribute);
  const createMutation = useCreateProductAttribute();
  const updateMutation = useUpdateProductAttribute();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [codeTouched, setCodeTouched] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductAttributeSchema>({
    resolver: zodResolver(productAttributeSchema),
    defaultValues: { name: "", code: "", input_type: "TEXT", is_filterable: false },
  });

  useEffect(() => {
    if (!open) return;
    setCodeTouched(Boolean(attribute));
    reset(
      attribute
        ? {
            name: attribute.name,
            code: attribute.code,
            input_type: attribute.input_type,
            unit_suffix: attribute.unit_suffix ?? "",
            is_filterable: attribute.is_filterable,
          }
        : { name: "", code: "", input_type: "TEXT", is_filterable: false },
    );
  }, [open, attribute, reset]);

  const name = watch("name");
  const isFilterable = watch("is_filterable");

  useEffect(() => {
    if (!codeTouched && name) setValue("code", slugify(name).replace(/-/g, "_"));
  }, [name, codeTouched, setValue]);

  function onSubmit(values: ProductAttributeSchema) {
    const payload = { ...values, unit_suffix: values.unit_suffix || undefined };
    if (isEdit && attribute) {
      updateMutation.mutate({ id: attribute.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier l'attribut" : "Nouvel attribut"} pending={isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.nom")} htmlFor="name" required error={errors.name?.message}>
                <Input id="name" {...register("name")} placeholder={translate("field.couleur")} />
              </FormField>
              <FormField label={translate("field.code")} htmlFor="code" required error={errors.code?.message}>
                <Input
                  id="code"
                  {...register("code")}
                  onChange={(event) => {
                    setCodeTouched(true);
                    register("code").onChange(event);
                  }}
                  placeholder="couleur"
                />
              </FormField>
              <FormField label={translate("field.typeDeSaisie")} htmlFor="input_type">
                <Controller
                  control={control}
                  name="input_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="input_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ATTRIBUTE_INPUT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.suffixeDUnite")} htmlFor="unit_suffix" error={errors.unit_suffix?.message}>
                <Input id="unit_suffix" {...register("unit_suffix")} placeholder="kg, cm…" />
              </FormField>
            </FormSection>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <Label htmlFor="is_filterable">{translate("t.filtrableDansLeCatalogue")}</Label>
              <Switch id="is_filterable" checked={isFilterable} onCheckedChange={(value) => setValue("is_filterable", value)} />
            </div>
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
