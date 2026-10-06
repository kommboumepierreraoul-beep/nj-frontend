"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, Eye, Pencil, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { ListPageActions } from "@/components/data-display/list-page-actions";
import { RowActions, RowActionButton } from "@/components/data-display/row-actions";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { PageSuspense } from "@/components/layout/page-suspense";
import { ExportDialog } from "@/components/forms/export-dialog";
import { ImportDialog } from "@/components/forms/import-dialog";
import { toNumber } from "@/lib/format";
import { useQueryParams } from "@/hooks/use-query-params";
import { useSuppliersList } from "@/modules/suppliers/hooks/use-suppliers-list";
import { SupplierFilters } from "@/modules/suppliers/components/supplier-filters";
import { SupplierFormDialog } from "@/modules/suppliers/components/supplier-form-dialog";
import { SupplierEvaluationFormDialog } from "@/modules/suppliers/components/supplier-evaluation-form-dialog";
import { suppliersApi } from "@/modules/suppliers/api/suppliers.api";
import { buildSuppliersListRows } from "@/modules/suppliers/export";
import { SUPPLIER_IMPORT_COLUMNS, importSupplierRow } from "@/modules/suppliers/import";
import { SUPPLIER_RELIABILITY_BAR_CLASSES, SUPPLIER_RELIABILITY_LABELS, SUPPLIER_RELIABILITY_TONES } from "@/modules/suppliers/badges";
import type { Supplier, SupplierListFilters } from "@/modules/suppliers/types";
import { routes } from "@/config/routes";
import { formatCountryLabel } from "@/lib/countries";
import { exportRows, exportStamp, type ExportFormat } from "@/lib/export";
import { ApiError } from "@/lib/http/api-error";
import { translate } from "@/i18n/translate";

export default function SuppliersPage() {
  return (
    <PageSuspense>
      <SuppliersPageContent />
    </PageSuspense>
  );
}

function SuppliersPageContent() {
  const [filters, setFilters] = useQueryParams<Required<Pick<SupplierListFilters, "page">> & SupplierListFilters>({
    page: 1,
    is_active: undefined,
    is_blacklisted: undefined,
    reliability: undefined,
    category_id: undefined,
    search: undefined,
  });

  const router = useRouter();
  const query = useSuppliersList(filters);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Supplier | null>(null);
  const [evalTargetId, setEvalTargetId] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport(format: ExportFormat) {
    setIsExporting(true);
    try {
      const response = await suppliersApi.list({ ...filters, page: 1, per_page: 1000 });
      const ok = exportRows(format, `fournisseurs-${exportStamp()}`, "Liste des fournisseurs", buildSuppliersListRows(response.data));
      if (!ok) {
        toast.error(translate("t.leNavigateurABloqueLaFenetreAutorisezLesPopUps"));
        return;
      }
      toast.success(`Export ${format} généré — ${response.data.length} fournisseur(s).`);
      setExportOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Export impossible.");
    } finally {
      setIsExporting(false);
    }
  }

  const columns: DataTableColumn<Supplier>[] = [
    {
      key: "company_name",
      header: translate("col.supplier"),
      render: (row) => (
        <Link href={routes.suppliers.detail(row.id)} className="font-medium text-accent-hover hover:underline">
          {row.company_name}
        </Link>
      ),
    },
    { key: "contact", header: translate("col.contact"), render: (row) => row.contact_name ?? "—" },
    { key: "country", header: translate("col.country"), render: (row) => formatCountryLabel(row.country) },
    {
      key: "reliability",
      header: translate("col.reliability"),
      render: (row) => <Badge tone={SUPPLIER_RELIABILITY_TONES[row.reliability]}>{SUPPLIER_RELIABILITY_LABELS[row.reliability]}</Badge>,
    },
    {
      key: "score",
      header: translate("col.score"),
      render: (row) => {
        const score = toNumber(row.reliability_score);
        return score !== null ? (
          <div className="flex w-full items-center gap-2.5">
            <div className="h-1.5 min-w-[36px] flex-1 overflow-hidden rounded-full bg-neutral-bg">
              <div
                className={`h-full rounded-full ${SUPPLIER_RELIABILITY_BAR_CLASSES[row.reliability]}`}
                style={{ width: `${(score / 5) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-bold whitespace-nowrap">{score.toFixed(1)}</span>
          </div>
        ) : (
          "—"
        );
      },
    },
    { key: "status", header: translate("col.status"), render: (row) => <Badge tone={row.is_active ? "success" : "neutral"}>{row.is_active ? translate("value.active") : translate("value.inactive")}</Badge> },
    {
      key: "blacklist",
      header: "",
      render: (row) => (row.is_blacklisted ? <Badge tone="destructive"><Ban className="mr-1 h-3 w-3" />Liste noire</Badge> : null),
    },
    {
      key: "actions",
      header: "",
      width: "180px",
      align: "right",
      render: (row) => (
        <RowActions>
          <RowActionButton
            icon={Eye}
            label="Voir"
            title={translate("tooltip.open")}
            onClick={() => router.push(routes.suppliers.detail(row.id))}
          />
          <RowActionButton
            icon={Pencil}
            title={translate("tooltip.editSupplier")}
            onClick={() => setEditTarget(row)}
          />
          <RowActionButton
            icon={Star}
            title={translate("tooltip.newEvaluation")}
            tone="accent"
            onClick={() => setEvalTargetId(row.id)}
          />
        </RowActions>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={translate("page.suppliers.title")}
        badges={query.data?.meta ? <Badge tone="neutral">{query.data.meta.total} au portefeuille</Badge> : undefined}
        description={translate("page.suppliers.desc")}
        actions={
          <ListPageActions
            onImport={() => setImportOpen(true)}
            onExport={() => setExportOpen(true)}
            newLabel={translate("page.suppliers.new")}
            onNew={() => setFormOpen(true)}
            busy={isExporting}
          />
        }
      />

      <SupplierFilters filters={filters} onChange={(patch) => setFilters({ ...patch, page: 1 })} />

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
        emptyTitle={translate("page.suppliers.empty")}
        emptyDescription={translate("page.suppliers.emptyDesc")}
      />

      <SupplierFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <SupplierFormDialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        supplier={editTarget}
      />
      {evalTargetId !== null ? (
        <SupplierEvaluationFormDialog
          open
          onOpenChange={(open) => !open && setEvalTargetId(null)}
          supplierId={evalTargetId}
        />
      ) : null}

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title={translate("page.suppliers.exportTitle")}
        subtitle={translate("export.subtitle")}
        note={typeof query.data?.meta?.total === "number" ? `${query.data.meta.total} fournisseur(s) seront exportés.` : undefined}
        defaultFormat="XLSX"
        isPending={isExporting}
        onSubmit={(format) => handleExport(format)}
      />

      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title={translate("page.suppliers.importTitle")}
        entityLabel="fournisseur(s)"
        columns={SUPPLIER_IMPORT_COLUMNS}
        templateName="modele-import-fournisseurs"
        createOne={importSupplierRow}
        onDone={() => query.refetch()}
      />
    </div>
  );
}
