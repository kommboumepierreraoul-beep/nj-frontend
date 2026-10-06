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
import { FormField, FormSection } from "@/components/forms/form-section";
import { HelpButton } from "@/components/forms/help-button";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { ImageUploadField } from "@/components/forms/image-upload-field";
import { CategoryTreeSelect } from "./category-tree-select";
import { productCategorySchema, type ProductCategorySchema } from "../schemas/product-category.schema";
import { useCreateProductCategory, useProductCategories, useUpdateProductCategory } from "../hooks/use-product-categories";
import { slugify } from "@/lib/utils";
import { storageUrl } from "@/lib/media";
import type { ProductCategory } from "../types";
import { translate } from "@/i18n/translate";

const helpEntries = () => [
  { field: translate("field.categorieParente"), help: translate("t.laissezVidePourUneCategorieRacineUneCategorieNePeu") },
  { field: "Slug", help: translate("t.genereAutomatiquementDepuisLeNomModifiableDoitRest") },
  { field: "Ordre d'affichage", help: "Détermine l'ordre dans l'arborescence, du plus petit au plus grand." },
];

export function ProductCategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ProductCategory | null;
}) {
  const isEdit = Boolean(category);
  const categories = useProductCategories();
  const createMutation = useCreateProductCategory();
  const updateMutation = useUpdateProductCategory();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [slugTouched, setSlugTouched] = useState(false);
  // Logo géré hors du formulaire react-hook-form/zod (fichier brut, pas une
  // chaîne validable) — voir le commentaire du schéma.
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductCategorySchema>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: { name: "", slug: "", description: "", is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    setSlugTouched(Boolean(category));
    setImage(null);
    setRemoveImage(false);
    reset(
      category
        ? {
            parent_id: category.parent_id ?? undefined,
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            sort_order: category.sort_order,
            is_active: category.is_active,
          }
        : { name: "", slug: "", description: "", is_active: true },
    );
  }, [open, category, reset]);

  const isActive = watch("is_active");
  const name = watch("name");

  useEffect(() => {
    if (!slugTouched && name) setValue("slug", slugify(name));
  }, [name, slugTouched, setValue]);

  function onSubmit(values: ProductCategorySchema) {
    const payload = { ...values, description: values.description || undefined, image: image ?? undefined };
    if (isEdit && category) {
      updateMutation.mutate(
        { id: category.id, payload: { ...payload, remove_image: removeImage && !image } },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader
            title={isEdit ? translate("t.modifierLaCategorie") : translate("t.nouvelleCategorie")}
            actions={<HelpButton entries={helpEntries()} />}
            pending={isPending}
          />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.categorieParente")} htmlFor="parent_id">
                <Controller
                  control={control}
                  name="parent_id"
                  render={({ field }) => (
                    <CategoryTreeSelect
                      id="parent_id"
                      categories={categories.data ?? []}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={translate("ph.categorieRacine")}
                      clearLabel="Aucune (racine)"
                      excludeId={category?.id}
                    />
                  )}
                />
              </FormField>
              <FormField label={translate("field.ordreDAffichage")} htmlFor="sort_order">
                <Input id="sort_order" type="number" {...register("sort_order")} placeholder="0" />
              </FormField>
              <FormField label={translate("field.nom")} htmlFor="name" required error={errors.name?.message}>
                <Input id="name" {...register("name")} />
              </FormField>
              <FormField label={translate("field.slug")} htmlFor="slug" required error={errors.slug?.message}>
                <Input
                  id="slug"
                  {...register("slug")}
                  onChange={(event) => {
                    setSlugTouched(true);
                    register("slug").onChange(event);
                  }}
                />
              </FormField>
            </FormSection>
            <FormField label={translate("field.description")} htmlFor="description">
              <Textarea id="description" {...register("description")} rows={3} />
            </FormField>
            <FormField label={translate("section.logo")}>
              <ImageUploadField
                value={image}
                onChange={(file) => {
                  setImage(file);
                  if (file) setRemoveImage(false);
                }}
                existingUrl={!removeImage ? storageUrl(category?.image_path) : undefined}
                onRemoveExisting={() => setRemoveImage(true)}
              />
            </FormField>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <Label htmlFor="is_active">{translate("t.categorieActive")}</Label>
              <Switch id="is_active" checked={isActive} onCheckedChange={(value) => setValue("is_active", value)} />
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
