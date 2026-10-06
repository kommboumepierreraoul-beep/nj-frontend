"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { ListPageActions } from "@/components/data-display/list-page-actions";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { PageSuspense } from "@/components/layout/page-suspense";
import { ExportDialog } from "@/components/forms/export-dialog";
import { useQueryParams } from "@/hooks/use-query-params";
import { useListExport } from "@/hooks/use-list-export";
import { usePurchaseOrdersList } from "@/modules/purchase-orders/hooks/use-purchase-orders-list";
import { PurchaseOrderFilters } from "@/modules/purchase-orders/components/purchase-order-filters";
import { PurchaseOrderFormDialog } from "@/modules/purchase-orders/components/purchase-order-form-dialog";
import { purchaseOrdersApi } from "@/modules/purchase-orders/api/purchase-orders.api";
import { buildPurchaseOrdersListRows } from "@/modules/purchase-orders/export";
import { PURCHASE_ORDER_STATUS_LABELS, PURCHASE_ORDER_STATUS_TONES } from "@/modules/purchase-orders/badges";
import type { PurchaseOrder, PurchaseOrderListFilters } from "@/modules/purchase-orders/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

export default function PurchaseOrdersPage() {
  return (
    <PageSuspense>
      <PurchaseOrdersPageContent />
    </PageSuspense>
  );
}

function PurchaseOrdersPageContent() {
  const [filters, setFilters] = useQueryParams<Required<Pick<PurchaseOrderListFilters, "page">> & PurchaseOrderListFilters>({
    page: 1,
    supplier_id: undefined,
    status: undefined,
  });

  const router = useRouter();
  const query = usePurchaseOrdersList(filters);
  const [formOpen, setFormOpen] = useState(false);
  const exportState = useListExport({
    fetchAll: async () => (await purchaseOrdersApi.list({ ...filters, page: 1, per_page: 1000 })).data,
    buildRows: buildPurchaseOrdersListRows,
    fileBase: "commandes-fournisseurs",
    title: "Commandes fournisseurs",
    entityLabel: "commande(s)",
  });

  const columns: DataTableColumn<PurchaseOrder>[] = [
    {
      key: "reference",
      header: translate("col.reference"),
      render: (row) => (
        <Link href={routes.suppliers.purchaseOrderDetail(row.id)} className="font-medium text-accent-hover hover:underline">
          {row.reference}
        </Link>
      ),
    },
    { key: "supplier", header: translate("col.supplier"), render: (row) => row.supplier.company_name },
    { key: "status", header: translate("col.status"), render: (row) => <Badge tone={PURCHASE_ORDER_STATUS_TONES[row.status]}>{PURCHASE_ORDER_STATUS_LABELS[row.status]}</Badge> },
    { key: "order_date", header: translate("col.orderDate"), render: (row) => formatDate(row.order_date) },
    { key: "expected", header: translate("col.expectedDelivery"), render: (row) => (row.expected_delivery_date ? formatDate(row.expected_delivery_date) : "—") },
    { key: "total", header: translate("col.totalAmount"), render: (row) => formatCurrency(row.total_amount, row.currency?.code) },
    {
      key: "actions",
      header: "",
      width: "72px",
      align: "right",
      render: (row) => (
        <Button variant="ghost" size="icon" title={translate("tooltip.openDetail")} onClick={() => router.push(routes.suppliers.purchaseOrderDetail(row.id))}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={translate("page.purchaseOrders.title")}
        badges={query.data?.meta ? <Badge tone="neutral">{query.data.meta.total} commandes</Badge> : undefined}
        description={translate("page.purchaseOrders.desc")}
        actions={
          <ListPageActions
            onExport={() => exportState.setOpen(true)}
            newLabel={translate("page.salesOrders.new")}
            onNew={() => setFormOpen(true)}
            busy={exportState.isExporting}
          />
        }
      />

      <PurchaseOrderFilters filters={filters} onChange={(patch) => setFilters({ ...patch, page: 1 })} />

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

      <PurchaseOrderFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <ExportDialog
        open={exportState.open}
        onOpenChange={exportState.setOpen}
        title={translate("page.purchaseOrders.exportTitle")}
        subtitle={translate("export.subtitle")}
        note={typeof query.data?.meta?.total === "number" ? `${query.data.meta.total} commande(s) seront exportées.` : undefined}
        defaultFormat="XLSX"
        isPending={exportState.isExporting}
        onSubmit={(format) => exportState.run(format)}
      />
    </div>
  );
}
