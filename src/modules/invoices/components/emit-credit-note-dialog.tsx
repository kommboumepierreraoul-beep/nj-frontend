"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { creditNoteSchema, type CreditNoteSchema } from "../schemas/credit-note.schema";
import { useEmitCreditNote } from "../hooks/use-invoice-mutations";
import { useInvoice } from "../hooks/use-invoice";
import { DocumentLanguageSelect, type DocumentLanguageChoice } from "./document-language-select";
import { formatCurrency } from "@/lib/format";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_factures.md § 1.3 « Émettre un avoir » — accessible depuis
 * une ligne PROFORMA/FACTURE `EMISE` uniquement (jamais sur un AVOIR ni une
 * ligne `REMPLACEE`, filtré côté appelant). Avoir total par défaut (aucun
 * `items` envoyé) ; avoir partiel = lignes cochées avec quantité éditable,
 * plafonnée côté serveur à la quantité d'origine.
 */
export function EmitCreditNoteDialog({
  open,
  onOpenChange,
  salesOrderId,
  invoiceId,
  currencyCode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesOrderId: number;
  invoiceId: number | null;
  currencyCode: string;
}) {
  const invoiceQuery = useInvoice(invoiceId ?? undefined);
  const mutation = useEmitCreditNote(salesOrderId);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [language, setLanguage] = useState<DocumentLanguageChoice>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<CreditNoteSchema>({ resolver: zodResolver(creditNoteSchema), defaultValues: { mode: "TOTAL" } });

  useEffect(() => {
    if (open) {
      reset({ mode: "TOTAL" });
      setChecked({});
    }
  }, [open, reset]);

  const mode = watch("mode");
  const items = invoiceQuery.data?.items ?? [];

  function onSubmit(values: CreditNoteSchema) {
    if (!invoiceId) return;
    const languagePart = language ? { language } : {};
    if (values.mode === "TOTAL") {
      mutation.mutate({ invoiceId, payload: { reason: values.reason || undefined, ...languagePart } }, { onSuccess: () => onOpenChange(false) });
      return;
    }
    const selectedIds = Object.entries(checked)
      .filter(([, isChecked]) => isChecked)
      .map(([id]) => Number(id));
    const payloadItems = selectedIds.map((itemId) => {
      const quantityValue = (values as unknown as Record<string, string>)[`quantity_${itemId}`];
      return { invoice_item_id: itemId, quantity: quantityValue ? Number(quantityValue) : undefined };
    });
    mutation.mutate({ invoiceId, payload: { items: payloadItems, reason: values.reason || undefined, ...languagePart } }, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader
            title={translate("form.head.emettreUnAvoir")}
            subtitle={translate("t.laCommissionDOrigineResteDueIntegralementUnAvoirNeLaMo")}
            pending={mutation.isPending}
          />
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="flex gap-2">
              <Button type="button" variant={mode === "TOTAL" ? "default" : "outline"} size="sm" onClick={() => setValue("mode", "TOTAL")}>
                Avoir total
              </Button>
              <Button type="button" variant={mode === "PARTIEL" ? "default" : "outline"} size="sm" onClick={() => setValue("mode", "PARTIEL")}>
                Avoir partiel
              </Button>
            </div>

            {invoiceQuery.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="space-y-2 rounded-md border border-border bg-background/40 p-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    {mode === "PARTIEL" ? (
                      <Checkbox
                        checked={checked[item.id] ?? false}
                        onCheckedChange={(value) => setChecked((prev) => ({ ...prev, [item.id]: Boolean(value) }))}
                      />
                    ) : null}
                    <span className="flex-1">{item.label}</span>
                    <span className="text-muted-foreground">{item.quantity} × {formatCurrency(item.unit_price, currencyCode)}</span>
                    {mode === "PARTIEL" && checked[item.id] ? (
                      <Input
                        type="number"
                        step="0.01"
                        min={0.01}
                        placeholder={String(item.quantity)}
                        className="w-24"
                        {...register(`quantity_${item.id}` as `reason`)}
                      />
                    ) : null}
                  </div>
                ))}
                {items.length === 0 ? <p className="text-sm text-muted-foreground">{translate("misc.aucuneLigneSurCeDocument")}</p> : null}
              </div>
            )}

            <FormField label={translate("field.motif")} htmlFor="reason">
              <Textarea id="reason" {...register("reason")} rows={2} placeholder={translate("ph.exRetourMarchandiseErreurDeFacturation")} />
            </FormField>
          </div>
          <DialogFormFooter className="justify-between">
            <DocumentLanguageSelect value={language} onChange={setLanguage} disabled={mutation.isPending} />
            <div className="flex gap-2.5">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {translate("t.confirmerLAvoir")}
              </Button>
            </div>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
