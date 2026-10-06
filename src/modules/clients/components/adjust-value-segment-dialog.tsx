"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-section";
import { useAdjustValueSegment } from "../hooks/use-client-mutations";
import { VALUE_SEGMENT_LABELS } from "../badges";
import type { ValueSegment } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Action exceptionnelle (Doc/spec_pages_clients.md § « Ajuster le segment de
 * valeur ») : `value_segment` est normalement recalculé automatiquement —
 * cette modale ne doit jamais être présentée comme une action courante.
 */
export function AdjustValueSegmentDialog({
  open,
  onOpenChange,
  clientId,
  currentSegment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: number;
  currentSegment: ValueSegment;
}) {
  const [segment, setSegment] = useState<ValueSegment>(currentSegment);
  const mutation = useAdjustValueSegment(clientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-[26px]">
        <DialogTitle className="sr-only">{translate("t.ajusterLeSegmentDeValeur")}</DialogTitle>
        <div className="flex items-start gap-3.5">
          <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] bg-warning-bg text-warning">
            <TriangleAlert className="h-[23px] w-[23px]" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
            <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground text-pretty">{translate("t.ajusterLeSegmentDeValeur")}</p>
            <p className="text-[13.5px] leading-[1.55] text-muted-foreground text-pretty">
              Cette valeur est normalement recalculée automatiquement à partir du chiffre d&apos;affaires cumulé. Réservez cette action au débogage.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <FormField label={translate("ph.segment")} htmlFor="value_segment">
            <Select value={segment} onValueChange={(value) => setSegment(value as ValueSegment)}>
              <SelectTrigger id="value_segment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VALUE_SEGMENT_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(segment, { onSuccess: () => onOpenChange(false) })}
          >{translate("action.confirm")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
