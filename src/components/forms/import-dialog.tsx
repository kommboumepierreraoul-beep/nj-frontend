"use client";

import { useRef, useState } from "react";
import { Download, FileUp, Upload } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { buildTemplateCsv, downloadTextFile, parseCsv, toRecords, type CsvColumnSpec, type MappedRecord } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { translate } from "@/i18n/translate";

export type { CsvColumnSpec } from "@/lib/csv";

export interface ImportRowError {
  line: number;
  message: string;
}

/**
 * Dialogue « Importer » générique, réutilisé par les en-têtes de liste
 * (Produits, Clients, Fournisseurs — pendant du bouton « Exporter », cf.
 * Doc/design_system_maquette_complete.md § 4.7 et NJ Global Trade Template).
 * Aucun endpoint d'import en masse côté backend : chaque ligne est créée via
 * `createOne` (l'API `create` existante du module), séquentiellement, avec un
 * rapport d'erreurs ligne par ligne. Le fichier ne quitte pas le navigateur.
 */
export function ImportDialog({
  open,
  onOpenChange,
  title,
  entityLabel,
  columns,
  templateName,
  createOne,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Ex. « produit(s) », pour les messages de résumé. */
  entityLabel: string;
  columns: CsvColumnSpec[];
  /** Nom du fichier modèle téléchargeable (sans extension). */
  templateName: string;
  createOne: (values: Record<string, string>) => Promise<void>;
  onDone?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [records, setRecords] = useState<MappedRecord[]>([]);
  const [unknownHeaders, setUnknownHeaders] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<ImportRowError[]>([]);
  const [done, setDone] = useState<{ ok: number; failed: number } | null>(null);

  // Réinitialisation à la fermeture plutôt que dans un effet (règle
  // react-hooks/set-state-in-effect) : ce dialogue est toujours monté, on repart
  // d'un état propre à chaque ouverture.
  function handleOpenChange(next: boolean) {
    if (!next && !running) {
      setFileName(null);
      setRecords([]);
      setUnknownHeaders([]);
      setParseError(null);
      setProgress(0);
      setErrors([]);
      setDone(null);
    }
    onOpenChange(next);
  }

  const importable = records.filter((r) => r.missing.length === 0);
  const invalidCount = records.length - importable.length;

  async function handleFile(file: File) {
    setParseError(null);
    setDone(null);
    setErrors([]);
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (parsed.headers.length === 0) {
        setParseError("Le fichier est vide ou illisible.");
        return;
      }
      const mapped = toRecords(parsed, columns);
      if (mapped.records.length === 0) {
        setParseError(translate("t.aucuneLigneDeDonneesApresLEnTete"));
        return;
      }
      setFileName(file.name);
      setRecords(mapped.records);
      setUnknownHeaders(mapped.unknownHeaders);
    } catch {
      setParseError("Lecture du fichier impossible.");
    }
  }

  async function run() {
    setRunning(true);
    setProgress(0);
    const collected: ImportRowError[] = [];
    let ok = 0;
    for (let i = 0; i < importable.length; i += 1) {
      const record = importable[i];
      try {
        await createOne(record.values);
        ok += 1;
      } catch (error) {
        collected.push({ line: record.line, message: error instanceof Error ? error.message : translate("t.creationRefusee") });
      }
      setProgress(Math.round(((i + 1) / importable.length) * 100));
    }
    setErrors(collected);
    setDone({ ok, failed: collected.length });
    setRunning(false);
    if (ok > 0) onDone?.();
  }

  const previewColumns = columns.slice(0, 6);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[720px] p-0">
        <div className="flex max-h-[86vh] flex-col">
          <DialogFormHeader
            title={title}
            subtitle={translate("t.importCsvSeparateurPointVirguleOuVirguleChaqueLign")}
            pending={running}
          />

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleFile(file);
                  event.target.value = "";
                }}
              />
              <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={running}>
                <FileUp className="h-4 w-4" />
                {fileName ? "Choisir un autre fichier" : "Choisir un fichier CSV"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => downloadTextFile(`${templateName}.csv`, "text/csv;charset=utf-8", buildTemplateCsv(columns))}
              >
                <Download className="h-4 w-4" />
                Télécharger un modèle
              </Button>
              {fileName ? <span className="text-xs text-muted-foreground">{fileName}</span> : null}
            </div>

            <div className="rounded-md border border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
              Colonnes attendues :{" "}
              {columns.map((c, i) => (
                <span key={c.field}>
                  {i > 0 ? " · " : ""}
                  <span className="font-medium text-foreground">{c.label}</span>
                  {c.required ? " (obligatoire)" : ""}
                </span>
              ))}
            </div>

            {parseError ? <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">{parseError}</p> : null}

            {unknownHeaders.length > 0 ? (
              <p className="rounded-md border border-border-2 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                Colonnes ignorées (non reconnues) : {unknownHeaders.join(", ")}
              </p>
            ) : null}

            {records.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span className="font-medium text-foreground">{records.length} ligne(s) lue(s)</span>
                  <span className="text-success">{importable.length} prête(s)</span>
                  {invalidCount > 0 ? <span className="text-destructive">{invalidCount} incomplète(s) (ignorée(s))</span> : null}
                </div>

                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-subtle">
                      <tr>
                        <th className="px-2.5 py-2 font-semibold text-muted-foreground">Ligne</th>
                        {previewColumns.map((c) => (
                          <th key={c.field} className="px-2.5 py-2 font-semibold text-muted-foreground">
                            {c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {records.slice(0, 12).map((record) => (
                        <tr key={record.line} className={cn("border-t border-border", record.missing.length > 0 && "bg-destructive/5")}>
                          <td className="px-2.5 py-1.5 text-muted-foreground">{record.line}</td>
                          {previewColumns.map((c) => (
                            <td key={c.field} className="px-2.5 py-1.5">
                              {record.values[c.field] || <span className="text-text-quaternary">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {records.length > 12 ? <p className="text-[11px] text-text-quaternary">… et {records.length - 12} autre(s) ligne(s).</p> : null}
              </div>
            ) : null}

            {running ? (
              <div className="space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-bg">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">Création en cours… {progress}%</p>
              </div>
            ) : null}

            {done ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {done.ok} {entityLabel} créé(s){done.failed > 0 ? `, ${done.failed} en échec` : ""}.
                </p>
                {errors.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    {errors.map((error) => (
                      <div key={error.line}>
                        Ligne {error.line} : {error.message}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={running}>
              {done ? "Fermer" : "Annuler"}
            </Button>
            {!done ? (
              <Button type="button" onClick={run} disabled={running || importable.length === 0}>
                <Upload className="h-4 w-4" />
                Importer {importable.length > 0 ? `${importable.length} ligne(s)` : ""}
              </Button>
            ) : null}
          </DialogFormFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
