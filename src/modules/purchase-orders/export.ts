import type { ExportRow } from "@/lib/export";
import { formatDate } from "@/lib/format";
import { PURCHASE_ORDER_STATUS_LABELS } from "./badges";
import type { PurchaseOrder } from "./types";

/** Doc/design_system_maquette_complete.md § 4.7 — export de la liste des commandes fournisseurs filtrée. */
export function buildPurchaseOrdersListRows(orders: PurchaseOrder[]): ExportRow[] {
  const rows: ExportRow[] = [
    ["COMMANDES FOURNISSEURS", `généré le ${formatDate(new Date())}`],
    [],
    ["Référence", "Fournisseur", "Statut", "Date de commande", "Livraison prévue", "Montant total", "Devise"],
  ];

  for (const order of orders) {
    rows.push([
      order.reference,
      order.supplier.company_name,
      PURCHASE_ORDER_STATUS_LABELS[order.status],
      formatDate(order.order_date),
      order.expected_delivery_date ? formatDate(order.expected_delivery_date) : "",
      order.total_amount,
      order.currency.code,
    ]);
  }

  rows.push([]);
  rows.push(["TOTAL", `${orders.length} commande(s)`]);
  return rows;
}
