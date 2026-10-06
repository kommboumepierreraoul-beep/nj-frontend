"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { supplierContactSchema, type SupplierContactSchema } from "../schemas/supplier-contact.schema";
import { useCreateSupplierContact, useUpdateSupplierContact } from "../hooks/use-supplier-contacts";
import type { SupplierContact } from "../types";
import { translate } from "@/i18n/translate";

export function SupplierContactFormDialog({
  open,
  onOpenChange,
  supplierId,
  contact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: number;
  contact?: SupplierContact | null;
}) {
  const isEdit = Boolean(contact);
  const createMutation = useCreateSupplierContact(supplierId);
  const updateMutation = useUpdateSupplierContact(supplierId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SupplierContactSchema>({
    resolver: zodResolver(supplierContactSchema),
    defaultValues: { full_name: "", is_primary: false },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      contact
        ? {
            full_name: contact.full_name,
            role_title: contact.role_title ?? "",
            phone: contact.phone ?? "",
            wechat_id: contact.wechat_id ?? "",
            email: contact.email ?? "",
            is_primary: contact.is_primary,
            notes: contact.notes ?? "",
          }
        : { full_name: "", is_primary: false },
    );
  }, [open, contact, reset]);

  const isPrimary = watch("is_primary");

  function onSubmit(values: SupplierContactSchema) {
    const payload = { ...values, role_title: values.role_title || undefined, phone: values.phone || undefined, wechat_id: values.wechat_id || undefined, email: values.email || undefined, notes: values.notes || undefined };
    if (isEdit && contact) {
      updateMutation.mutate({ contactId: contact.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier le contact" : "Nouveau contact"} pending={isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.nomComplet")} htmlFor="full_name" required error={errors.full_name?.message}>
                <Input id="full_name" {...register("full_name")} />
              </FormField>
              <FormField label={translate("field.fonction")} htmlFor="role_title">
                <Input id="role_title" {...register("role_title")} />
              </FormField>
              <FormField label={translate("field.telephone")} htmlFor="phone">
                <Input id="phone" {...register("phone")} />
              </FormField>
              <FormField label={translate("field.wechatId")} htmlFor="wechat_id">
                <Input id="wechat_id" {...register("wechat_id")} />
              </FormField>
              <FormField label={translate("field.eMail")} htmlFor="email" error={errors.email?.message} span={2}>
                <Input id="email" type="email" {...register("email")} />
              </FormField>
            </FormSection>
            <FormField label={translate("section.notes")} htmlFor="notes">
              <Textarea id="notes" {...register("notes")} rows={2} />
            </FormField>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <Label htmlFor="is_primary">Contact principal</Label>
              <Switch id="is_primary" checked={isPrimary} onCheckedChange={(value) => setValue("is_primary", value)} />
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
