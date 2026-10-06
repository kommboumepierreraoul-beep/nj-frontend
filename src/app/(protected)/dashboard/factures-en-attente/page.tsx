"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { PageSuspense } from "@/components/layout/page-suspense";
import { useQueryParams } from "@/hooks/use-query-params";
import { usePendingSalesOrders } from "@/modules/dashboard/hooks/use-pending-sales-orders";
import type { DashboardPendingSalesOrder } from "@/modules/dashboard/types";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONES } from "@/modules/sales-orders/badges";
import { routes } from "@/config/routes";
import { formatCurrency, formatDate } from "@/lib/format";
import { translate } from "@/i18n/translate";

export default function PendingInvoicesPage() {
  return (
    <PageSuspense>
      <PendingInvoicesPageContent />
    </PageSuspense>
  );
}

function PendingInvoicesPageContent() {
  const [{ page }, setParams] = useQueryParams({ page: 1 });
  const query = usePendingSalesOrders(page);

  const columns: DataTableColumn<DashboardPendingSalesOrder>[] = [
    {
      key: "reference",
      header: translate("col.reference"),
      render: (row) => (
        <Link href={routes.salesOrders.detail(row.id)} className="font-medium text-accent-hover hover:underline">
          {row.reference}
        </Link>
      ),
    },
    {
      key: "client",
      header: translate("col.client"),
      render: (row) => (
        <div className="flex items-center gap-2">
          <span>{row.client.full_name}</span>
          {row.client.category ? <Badge tone="clients">{row.client.category.label}</Badge> : null}
        </div>
      ),
    },
    {
      key: "amount",
      header: translate("col.amount"),
      render: (row) => formatCurrency(row.total_amount, row.currency),
    },
    {
      key: "payment_status",
      header: translate("col.paymentStatus"),
      render: (row) => <Badge tone={PAYMENT_STATUS_TONES[row.payment_status]}>{PAYMENT_STATUS_LABELS[row.payment_status]}</Badge>,
    },
    {
      key: "valid_until",
      header: translate("col.dueDate"),
      render: (row) => (row.valid_until ? formatDate(row.valid_until) : "—"),
    },
    {
      key: "jours_restants",
      header: translate("col.daysLeft"),
      render: (row) =>
        row.jours_restants === null
          ? "—"
          : row.jours_restants >= 0
            ? `J-${row.jours_restants}`
            : `J+${Math.abs(row.jours_restants)}`,
    },
    {
      key: "niveau_alerte",
      header: translate("col.alert"),
      render: (row) =>
        row.niveau_alerte === "DEPASSEE" ? (
          <Badge tone="destructive">En retard</Badge>
        ) : row.niveau_alerte === "PROCHE" ? (
          <Badge tone="warning">{translate("t.aRelancerBientot")}</Badge>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Tableau de bord", href: routes.dashboard.home }, { label: "Factures en attente" }]}
        title={translate("page.pendingInvoices.title")}
        description={translate("page.pendingInvoices.desc")}
      />
      <DataTable
        columns={columns}
        data={query.data?.data}
        meta={query.data?.meta}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        onPageChange={(next) => setParams({ page: next })}
        rowKey={(row) => row.id}
        emptyTitle={translate("page.pendingInvoices.empty")}
        emptyDescription={translate("page.pendingInvoices.emptyDesc")}
      />
    </div>
  );
}
