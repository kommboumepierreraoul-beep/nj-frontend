"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { useCreateTag, useUpdateTag } from "@/modules/reference-data/hooks/use-tags";
import { slugify } from "@/lib/utils";
import type { Tag } from "@/modules/reference-data/types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_produits.md § 6 — formulaire « Tag ».
 *
 * La couleur est choisie via un `<input type="color">` (§ demande frontend :
 * plus de code couleur saisi manuellement) — le navigateur garantit donc
 * toujours un hexadécimal 6 chiffres valide, d'où une valeur requise (avec
 * une teinte neutre par défaut) plutôt qu'un champ optionnel/texte libre.
 */
const tagSchema = z.object({
  name: z.string().min(1, "Le nom est requis.").max(255),
  slug: z.string().min(1, "Le slug est requis.").max(255),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format hexadécimal attendu, ex. #6B7280."),
});

type TagSchema = z.infer<typeof tagSchema>;

export function TagFormDialog({ open, onOpenChange, tag }: { open: boolean; onOpenChange: (open: boolean) => void; tag?: Tag | null }) {
  const isEdit = Boolean(tag);
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TagSchema>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: "", slug: "", color: "#6B7280" },
  });

  useEffect(() => {
    if (!open) return;
    setSlugTouched(Boolean(tag));
    reset(tag ? { name: tag.name, slug: tag.slug, color: tag.color || "#6B7280" } : { name: "", slug: "", color: "#6B7280" });
  }, [open, tag, reset]);

  const name = watch("name");
  const color = watch("color");

  useEffect(() => {
    if (!slugTouched && name) setValue("slug", slugify(name));
  }, [name, slugTouched, setValue]);

  function onSubmit(values: TagSchema) {
    const payload = values;
    if (isEdit && tag) {
      updateMutation.mutate({ id: tag.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier le tag" : "Nouveau tag"} pending={isPending} />

          <div className="space-y-4 px-6 py-5">
          <FormSection cols={1}>
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
            <FormField label={translate("field.couleur")} htmlFor="color" error={errors.color?.message}>
              <div className="flex items-center gap-3">
                <input
                  id="color"
                  type="color"
                  {...register("color")}
                  className="h-10 w-14 shrink-0 cursor-pointer rounded-md border border-border bg-surface p-1"
                />
                <span className="text-[13px] font-medium tabular-nums text-muted-foreground uppercase">{color || "#6B7280"}</span>
              </div>
            </FormField>
          </FormSection>
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
