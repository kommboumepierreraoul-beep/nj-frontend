"use client";

import { useState } from "react";
import { Ban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { useSalesOrderPayments, useVoidSalesOrderPayment } from "../hooks/use-sales-order-payments";
import { PAYMENT_DIRECTION_LABELS, PAYMENT_DIRECTION_TONES, PAYMENT_METHOD_LABELS } from "../badges";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { SalesOrder, SalesOrderPayment } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_commandes.md § « Onglet Paiements » — total « Net encaissé »
 * distinct du total « Encaissé brut » dès qu'une ligne REMBOURSEMENT existe,
 * pour éviter toute confusion avec le montant réellement acquis. Un paiement
 * déjà annulé ne peut pas être annulé une seconde fois (rejeté en 422).
 */
export function SalesOrderPaymentsTab({ salesOrder }: { salesOrder: SalesOrder }) {
  const query = useSalesOrderPayments(salesOrder.id);
  const voidMutation = useVoidSalesOrderPayment(salesOrder.id);
  const [formOpen, setFormOpen] = useState(false);
  const [toVoid, setToVoid] = useState<SalesOrderPayment | null>(null);

  const payments = query.data ?? [];
  const active = payments.filter((payment) => !payment.is_voided);
  const grossCollected = active.filter((payment) => payment.direction === "ENCAISSEMENT").reduce((sum, payment) => sum + payment.amount, 0);
  const refunded = active.filter((payment) => payment.direction === "REMBOURSEMENT").reduce((sum, payment) => sum + payment.amount, 0);
  const hasRefunds = refunded > 0;

  const columns: DataTableColumn<SalesOrderPayment>[] = [
    { key: "direction", header: "Sens", render: (row) => <Badge tone={PAYMENT_DIRECTION_TONES[row.direction]}>{PAYMENT_DIRECTION_LABELS[row.direction]}</Badge> },
    { key: "amount", header: "Montant", render: (row) => formatCurrency(row.amount, row.currency.code) },
    { key: "method", header: translate("col.method"), render: (row) => PAYMENT_METHOD_LABELS[row.payment_method] },
    { key: "reference", header: translate("col.externalRef"), render: (row) => row.external_reference ?? "—" },
    { key: "receipt", header: translate("col.receiptNumber"), render: (row) => row.receipt_number },
    { key: "paid_at", header: "Date", render: (row) => formatDateTime(row.paid_at) },
    {
      key: "status",
      header: "Statut",
      render: (row) => (row.is_voided ? <Badge tone="destructive">Annulé{row.voided_reason ? ` — ${row.voided_reason}` : ""}</Badge> : <Badge tone="success">{translate("t.actif")}</Badge>),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) =>
        row.is_voided ? null : (
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" title="Annuler ce mouvement" onClick={() => setToVoid(row)}>
              <Ban className="h-4 w-4" />
            </Button>
          </div>
        ),
    },
  ];

  const net = grossCollected - refunded;
  const remaining = Math.max(0, salesOrder.total_amount - net - salesOrder.credited_amount);
  /** Doc/spec_pages_commandes.md § « Onglet Paiements » — même formule de rappel que la maquette (NJ Global Trade Commandes.dc.html lignes 1871-1876). */
  const hint =
    (hasRefunds
      ? `Encaissé brut ${formatCurrency(grossCollected, salesOrder.currency.code)} − remboursé ${formatCurrency(refunded, salesOrder.currency.code)} = net encaissé ${formatCurrency(net, salesOrder.currency.code)} / ${formatCurrency(salesOrder.total_amount, salesOrder.currency.code)}`
      : `Encaissé ${formatCurrency(net, salesOrder.currency.code)} / ${formatCurrency(salesOrder.total_amount, salesOrder.currency.code)}`) +
    ` — reste ${formatCurrency(remaining, salesOrder.currency.code)}${salesOrder.credited_amount ? ` après ${formatCurrency(salesOrder.credited_amount, salesOrder.currency.code)} d'avoirs` : ""}.`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-muted-foreground">{hint}</p>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Enregistrer un encaissement
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        rowKey={(row) => row.id}
        emptyTitle="Aucun mouvement"
      />

      <RecordPaymentDialog open={formOpen} onOpenChange={setFormOpen} salesOrder={salesOrder} />
      <ConfirmDialog
        open={Boolean(toVoid)}
        onOpenChange={(open) => !open && setToVoid(null)}
        title="Annuler ce mouvement ?"
        description={translate("t.leStatutDePaiementSeraRecalculeIrreversible")}
        confirmLabel="Annuler le mouvement"
        requireReason
        isPending={voidMutation.isPending}
        onConfirm={(reason) => {
          if (toVoid && reason) voidMutation.mutate({ paymentId: toVoid.id, payload: { voided_reason: reason } }, { onSuccess: () => setToVoid(null) });
        }}
      />
    </div>
  );
}
