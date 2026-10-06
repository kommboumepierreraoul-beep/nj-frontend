import type { ExportRow } from "@/lib/export";
import { formatDate, formatDateTime } from "@/lib/format";
import { BILLING_MODE_LABELS } from "@/modules/clients/badges";
import {
  PAYMENT_DIRECTION_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  SALES_ORDER_ITEM_TYPE_LABELS,
  SALES_ORDER_STATUS_LABELS,
  SALES_ORDER_TYPE_LABELS,
  TRANSPORT_MODE_LABELS,
} from "./badges";
import type { SalesOrder, SalesOrderItem, SalesOrderPayment, SalesOrderPaymentCurrencyTotal, SalesOrderPaymentWithOrder, SalesOrderStatusHistoryEntry } from "./types";

/**
 * Doc/design_system_maquette_complete.md § 4.7 « Export » — export de la liste
 * des commandes, « reprend exactement les filtres actifs » : `orders` est déjà
 * le résultat filtré côté appelant (mêmes filtres que la liste à l'écran, sans
 * pagination — voir l'appel dans sales-orders/page.tsx). N'inclut pas de
 * colonne Encaissé/Reste dû par ligne (contrairement au mockup, qui lit des
 * données 100% en mémoire) : la calculer ici exigerait un appel API par
 * commande exportée, un coût qui grandit avec le volume — seul le total
 * (déjà sur la ressource commande) est repris.
 */
export function buildSalesOrdersListRows(orders: SalesOrder[], withTotals: boolean): ExportRow[] {
  const rows: ExportRow[] = [
    ["LISTE DES COMMANDES", `généré le ${formatDate(new Date())}`],
    [],
    ["Référence", "Client", "Type", "Statut", "Statut de paiement", "Total", "Devise", "Date de commande", "Validité"],
  ];

  for (const order of orders) {
    rows.push([
      order.reference,
      order.client.full_name,
      SALES_ORDER_TYPE_LABELS[order.type],
      SALES_ORDER_STATUS_LABELS[order.status],
      PAYMENT_STATUS_LABELS[order.payment_status],
      order.total_amount,
      order.currency.code,
      formatDate(order.order_date),
      order.valid_until ? formatDate(order.valid_until) : "—",
    ]);
  }

  if (withTotals) {
    rows.push([]);
    rows.push(["TOTAUX PAR DEVISE", "Total"]);
    const byCurrency = new Map<string, number>();
    for (const order of orders) {
      byCurrency.set(order.currency.code, (byCurrency.get(order.currency.code) ?? 0) + order.total_amount);
    }
    for (const [code, total] of byCurrency) {
      rows.push([code, total]);
    }
  }

  return rows;
}

function itemDesignation(item: SalesOrderItem): string {
  if (item.product_variant) return `${item.product_variant.sku} — ${item.product_variant.name}`;
  return item.label || item.description || "—";
}

/**
 * Export d'un « bon de commande » (une commande précise), sections optionnelles
 * selon les cases cochées dans `ExportDialog` (NJ Global Trade Commandes.dc.html,
 * dialogue « export »). `payments` est toujours fourni (nécessaire aux lignes
 * « Encaissé »/« Reste dû », affichées inconditionnellement, comme dans le
 * mockup) — seule sa section détaillée « ENCAISSEMENTS » dépend de
 * `scope_payments`.
 */
