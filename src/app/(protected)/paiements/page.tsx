"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Ban } from "lucide-react";
import { ListPageActions } from "@/components/data-display/list-page-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/data-display/page-header";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { PageSuspense } from "@/components/layout/page-suspense";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { ExportDialog } from "@/components/forms/export-dialog";
import { useQueryParams } from "@/hooks/use-query-params";
import { useSalesOrderPaymentsRegistry, useVoidSalesOrderPaymentGlobal } from "@/modules/sales-orders/hooks/use-sales-order-payments";
import { PaymentRegistryFilters } from "@/modules/sales-orders/components/payment-registry-filters";
import { salesOrdersApi } from "@/modules/sales-orders/api/sales-orders.api";
import { buildPaymentRegistryRows } from "@/modules/sales-orders/export";
import { PAYMENT_DIRECTION_LABELS, PAYMENT_DIRECTION_TONES, PAYMENT_METHOD_LABELS } from "@/modules/sales-orders/badges";
import type { SalesOrderPaymentListFilters, SalesOrderPaymentWithOrder } from "@/modules/sales-orders/types";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { exportRows, exportStamp, type ExportFormat } from "@/lib/export";
import { ApiError } from "@/lib/http/api-error";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

/**
 * Doc/design_system_maquette_complete.md § 6.2 « Paiements (registre transverse) ».
 *
 * Auparavant un écran honnête-mais-vide : aucun des endpoints alors spécifiés
 * (`GET /sales-orders/{id}/payments`, `GET /invoices/{invoice}/payments`) n'agrégeait
 * l'ensemble du portefeuille, et la spec qualifiait explicitement ce point de
 * « cadrage à trancher avec NJ Global Trade avant construction réelle » (§ 6.2) tout
 * en déconseillant elle-même la seule alternative disponible sans nouvel endpoint —
 * reconstituer la vue côté frontend à partir de toutes les commandes chargées.
 *
 * Bâti désormais sur `GET /sales-order-payments` (SalesOrderPaymentController::
 * indexGlobal), qui agrège réellement les mouvements de toutes les commandes en une
 * seule requête paginée et filtrable côté serveur.
 *
 * N'inclut pas l'action « Générer le reçu PDF » de la maquette (NJ Global Trade
 * Paiements.dc.html) : purement décorative côté maquette (aucun endpoint, aucune
 * mention dans Doc/spec_pages_commandes.md) — seule « Annuler le mouvement », réelle
 * et déjà utilisée par l'onglet Paiements de la fiche commande, est reprise ici.
 *
 * L'export (§ 4.7 : « disponible sur les listes qui l'exposent côté API ») est
 * ajouté maintenant que ce registre a un vrai endpoint filtrable derrière lui —
 * PDF/Excel/CSV, filtres actifs, totaux par devise déjà calculés côté serveur.
 */
export default function PaymentsRegistryPage() {
  return (
    <PageSuspense>
      <PaymentsRegistryPageContent />
    </PageSuspense>
  );
}

