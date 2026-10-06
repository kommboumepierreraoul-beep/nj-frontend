import type { ExportRow } from "@/lib/export";
import { formatDate } from "@/lib/format";
import { RFQ_STATUS_LABELS } from "./badges";
import type { Rfq } from "./types";

/** Doc/design_system_maquette_complete.md § 4.7 — export de la liste RFQ filtrée. */
export function buildRfqListRows(rfqs: Rfq[]): ExportRow[] {
  const rows: ExportRow[] = [
    ["DEMANDES DE PRIX", `généré le ${formatDate(new Date())}`],
    [],
    ["Référence", "Statut", "Date de demande", "Réponse attendue", "Articles", "Fournisseurs sollicités"],
  ];

  for (const rfq of rfqs) {
    rows.push([
      rfq.reference,
      RFQ_STATUS_LABELS[rfq.status],
      formatDate(rfq.request_date),
      rfq.expected_response_date ? formatDate(rfq.expected_response_date) : "",
      rfq.items_count ?? 0,
      rfq.suppliers_count ?? 0,
    ]);
  }

  rows.push([]);
  rows.push(["TOTAL", `${rfqs.length} RFQ`]);
  return rows;
}