export function buildSalesOrderExportRows(
  order: SalesOrder,
  items: SalesOrderItem[],
  payments: SalesOrderPayment[],
  history: SalesOrderStatusHistoryEntry[],
  options: { scope_items: boolean; scope_payments: boolean; scope_history: boolean; scope_commission: boolean; only_selected: boolean },
): ExportRow[] {
  const rows: ExportRow[] = [];
  rows.push(["BON DE COMMANDE", order.reference]);
  rows.push(["Client", order.client.full_name]);
  rows.push(["Type", SALES_ORDER_TYPE_LABELS[order.type]]);
  rows.push(["Statut", SALES_ORDER_STATUS_LABELS[order.status]]);
  rows.push(["Statut de paiement", PAYMENT_STATUS_LABELS[order.payment_status]]);
  rows.push(["Date de commande", formatDate(order.order_date)]);
  rows.push(["Valide jusqu'au", order.valid_until ? formatDate(order.valid_until) : "—"]);
  rows.push(["Mode de facturation", BILLING_MODE_LABELS[order.billing_mode]]);
  rows.push([
    "Transport",
    `${TRANSPORT_MODE_LABELS[order.transport_mode]}${order.carrier_name ? ` · ${order.carrier_name}` : ""}${order.tracking_number ? ` · ${order.tracking_number}` : ""}`,
  ]);
  rows.push([]);

  if (options.scope_items) {
    rows.push(["LIGNES"]);
    rows.push(["Type", "Désignation", "Quantité", "Prix unitaire", "Remise", "Sous-total", "Retenue"]);
    items
      .filter((item) => !options.only_selected || item.is_selected)
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach((item) => {
        rows.push([
          SALES_ORDER_ITEM_TYPE_LABELS[item.item_type],
          itemDesignation(item),
          item.quantity,
          item.unit_price,
          item.discount_amount || 0,
          item.quantity * item.unit_price - (item.discount_amount || 0),
          item.is_selected ? "oui" : "non",
        ]);
      });
    rows.push([]);
  }

  const activePayments = payments.filter((payment) => !payment.is_voided);
  const paid =
    activePayments.filter((p) => p.direction === "ENCAISSEMENT").reduce((sum, p) => sum + p.amount, 0) -
    activePayments.filter((p) => p.direction === "REMBOURSEMENT").reduce((sum, p) => sum + p.amount, 0);

  rows.push(["MONTANTS", "", order.currency.code]);
  rows.push(["Sous-total", order.subtotal_amount]);
  rows.push(["Remise globale", order.discount_amount || 0]);
  if (options.scope_commission && order.commission_amount !== null) {
    const rateLabel = order.commission_type === "FORFAIT" ? "forfait" : `${order.commission_rate_applied ?? 0} %`;
    rows.push([`Commission (${rateLabel})`, order.commission_amount]);
    rows.push(["Barème de commission", order.commission_rule?.label ?? "—"]);
  }
  rows.push(["Total", order.total_amount]);
  rows.push(["Encaissé", paid]);
  rows.push(["Reste dû", Math.max(0, order.total_amount - paid - order.credited_amount)]);
  rows.push([]);

  if (options.scope_payments && payments.length > 0) {
    rows.push(["ENCAISSEMENTS"]);
    rows.push(["Date", "Montant", "Devise", "Méthode", "Référence externe", "N° de reçu", "Statut"]);
    payments.forEach((payment) => {
      rows.push([
        formatDateTime(payment.paid_at),
        payment.amount,
        payment.currency.code,
        PAYMENT_METHOD_LABELS[payment.payment_method],
        payment.external_reference ?? "",
        payment.receipt_number,
        payment.is_voided ? `annulé — ${payment.voided_reason ?? ""}` : "actif",
      ]);
    });
    rows.push([]);
  }

  if (options.scope_history && history.length > 0) {
    rows.push(["HISTORIQUE DE STATUT"]);
    rows.push(["Date", "Transition", "Auteur", "Motif"]);
    history.forEach((entry) => {
      rows.push([
        formatDateTime(entry.created_at),
        `${entry.previous_status ? SALES_ORDER_STATUS_LABELS[entry.previous_status] : "Création"} → ${SALES_ORDER_STATUS_LABELS[entry.new_status]}`,
        entry.changed_by?.name ?? "",
        entry.reason ?? "",
      ]);
    });
  }

  return rows;
}

/**
 * Export du registre transverse des paiements (§ 4.7) — mêmes lignes que le
 * tableau à l'écran (paiements/page.tsx), plus la section « TOTAUX PAR DEVISE »
 * déjà calculée côté serveur (`meta.totals_by_currency`, SalesOrderPaymentController::
 * indexGlobal()) plutôt que recalculée ici : évite de dupliquer une logique de
 * total qui doit rester en un seul endroit (voir le commentaire de cette route
 * sur le mélange de devises).
 */
export function buildPaymentRegistryRows(payments: SalesOrderPaymentWithOrder[], totalsByCurrency: SalesOrderPaymentCurrencyTotal[]): ExportRow[] {
  const rows: ExportRow[] = [
    ["MOUVEMENTS DE TRÉSORERIE", `généré le ${formatDate(new Date())}`],
    [],
    ["Sens", "Montant", "Devise", "Méthode", "Référence externe", "N° de reçu", "Client", "Commande", "Date", "Statut"],
  ];

  for (const payment of payments) {
    rows.push([
      PAYMENT_DIRECTION_LABELS[payment.direction],
      payment.direction === "REMBOURSEMENT" ? -payment.amount : payment.amount,
      payment.currency.code,
      PAYMENT_METHOD_LABELS[payment.payment_method],
      payment.external_reference ?? "",
      payment.receipt_number,
      payment.sales_order.client?.full_name ?? "",
      payment.sales_order.reference,
      formatDateTime(payment.paid_at),
      payment.is_voided ? `annulé — ${payment.voided_reason ?? ""}` : "actif",
    ]);
  }

  if (totalsByCurrency.length > 0) {
    rows.push([]);
    rows.push(["TOTAUX PAR DEVISE", "Encaissé brut", "Remboursé", "Net encaissé"]);
    for (const total of totalsByCurrency) {
      rows.push([total.currency_code, total.gross_collected, total.total_refunded, total.net]);
    }
  }

  return rows;
}
