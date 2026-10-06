"use client";

import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/data-display/page-header";
import { ListPageActions } from "@/components/data-display/list-page-actions";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { PageSuspense } from "@/components/layout/page-suspense";
import { ExportDialog } from "@/components/forms/export-dialog";
import { useQueryParams } from "@/hooks/use-query-params";
import { useListExport } from "@/hooks/use-list-export";
import { useInvoicesRegistry } from "@/modules/invoices/hooks/use-invoices-registry";
import { invoicesApi } from "@/modules/invoices/api/invoices.api";
import { InvoiceRegistryFilters } from "@/modules/invoices/components/invoice-registry-filters";
import { buildInvoicesListRows } from "@/modules/invoices/export";
import {
  INVOICE_DOCUMENT_TYPE_LABELS,
  INVOICE_DOCUMENT_TYPE_TONES,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_TONES,
} from "@/modules/invoices/badges";
import type { Invoice, InvoiceListFilters } from "@/modules/invoices/types";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

/**
 * Doc/design_system_maquette_complete.md § 3 — page « Factures » autonome :
 * registre transverse de tous les documents (PROFORMA / FACTURE / AVOIR),
 * toutes commandes confondues. Lecture seule — l'émission, la relance et les
 * paiements restent sur l'onglet « Documents » de la fiche commande.
 */
export default function InvoicesRegistryPage() {
  return (
    <PageSuspense>
      <InvoicesRegistryPageContent />
    </PageSuspense>
  );
}

function InvoicesRegistryPageContent() {
  const [filters, setFilters] = useQueryParams<Required<Pick<InvoiceListFilters, "page">> & InvoiceListFilters>({
    page: 1,
    document_type: undefined,
    status: undefined,
    search: undefined,
    from: undefined,
    to: undefined,
  });

  const query = useInvoicesRegistry(filters);
  const exportState = useListExport({
    fetchAll: async () => (await invoicesApi.registry({ ...filters, page: 1, per_page: 1000 })).data,
    buildRows: buildInvoicesListRows,
    fileBase: "factures",
    title: "Registre des documents",
    entityLabel: "document(s)",
  });

  const columns: DataTableColumn<Invoice>[] = [
    {
      key: "number",
      header: translate("col.number"),
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-foreground">{row.invoice_number}</span>
          {row.document_type === "PROFORMA" && row.version ? <span className="text-[11px] text-muted-foreground">v{row.version}</span> : null}
        </div>
      ),
    },
    {
      key: "type",
      header: translate("col.type"),
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Badge tone={INVOICE_DOCUMENT_TYPE_TONES[row.document_type]}>{INVOICE_DOCUMENT_TYPE_LABELS[row.document_type]}</Badge>
          {row.document_type === "FACTURE" ? <Badge tone="success">{translate("t.payeIntegralement")}</Badge> : null}
          {row.credits ? <Badge tone="neutral">Crédite {row.credits.invoice_number}</Badge> : null}
        </div>
      ),
    },
    {
      key: "status",
      header: translate("col.status"),
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <Badge tone={INVOICE_STATUS_TONES[row.status]}>{INVOICE_STATUS_LABELS[row.status]}</Badge>
          {row.sent_at ? <span className="text-[10px] text-muted-foreground">Envoyé le {formatDateTime(row.sent_at)}</span> : null}
        </div>
      ),
    },
    { key: "client", header: translate("col.client"), render: (row) => row.client?.full_name ?? row.client_name ?? "—" },
    {
      key: "order",
      header: translate("col.order"),
      render: (row) => (
        <Link href={routes.salesOrders.detail(row.sales_order_id)} className="inline-flex items-center gap-1 text-accent-hover hover:underline">
          {translate("t.voirLaCommande")}
          <ExternalLink className="h-3 w-3" />
        </Link>
      ),
    },
    {
      key: "amount",
      header: translate("col.amount"),
      render: (row) => `${row.document_type === "AVOIR" ? "− " : ""}${formatCurrency(row.total_amount, row.currency.code)}`,
    },
    { key: "issued_at", header: translate("col.issuedAt"), render: (row) => formatDateTime(row.issued_at) },
    { key: "issued_by", header: translate("col.issuedBy"), render: (row) => row.issued_by?.name ?? "—" },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) =>
        row.pdf_url ? (
          <a href={row.pdf_url} target="_blank" rel="noreferrer" title={translate("tooltip.downloadPdf")}>
            <Button variant="ghost" size="icon" type="button">
              <Download className="h-4 w-4" />
            </Button>
          </a>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Tableau de bord", href: routes.dashboard.home }, { label: "Factures" }]}
        title={translate("page.invoices.title")}
        badges={typeof query.data?.meta?.total === "number" ? <Badge tone="neutral">{query.data.meta.total} document(s)</Badge> : undefined}
        description={translate("page.invoices.desc")}
        actions={<ListPageActions onExport={() => exportState.setOpen(true)} busy={exportState.isExporting} />}
      />

      <InvoiceRegistryFilters filters={filters} onChange={(patch) => setFilters({ ...patch, page: 1 })} />

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
        emptyTitle={translate("page.invoices.empty")}
        emptyDescription={translate("page.invoices.emptyDesc")}
      />

      <ExportDialog
        open={exportState.open}
        onOpenChange={exportState.setOpen}
        title={translate("page.invoices.exportTitle")}
        subtitle={translate("export.subtitle")}
        note={typeof query.data?.meta?.total === "number" ? `${query.data.meta.total} document(s) seront exportés.` : undefined}
        defaultFormat="XLSX"
        isPending={exportState.isExporting}
        onSubmit={(format) => exportState.run(format)}
      />
    </div>
  );
}
