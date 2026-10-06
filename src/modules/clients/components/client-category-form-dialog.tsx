"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { clientCategorySchema, type ClientCategorySchema } from "../schemas/client-category.schema";
import { useCreateClientCategory, useUpdateClientCategory } from "../hooks/use-client-categories";
import { storageUrl } from "@/lib/media";
import type { ClientCategory } from "../types";
import { translate } from "@/i18n/translate";

const DEFAULT_BADGE_COLOR = "#E5A817";

const helpEntries = () => [
  { field: "Code", help: translate("t.identifiantTechniqueStableExEcomRichRequisALaCreat") },
  { field: translate("col.label"), help: translate("t.nomAfficheAuxUtilisateursExEcomRich") },
  { field: "Couleur du badge", help: translate("t.ignoreeSiUnLogoEstRenseigne") },
  { field: "Logo du badge", help: translate("t.imageTeleverseePrioritaireSurLaCouleurSiLesDeuxSon") },
  { field: "Actif", help: translate("t.uneCategorieDesactiveeNApparaitPlusDansLesSelecteu") },
];

export function ClientCategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ClientCategory | null;
}) {
  const isEdit = Boolean(category);
  const createMutation = useCreateClientCategory();
  const updateMutation = useUpdateClientCategory();
  const isPending = createMutation.isPending || updateMutation.isPending;
  // Logo géré hors du formulaire react-hook-form/zod (fichier brut, pas une
  // chaîne validable) — voir le commentaire du schéma.
  const [badgeImage, setBadgeImage] = useState<File | null>(null);
  const [removeBadgeImage, setRemoveBadgeImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientCategorySchema>({
    resolver: zodResolver(clientCategorySchema),
    defaultValues: { code: "", label: "", badge_color: DEFAULT_BADGE_COLOR, description: "", is_active: true },
  });

  useEffect(() => {
    if (open) {
      setBadgeImage(null);
      setRemoveBadgeImage(false);
      reset(
        category
          ? {
              code: category.code,
              label: category.label,
              badge_color: category.badge_color || DEFAULT_BADGE_COLOR,
              description: category.description ?? "",
              sort_order: category.sort_order,
              is_active: category.is_active,
            }
          : { code: "", label: "", badge_color: DEFAULT_BADGE_COLOR, description: "", is_active: true },
      );
    }
  }, [open, category, reset]);

  const isActive = watch("is_active");
  const badgeColor = watch("badge_color");

  function onSubmit(values: ClientCategorySchema) {
    const payload = { ...values, badge_image: badgeImage ?? undefined };
    if (isEdit && category) {
      updateMutation.mutate(
        { id: category.id, payload: { ...payload, remove_badge_image: removeBadgeImage && !badgeImage } },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader
            title={isEdit ? translate("t.modifierLaCategorie") : translate("t.nouvelleCategorie")}
            actions={<HelpButton entries={helpEntries()} />}
            pending={isPending}
          />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.code")} htmlFor="code" required error={errors.code?.message}>
                <Input id="code" {...register("code")} disabled={isEdit} placeholder="ECOM_RICH" />
              </FormField>
              <FormField label={translate("field.libelle")} htmlFor="label" required error={errors.label?.message}>
                <Input id="label" {...register("label")} placeholder="Ecom-Rich" />
              </FormField>
              <FormField label={translate("field.couleurDuBadge")} htmlFor="badge_color" error={errors.badge_color?.message}>
                <div className="flex items-center gap-3">
                  <input
                    id="badge_color"
                    type="color"
                    {...register("badge_color")}
                    className="h-10 w-14 shrink-0 cursor-pointer rounded-md border border-border bg-surface p-1"
                  />
                  <span className="text-[13px] font-medium tabular-nums text-muted-foreground uppercase">
                    {badgeColor || DEFAULT_BADGE_COLOR}
                  </span>
                </div>
              </FormField>
            </FormSection>
            <FormField label={translate("field.logoDuBadge")}>
              <ImageUploadField
                value={badgeImage}
                onChange={(file) => {
                  setBadgeImage(file);
                  if (file) setRemoveBadgeImage(false);
                }}
                existingUrl={!removeBadgeImage ? storageUrl(category?.badge_image_path) : undefined}
                onRemoveExisting={() => setRemoveBadgeImage(true)}
              />
            </FormField>
            <FormField label={translate("field.description")} htmlFor="description">
              <Textarea id="description" {...register("description")} rows={3} />
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
