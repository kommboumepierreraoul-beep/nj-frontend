"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import type { ExportFormat } from "@/lib/export";
import { translate } from "@/i18n/translate";

export interface ExportToggleOption {
  key: string;
  label: string;
  help?: string;
  defaultChecked?: boolean;
}

/**
 * Doc/design_system_maquette_complete.md § 4.7 « Export » — même dialogue
 * (format + options à inclure) réutilisé pour chaque liste/document qui
 * expose un export : Commandes (liste et bon de commande), Paiements.
 * Le fichier lui-même est généré par `onSubmit` via `exportRows()` (src/lib/
 * export.ts) à partir des lignes déjà chargées côté appelant — ce composant
 * ne fait que collecter le format et les options.
 */
export function ExportDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  note,
  options = [],
  defaultFormat = "PDF",
  submitLabel = translate("t.genererLeFichier"),
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  note?: string;
  options?: ExportToggleOption[];
  defaultFormat?: ExportFormat;
  submitLabel?: string;
  isPending?: boolean;
  onSubmit: (format: ExportFormat, values: Record<string, boolean>) => void;
}) {
  const [format, setFormat] = useState<ExportFormat>(defaultFormat);
  const [values, setValues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    setFormat(defaultFormat);
    setValues(Object.fromEntries(options.map((option) => [option.key, option.defaultChecked ?? false])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultFormat]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <div className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={title} subtitle={subtitle} pending={isPending} />
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {note ? <p className="rounded-md border border-border-2 bg-background/40 px-3 py-2 text-xs text-muted-foreground">{note}</p> : null}

            <FormField label="Format" htmlFor="export-format" required>
              <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
                <SelectTrigger id="export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF — document mis en page</SelectItem>
                  <SelectItem value="XLSX">Excel (.xls) — tableau exploitable</SelectItem>
                  <SelectItem value="CSV">{translate("t.csvSeparateurPointVirgule")}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {options.map((option) => (
              <div key={option.key} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5">
                <div className="flex flex-col gap-0.5 pr-2">
                  <Label htmlFor={`export-${option.key}`}>{option.label}</Label>
                  {option.help ? <p className="text-xs text-muted-foreground">{option.help}</p> : null}
                </div>
                <Switch
                  id={`export-${option.key}`}
                  checked={values[option.key] ?? false}
                  onCheckedChange={(checked) => setValues((prev) => ({ ...prev, [option.key]: checked }))}
                />
              </div>
            ))}
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="button" disabled={isPending} onClick={() => onSubmit(format, values)}>
              {submitLabel}
            </Button>
          </DialogFormFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
