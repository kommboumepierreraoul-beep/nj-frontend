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
import { contactChannelSchema, type ContactChannelSchema } from "../schemas/contact-channel.schema";
import { useCreateContactChannel, useUpdateContactChannel } from "../hooks/use-contact-channels";
import { CHANNEL_ICON_OPTIONS, getChannelIcon } from "@/config/channel-icons";
import type { ContactChannelType } from "../types";
import { translate } from "@/i18n/translate";

export function ContactChannelFormDialog({
  open,
  onOpenChange,
  channel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel?: ContactChannelType | null;
}) {
  const isEdit = Boolean(channel);
  const createMutation = useCreateContactChannel();
  const updateMutation = useUpdateContactChannel();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ContactChannelSchema>({
    resolver: zodResolver(contactChannelSchema),
    defaultValues: { code: "", label: "", icon: "chat", is_active: true },
  });

  useEffect(() => {
    if (open) {
      reset(
        channel
          ? { code: channel.code, label: channel.label, icon: channel.icon || "chat", is_active: channel.is_active }
          : { code: "", label: "", icon: "chat", is_active: true },
      );
    }
  }, [open, channel, reset]);

  const isActive = watch("is_active");

  function onSubmit(values: ContactChannelSchema) {
    const payload = values;
    if (isEdit && channel) {
      updateMutation.mutate({ id: channel.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier le canal" : "Nouveau canal"} pending={isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormField label={translate("field.code")} htmlFor="code" required error={errors.code?.message}>
              <Input id="code" {...register("code")} disabled={isEdit} placeholder="FACEBOOK" />
            </FormField>
            <FormField label={translate("field.libelle")} htmlFor="label" required error={errors.label?.message}>
              <Input id="label" {...register("label")} placeholder="Facebook" />
            </FormField>
            <FormField label={translate("field.icone")} htmlFor="icon" error={errors.icon?.message}>
              <Controller
                control={control}
                name="icon"
                render={({ field }) => (
                  <Select value={field.value || "chat"} onValueChange={field.onChange}>
                    <SelectTrigger id="icon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNEL_ICON_OPTIONS.map((option) => {
                        const OptionIcon = getChannelIcon(option.value);
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <OptionIcon className="h-3.5 w-3.5" />
                              {option.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <Label htmlFor="is_active">Canal actif</Label>
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
