"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, Pencil, Percent, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { ListPageActions } from "@/components/data-display/list-page-actions";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { PageSuspense } from "@/components/layout/page-suspense";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { ExportDialog } from "@/components/forms/export-dialog";
import { useQueryParams } from "@/hooks/use-query-params";
import { useSalesOrdersList } from "@/modules/sales-orders/hooks/use-sales-orders-list";
import { SalesOrderFilters } from "@/modules/sales-orders/components/sales-order-filters";
import { SalesOrderFormDialog } from "@/modules/sales-orders/components/sales-order-form-dialog";
import { SalesOrderEditDialog } from "@/modules/sales-orders/components/sales-order-edit-dialog";
import { useDeleteSalesOrder } from "@/modules/sales-orders/hooks/use-sales-order-mutations";
import { salesOrdersApi } from "@/modules/sales-orders/api/sales-orders.api";
import { buildSalesOrdersListRows } from "@/modules/sales-orders/export";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONES, SALES_ORDER_STATUS_LABELS, SALES_ORDER_STATUS_TONES, SALES_ORDER_TYPE_LABELS } from "@/modules/sales-orders/badges";
import type { SalesOrder, SalesOrderListFilters } from "@/modules/sales-orders/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { exportRows, exportStamp, type ExportFormat } from "@/lib/export";
import { ApiError } from "@/lib/http/api-error";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_commandes.md § 1 « Liste des commandes ». */
export default function SalesOrdersPage() {
  return (
    <PageSuspense>
      <SalesOrdersPageContent />
    </PageSuspense>
  );
}

function SalesOrdersPageContent() {
  const router = useRouter();
  const [filters, setFilters] = useQueryParams<Required<Pick<SalesOrderListFilters, "page">> & SalesOrderListFilters>({
    page: 1,
    client_id: undefined,
    status: undefined,
    payment_status: undefined,
    type: undefined,
  });

  const query = useSalesOrdersList(filters);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesOrder | null>(null);
  const [toDelete, setToDelete] = useState<SalesOrder | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const deleteMutation = useDeleteSalesOrder();

  /**
   * Doc/design_system_maquette_complete.md § 4.7 « Export » — reprend les
   * filtres actifs de la liste (mêmes `filters` que useSalesOrdersList), mais
   * sans pagination : un per_page large plutôt qu'un endpoint d'export dédié,
   * cohérent avec le volume attendu d'un back-office interne (même arbitrage
   * que ClientPickerField).
   */
  async function handleExport(format: ExportFormat, values: Record<string, boolean>) {
    setIsExporting(true);
    try {
      const response = await salesOrdersApi.list({ ...filters, page: 1, per_page: 1000 });
      const rows = buildSalesOrdersListRows(response.data, values.with_totals ?? false);
      const ok = exportRows(format, `commandes-${exportStamp()}`, "Liste des commandes", rows);
      if (!ok) {
        toast.error(translate("t.leNavigateurABloqueLaFenetreAutorisezLesPopUps"));
        return;
      }
      toast.success(`Export ${format} généré — ${response.data.length} commande(s).`);
      setExportOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Export impossible.");
    } finally {
      setIsExporting(false);
    }
  }

  const columns: DataTableColumn<SalesOrder>[] = [
    {
      key: "reference",
      header: translate("col.reference"),
      render: (row) => (
        <Link href={routes.salesOrders.detail(row.id)} className="font-medium text-accent-hover hover:underline">
          {row.reference}
        </Link>
      ),
    },
    { key: "client", header: translate("col.client"), render: (row) => row.client.full_name },
    { key: "type", header: translate("col.type"), render: (row) => <Badge tone="neutral">{SALES_ORDER_TYPE_LABELS[row.type]}</Badge> },
    { key: "status", header: translate("col.status"), render: (row) => <Badge tone={SALES_ORDER_STATUS_TONES[row.status]}>{SALES_ORDER_STATUS_LABELS[row.status]}</Badge> },
    { key: "payment_status", header: translate("col.paymentStatus"), render: (row) => <Badge tone={PAYMENT_STATUS_TONES[row.payment_status]}>{PAYMENT_STATUS_LABELS[row.payment_status]}</Badge> },
    { key: "total", header: translate("col.totalAmount"), render: (row) => formatCurrency(row.total_amount, row.currency.code) },
    { key: "order_date", header: translate("col.orderDate"), render: (row) => formatDate(row.order_date) },
    {
      key: "actions",
      header: "",
      width: "150px",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" title={translate("tooltip.open")} onClick={() => router.push(routes.salesOrders.detail(row.id))}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title={translate("tooltip.edit")} onClick={() => setEditing(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title={translate("tooltip.delete")} onClick={() => setToDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={translate("page.salesOrders.title")}
        badges={typeof query.data?.meta?.total === "number" ? <Badge tone="neutral">{query.data.meta.total} commande{query.data.meta.total > 1 ? "s" : ""}</Badge> : undefined}
        description={translate("page.salesOrders.desc")}
        actions={
          <ListPageActions
            secondary={
              <Button variant="outline" asChild>
                <Link href={routes.settings.commissions}>
                  <Percent className="h-4 w-4" />
                  Barème de commission
                </Link>
              </Button>
            }
            onExport={() => setExportOpen(true)}
            newLabel={translate("page.salesOrders.new")}
            onNew={() => setFormOpen(true)}
            busy={isExporting}
          />
        }
      />

      <SalesOrderFilters filters={filters} onChange={(patch) => setFilters({ ...patch, page: 1 })} />

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
        emptyTitle={translate("page.salesOrders.empty")}
        emptyDescription={translate("page.salesOrders.emptyDesc")}
      />

      <SalesOrderFormDialog open={formOpen} onOpenChange={setFormOpen} />

      {editing ? <SalesOrderEditDialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)} salesOrder={editing} /> : null}

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title={translate("page.salesOrders.exportTitle")}
        subtitle={translate("export.subtitle")}
        note={typeof query.data?.meta?.total === "number" ? `${query.data.meta.total} commande(s) seront exportées.` : undefined}
        options={[{ key: "with_totals", label: "Ligne de totaux par devise", help: translate("t.eviteDAdditionnerDesDevisesDifferentes"), defaultChecked: true }]}
        defaultFormat="XLSX"
        isPending={isExporting}
        onSubmit={handleExport}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.salesOrders.deleteTitle")}
        description={toDelete ? `La commande « ${toDelete.reference} » sera définitivement supprimée.` : undefined}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
