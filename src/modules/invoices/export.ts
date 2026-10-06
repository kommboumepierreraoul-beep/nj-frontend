import type { ExportRow } from "@/lib/export";
import { formatDate, formatDateTime } from "@/lib/format";
import { INVOICE_DOCUMENT_TYPE_LABELS, INVOICE_STATUS_LABELS } from "./badges";
import type { Invoice } from "./types";

/**
 * Doc/design_system_maquette_complete.md § 4.7 — export du registre des
 * documents filtré (mêmes filtres qu'à l'écran, sans pagination).
 */
export function buildInvoicesListRows(invoices: Invoice[]): ExportRow[] {
  const rows: ExportRow[] = [
    ["REGISTRE DES DOCUMENTS", `généré le ${formatDate(new Date())}`],
    [],
    ["Numéro", "Type", "Version", "Statut", "Client", "Commande", "Montant", "Devise", "Émis le", "Émetteur", "Envoyé le"],
  ];

  for (const invoice of invoices) {
    rows.push([
      invoice.invoice_number,
      INVOICE_DOCUMENT_TYPE_LABELS[invoice.document_type],
      invoice.document_type === "PROFORMA" && invoice.version ? `v${invoice.version}` : "",
      INVOICE_STATUS_LABELS[invoice.status],
      invoice.client?.full_name ?? invoice.client_name ?? "",
      `#${invoice.sales_order_id}`,
      invoice.document_type === "AVOIR" ? -Number(invoice.total_amount) : Number(invoice.total_amount),
      invoice.currency.code,
      formatDateTime(invoice.issued_at),
      invoice.issued_by?.name ?? "",
      invoice.sent_at ? formatDateTime(invoice.sent_at) : "",
    ]);
  }

  rows.push([]);
  rows.push(["TOTAL", `${invoices.length} document(s)`]);
  return rows;
}
