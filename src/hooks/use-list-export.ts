"use client";

import { useState } from "react";
import { toast } from "sonner";
import { exportRows, exportStamp, type ExportFormat, type ExportRow } from "@/lib/export";
import { ApiError } from "@/lib/http/api-error";
import { translate } from "@/i18n/translate";

/**
 * Boîte à outils commune du bouton « Exporter » des en-têtes de liste
 * (Doc/design_system_maquette_complete.md § 4.7). Chaque liste passe :
 *  - `fetchAll` : recharge la liste filtrée sans pagination (`per_page` large,
 *    même arbitrage que sales-orders/page.tsx — pas d'endpoint d'export dédié) ;
 *  - `buildRows` : transforme le tableau en lignes prêtes pour `exportRows`.
 * Le composant `<ExportDialog>` appelle `run(format)`.
 */
export function useListExport<T>({
  fetchAll,
  buildRows,
  fileBase,
  title,
  entityLabel,
}: {
  fetchAll: () => Promise<T[]>;
  buildRows: (rows: T[]) => ExportRow[];
  fileBase: string;
  title: string;
  entityLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  async function run(format: ExportFormat) {
    setIsExporting(true);
    try {
      const rows = await fetchAll();
      const ok = exportRows(format, `${fileBase}-${exportStamp()}`, title, buildRows(rows));
      if (!ok) {
        toast.error(translate("t.leNavigateurABloqueLaFenetreAutorisezLesPopUps"));
        return;
      }
      toast.success(`Export ${format} généré — ${rows.length} ${entityLabel}.`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Export impossible.");
    } finally {
      setIsExporting(false);
    }
  }

  return { open, setOpen, isExporting, run };
}
