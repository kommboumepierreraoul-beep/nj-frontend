"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { supplierCommunicationLogSchema, type SupplierCommunicationLogSchema } from "../schemas/supplier-communication-log.schema";
import { useCreateSupplierCommunicationLog } from "../hooks/use-supplier-communication-logs";
import { useAttachments } from "@/modules/attachments/hooks/use-attachments";
import { COMMUNICATION_CHANNEL_LABELS, COMMUNICATION_DIRECTION_LABELS } from "../badges";
import { translate } from "@/i18n/translate";

const NONE = "__none__";

export function CommunicationLogFormDialog({ open, onOpenChange, supplierId }: { open: boolean; onOpenChange: (open: boolean) => void; supplierId: number }) {
  const attachmentsQuery = useAttachments("supplier", supplierId);
  const createMutation = useCreateSupplierCommunicationLog(supplierId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SupplierCommunicationLogSchema>({
    resolver: zodResolver(supplierCommunicationLogSchema),
    defaultValues: { channel: "EMAIL", direction: "OUTGOING", summary: "", occurred_at: new Date().toISOString().slice(0, 16) },
  });

  useEffect(() => {
    if (open) reset({ channel: "EMAIL", direction: "OUTGOING", summary: "", occurred_at: new Date().toISOString().slice(0, 16) });
  }, [open, reset]);

  function onSubmit(values: SupplierCommunicationLogSchema) {
    createMutation.mutate({ ...values, subject: values.subject || undefined }, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={translate("form.head.nouvelleEntreeDeCommunication")} pending={createMutation.isPending} />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.canal")} htmlFor="channel">
                <Controller
                  control={control}
                  name="channel"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="channel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COMMUNICATION_CHANNEL_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("ph.sens")} htmlFor="direction">
                <Controller
                  control={control}
                  name="direction"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="direction">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COMMUNICATION_DIRECTION_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.sujet")} htmlFor="subject" span={2}>
                <Input id="subject" {...register("subject")} />
              </FormField>
              <FormField label={translate("field.dateHeure")} htmlFor="occurred_at" required error={errors.occurred_at?.message}>
                <Input id="occurred_at" type="datetime-local" {...register("occurred_at")} />
              </FormField>
              <FormField label={translate("field.pieceJointeOptionnelle")} htmlFor="attachment_id">
                <Controller
                  control={control}
                  name="attachment_id"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : NONE} onValueChange={(value) => field.onChange(value === NONE ? undefined : Number(value))}>
                      <SelectTrigger id="attachment_id">
                        <SelectValue placeholder={translate("ph.aucune")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>{translate("t.aucune")}</SelectItem>
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
            </FormSection>
            <FormField label={translate("field.resume")} htmlFor="summary" required error={errors.summary?.message}>
              <Textarea id="summary" {...register("summary")} rows={3} />
            </FormField>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={createMutation.isPending}>{translate("action.add")}</Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
