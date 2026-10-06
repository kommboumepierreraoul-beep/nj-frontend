"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ban } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-section";
import { blacklistSupplierSchema, type BlacklistSupplierSchema } from "../schemas/supplier.schema";
import { useBlacklistSupplier } from "../hooks/use-supplier-mutations";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_fournisseurs.md § 1 — action « Liste noire ». */
export function BlacklistSupplierDialog({
  open,
  onOpenChange,
  supplierId,
  currentlyBlacklisted,
  currentReason,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: number;
  currentlyBlacklisted: boolean;
  currentReason: string | null;
}) {
  const mutation = useBlacklistSupplier(supplierId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlacklistSupplierSchema>({
    resolver: zodResolver(blacklistSupplierSchema),
    defaultValues: { is_blacklisted: currentlyBlacklisted, blacklist_reason: currentReason ?? "" },
  });

  useEffect(() => {
    if (open) reset({ is_blacklisted: currentlyBlacklisted, blacklist_reason: currentReason ?? "" });
  }, [open, currentlyBlacklisted, currentReason, reset]);

  const isBlacklisted = watch("is_blacklisted");

  function onSubmit(values: BlacklistSupplierSchema) {
    mutation.mutate({ ...values, blacklist_reason: values.blacklist_reason || undefined }, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-[26px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogTitle className="sr-only">Liste noire</DialogTitle>
          <div className="flex items-start gap-3.5">
            <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] bg-destructive-bg text-destructive">
              <Ban className="h-[23px] w-[23px]" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
              <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground text-pretty">Liste noire</p>
              <DialogDescription className="text-[13.5px] leading-[1.55] text-muted-foreground text-pretty">
                Marquer ce fournisseur comme blacklisté empêche toute nouvelle commande tant que le statut n&apos;est pas levé.
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <Label htmlFor="is_blacklisted">Fournisseur en liste noire</Label>
            <Switch id="is_blacklisted" checked={isBlacklisted} onCheckedChange={(value) => setValue("is_blacklisted", value)} />
          </div>
          {isBlacklisted ? (
            <FormField label={translate("field.motif")} htmlFor="blacklist_reason" required error={errors.blacklist_reason?.message}>
              <Textarea id="blacklist_reason" {...register("blacklist_reason")} rows={3} />
            </FormField>
          ) : null}
          <div className="mt-6 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={mutation.isPending}>{translate("action.confirm")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
