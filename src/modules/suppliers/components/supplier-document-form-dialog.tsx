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
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { supplierDocumentSchema, type SupplierDocumentSchema } from "../schemas/supplier-document.schema";
import { useCreateSupplierDocument, useUpdateSupplierDocument } from "../hooks/use-supplier-documents";
import { useAttachments } from "@/modules/attachments/hooks/use-attachments";
import { DOCUMENT_TYPE_LABELS } from "../badges";
import type { SupplierDocument } from "../types";
import { translate } from "@/i18n/translate";

/**
 * `attachment_id` se choisit parmi les pièces jointes déjà téléversées via
 * l'uploader transverse (Doc/spec_pages_fournisseurs.md § 2, onglet
 * « Documents » : "le fichier est d'abord téléversé... puis référencé ici").
 * L'onglet parent affiche donc systématiquement l'uploader juste au-dessus de
 * ce formulaire.
 */
export function SupplierDocumentFormDialog({
  open,
  onOpenChange,
  supplierId,
  document,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: number;
  document?: SupplierDocument | null;
}) {
  const isEdit = Boolean(document);
  const attachmentsQuery = useAttachments("supplier", supplierId);
  const createMutation = useCreateSupplierDocument(supplierId);
  const updateMutation = useUpdateSupplierDocument(supplierId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<SupplierDocumentSchema>({
    resolver: zodResolver(supplierDocumentSchema),
    defaultValues: { type: "OTHER", is_verified: false },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      document
        ? {
            type: document.type,
            attachment_id: document.attachment.id,
            issue_date: document.issue_date ?? "",
            expiry_date: document.expiry_date ?? "",
            is_verified: document.is_verified,
            notes: document.notes ?? "",
          }
        : { type: "OTHER", is_verified: false },
    );
  }, [open, document, reset]);

  const isVerified = watch("is_verified");

  function onSubmit(values: SupplierDocumentSchema) {
    const payload = { ...values, issue_date: values.issue_date || undefined, expiry_date: values.expiry_date || undefined, notes: values.notes || undefined };
    if (isEdit && document) {
      updateMutation.mutate({ documentId: document.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier le document" : "Nouveau document"} pending={isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.typeDeDocument")} htmlFor="type">
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.fichier")} htmlFor="attachment_id" required error={errors.attachment_id?.message}>
                <Controller
                  control={control}
                  name="attachment_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(Number(value))} disabled={isEdit}>
                      <SelectTrigger id="attachment_id">
                        <SelectValue placeholder={translate("ph.selectionnerUnFichierDejaTeleverse")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(attachmentsQuery.data ?? []).map((attachment) => (
                          <SelectItem key={attachment.id} value={String(attachment.id)}>
                            {attachment.file_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.dateDEmission")} htmlFor="issue_date">
                <Input id="issue_date" type="date" {...register("issue_date")} />
              </FormField>
              <FormField label={translate("field.dateDExpiration")} htmlFor="expiry_date" error={errors.expiry_date?.message}>
                <Input id="expiry_date" type="date" {...register("expiry_date")} />
              </FormField>
            </FormSection>
            <FormField label={translate("section.notes")} htmlFor="notes">
              <Textarea id="notes" {...register("notes")} rows={2} />
            </FormField>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <Label htmlFor="is_verified">{translate("t.documentVerifie")}</Label>
              <Switch id="is_verified" checked={isVerified} onCheckedChange={(value) => setValue("is_verified", value)} />
            </div>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