function PaymentsRegistryPageContent() {
  const [filters, setFilters] = useQueryParams<Required<Pick<SalesOrderPaymentListFilters, "page">> & SalesOrderPaymentListFilters>({
    page: 1,
    direction: undefined,
    payment_method: undefined,
    is_voided: undefined,
    client_id: undefined,
    currency_id: undefined,
    search: undefined,
  });

  const query = useSalesOrderPaymentsRegistry(filters);
  const voidMutation = useVoidSalesOrderPaymentGlobal();
  const [toVoid, setToVoid] = useState<SalesOrderPaymentWithOrder | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const totals = query.data?.meta?.totals_by_currency ?? [];

  /**
   * Doc/design_system_maquette_complete.md § 4.7 — reprend les filtres actifs
   * du registre (mêmes `filters`), sans pagination. § 4.7 réserve l'export aux
   * « listes qui l'exposent côté API » : vrai désormais pour ce registre
   * depuis la construction de GET /sales-order-payments (auparavant un stub
   * sans données réelles à exporter).
   */
  async function handleExport(format: ExportFormat) {
    setIsExporting(true);
    try {
      const response = await salesOrdersApi.listAllPayments({ ...filters, page: 1, per_page: 1000 });
      const rows = buildPaymentRegistryRows(response.data, response.meta.totals_by_currency);
      const ok = exportRows(format, `paiements-${exportStamp()}`, translate("t.mouvementsDeTresorerie"), rows);
      if (!ok) {
        toast.error(translate("t.leNavigateurABloqueLaFenetreAutorisezLesPopUps"));
        return;
      }
      toast.success(`Export ${format} généré — ${response.data.length} mouvement(s).`);
      setExportOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Export impossible.");
    } finally {
      setIsExporting(false);
    }
  }

  const columns: DataTableColumn<SalesOrderPaymentWithOrder>[] = [
    { key: "direction", header: translate("col.direction"), render: (row) => <Badge tone={PAYMENT_DIRECTION_TONES[row.direction]}>{PAYMENT_DIRECTION_LABELS[row.direction]}</Badge> },
    { key: "amount", header: translate("col.amount"), align: "right", render: (row) => formatCurrency(row.amount, row.currency.code) },
    { key: "method", header: translate("col.method"), render: (row) => PAYMENT_METHOD_LABELS[row.payment_method] },
    {
      key: "order",
      header: translate("col.order"),
      render: (row) => (
        <span className="flex min-w-0 flex-col">
          <Link href={routes.salesOrders.detail(row.sales_order.id)} className="truncate font-medium text-accent-hover hover:underline">
            {row.sales_order.reference}
          </Link>
          <span className="truncate text-xs text-muted-foreground">{row.sales_order.client?.full_name ?? "—"}</span>
        </span>
      ),
    },
    { key: "receipt", header: translate("col.receiptNumber"), render: (row) => row.receipt_number },
    { key: "reference", header: translate("col.externalRef"), render: (row) => row.external_reference ?? "—" },
    { key: "paid_at", header: translate("col.date"), render: (row) => formatDateTime(row.paid_at) },
    {
      key: "status",
      header: translate("col.status"),
      render: (row) => (row.is_voided ? <Badge tone="destructive">Annulé{row.voided_reason ? ` — ${row.voided_reason}` : ""}</Badge> : <Badge tone="success">{translate("t.actif")}</Badge>),
    },
    {
      key: "actions",
      header: "",
      width: "60px",
      align: "right",
      render: (row) =>
        row.is_voided ? null : (
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" title={translate("tooltip.voidMovement")} onClick={() => setToVoid(row)}>
              <Ban className="h-4 w-4" />
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={translate("page.payments.title")}
        badges={typeof query.data?.meta?.total === "number" ? <Badge tone="neutral">{query.data.meta.total} mouvement{query.data.meta.total > 1 ? "s" : ""}</Badge> : undefined}
        description={translate("page.payments.desc")}
        actions={<ListPageActions onExport={() => setExportOpen(true)} busy={isExporting} />}
      />

      {totals.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {totals.map((total) => (
            <div key={total.currency_id} className="rounded-lg border border-border bg-surface p-4">
              <p className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">{total.currency_code}</p>
              <p className="mt-1 text-xl font-bold text-foreground">{formatCurrency(total.net, total.currency_code)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Net encaissé — {formatCurrency(total.gross_collected, total.currency_code)} brut
                {total.total_refunded > 0 ? ` − ${formatCurrency(total.total_refunded, total.currency_code)} remboursé` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <PaymentRegistryFilters filters={filters} onChange={(patch) => setFilters({ ...patch, page: 1 })} />

      <DataTable
        columns={columns}
        data={query.data?.data}
        meta={query.data?.meta}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        onPageChange={(page) => setFilters({ page })}
        rowKey={(row) => row.id}
        emptyTitle={translate("page.payments.empty")}
        emptyDescription={translate("page.payments.emptyDesc")}
      />

      <ConfirmDialog
        open={Boolean(toVoid)}
        onOpenChange={(open) => !open && setToVoid(null)}
        title={translate("page.payments.voidTitle")}
        description={
          toVoid ? `Le statut de paiement de la commande « ${toVoid.sales_order.reference} » sera recalculé immédiatement. Cette action est irréversible.` : undefined
        }
        confirmLabel="Annuler le mouvement"
        requireReason
        isPending={voidMutation.isPending}
        onConfirm={(reason) => {
          if (toVoid && reason)
            voidMutation.mutate({ salesOrderId: toVoid.sales_order.id, paymentId: toVoid.id, payload: { voided_reason: reason } }, { onSuccess: () => setToVoid(null) });
        }}
      />

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title={translate("page.payments.exportTitle")}
        subtitle={translate("export.subtitle")}
        note={typeof query.data?.meta?.total === "number" ? `${query.data.meta.total} mouvement(s) seront exportés.` : undefined}
        defaultFormat="XLSX"
        isPending={isExporting}
        onSubmit={handleExport}
      />
    </div>
  );
}
