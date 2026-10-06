"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { clientContactSchema, type ClientContactSchema } from "../schemas/client-contact.schema";
import { useCreateClientContact, useUpdateClientContact } from "../hooks/use-client-contacts";
import { useContactChannels } from "../hooks/use-contact-channels";
import type { ClientContact } from "../types";
import { translate } from "@/i18n/translate";

export function ClientContactFormDialog({
  open,
  onOpenChange,
  clientId,
  contact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: number;
  contact?: ClientContact | null;
}) {
  const isEdit = Boolean(contact);
  const channels = useContactChannels();
  const createMutation = useCreateClientContact(clientId);
  const updateMutation = useUpdateClientContact(clientId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ClientContactSchema>({
    resolver: zodResolver(clientContactSchema),
    defaultValues: { value: "", label: "", is_preferred: false },
  });

  useEffect(() => {
    if (open) {
      reset(
        contact
          ? { channel_type_id: contact.channel_type.id, value: contact.value, label: contact.label ?? "", is_preferred: contact.is_preferred }
          : { value: "", label: "", is_preferred: false },
      );
    }
  }, [open, contact, reset]);

  const isPreferred = watch("is_preferred");

  function onSubmit(values: ClientContactSchema) {
    const payload = { ...values, label: values.label || undefined };
    if (isEdit && contact) {
      updateMutation.mutate({ contactId: contact.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier le contact" : "Nouveau contact"} pending={isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormField label={translate("field.canal")} htmlFor="channel_type_id" required error={errors.channel_type_id?.message}>
              <Controller
                control={control}
                name="channel_type_id"
                render={({ field }) => (
                  <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(Number(value))}>
                    <SelectTrigger id="channel_type_id">
                      <SelectValue placeholder={translate("ph.selectionnerUnCanal")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(channels.data ?? [])
                        .filter((channel) => channel.is_active)
                        .map((channel) => (
                          <SelectItem key={channel.id} value={String(channel.id)}>
                            {channel.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label={translate("field.valeur")} htmlFor="value" required error={errors.value?.message}>
              <Input id="value" {...register("value")} placeholder={translate("ph.emailExempleComOu237")} />
            </FormField>
            <FormField label={translate("field.precision")} htmlFor="label">
              <Input id="label" {...register("label")} placeholder={translate("ph.bureauPersonnel")} />
            </FormField>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <Label htmlFor="is_preferred">{translate("t.contactPrefere")}</Label>
              <Switch id="is_preferred" checked={isPreferred} onCheckedChange={(value) => setValue("is_preferred", value)} />
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
