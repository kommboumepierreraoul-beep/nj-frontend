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
import { useRfqsList } from "@/modules/rfq/hooks/use-rfqs-list";
import { RfqFilters } from "@/modules/rfq/components/rfq-filters";
import { RfqFormDialog } from "@/modules/rfq/components/rfq-form-dialog";
import { rfqApi } from "@/modules/rfq/api/rfq.api";
import { buildRfqListRows } from "@/modules/rfq/export";
import { RFQ_STATUS_LABELS, RFQ_STATUS_TONES } from "@/modules/rfq/badges";
import type { Rfq, RfqListFilters } from "@/modules/rfq/types";
import { formatDate } from "@/lib/format";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

export default function RfqListPage() {
  return (
    <PageSuspense>
      <RfqListPageContent />
    </PageSuspense>
  );
}

function RfqListPageContent() {
  const [filters, setFilters] = useQueryParams<Required<Pick<RfqListFilters, "page">> & RfqListFilters>({
    page: 1,
    status: undefined,
  });

  const router = useRouter();
  const query = useRfqsList(filters);
  const [formOpen, setFormOpen] = useState(false);
  const exportState = useListExport({
    fetchAll: async () => (await rfqApi.list({ ...filters, page: 1, per_page: 1000 })).data,
    buildRows: buildRfqListRows,
    fileBase: "rfq",
    title: "Demandes de prix",
    entityLabel: "RFQ",
  });

  const columns: DataTableColumn<Rfq>[] = [
    {
      key: "reference",
      header: translate("col.reference"),
      render: (row) => (
        <Link href={routes.suppliers.rfqDetail(row.id)} className="font-medium text-accent-hover hover:underline">
          {row.reference}
        </Link>
      ),
    },
    { key: "status", header: translate("col.status"), render: (row) => <Badge tone={RFQ_STATUS_TONES[row.status]}>{RFQ_STATUS_LABELS[row.status]}</Badge> },
    { key: "request_date", header: translate("col.requestDate"), render: (row) => formatDate(row.request_date) },
    { key: "expected", header: translate("col.expectedResponse"), render: (row) => (row.expected_response_date ? formatDate(row.expected_response_date) : "—") },
    { key: "items", header: translate("col.items"), render: (row) => row.items_count ?? 0 },
    { key: "suppliers", header: translate("col.suppliersSolicited"), render: (row) => row.suppliers_count ?? 0 },
    {
      key: "actions",
      header: "",
      width: "72px",
      align: "right",
      render: (row) => (
        <Button variant="ghost" size="icon" title={translate("tooltip.openDetail")} onClick={() => router.push(routes.suppliers.rfqDetail(row.id))}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={translate("page.rfq.title")}
        badges={query.data?.meta ? <Badge tone="neutral">{query.data.meta.total} RFQ</Badge> : undefined}
        description={translate("page.rfq.desc")}
        actions={
          <ListPageActions
            onExport={() => exportState.setOpen(true)}
            newLabel={translate("page.rfq.new")}
            onNew={() => setFormOpen(true)}
            busy={exportState.isExporting}
          />
        }
      />

      <RfqFilters filters={filters} onChange={(patch) => setFilters({ ...patch, page: 1 })} />

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
        emptyTitle={translate("page.rfq.empty")}
        emptyDescription={translate("page.rfq.emptyDesc")}
      />

      <RfqFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <ExportDialog
        open={exportState.open}
        onOpenChange={exportState.setOpen}
        title={translate("page.rfq.exportTitle")}
        subtitle={translate("export.subtitle")}
        note={typeof query.data?.meta?.total === "number" ? `${query.data.meta.total} RFQ seront exportées.` : undefined}
        defaultFormat="XLSX"
        isPending={exportState.isExporting}
        onSubmit={(format) => exportState.run(format)}
      />
    </div>
  );
}
