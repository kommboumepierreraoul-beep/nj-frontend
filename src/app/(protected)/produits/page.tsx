"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, Tags, Pencil, Trash2, FolderTree, SlidersHorizontal, Package, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { ListPageActions } from "@/components/data-display/list-page-actions";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { PageSuspense } from "@/components/layout/page-suspense";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { ExportDialog } from "@/components/forms/export-dialog";
import { ImportDialog } from "@/components/forms/import-dialog";
import { useQueryParams } from "@/hooks/use-query-params";
import { useProductsList } from "@/modules/products/hooks/use-products-list";
import { useProductCategories } from "@/modules/products/hooks/use-product-categories";
import { useDeleteProduct } from "@/modules/products/hooks/use-product-mutations";
import { ProductFilters } from "@/modules/products/components/product-filters";
import { ProductFormDialog } from "@/modules/products/components/product-form-dialog";
import { productsApi } from "@/modules/products/api/products.api";
import { buildProductsListRows } from "@/modules/products/export";
import { PRODUCT_IMPORT_COLUMNS, makeImportProductRow } from "@/modules/products/import";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_TONES } from "@/modules/products/badges";
import type { Product, ProductListFilters } from "@/modules/products/types";
import { getPrimaryImageUrl } from "@/modules/products/utils";
import { routes } from "@/config/routes";
import { exportRows, exportStamp, type ExportFormat } from "@/lib/export";
import { ApiError } from "@/lib/http/api-error";
import { translate } from "@/i18n/translate";

export default function ProductsPage() {
  return (
    <PageSuspense>
      <ProductsPageContent />
    </PageSuspense>
  );
}

function ProductsPageContent() {
  const router = useRouter();
  const [filters, setFilters] = useQueryParams<Required<Pick<ProductListFilters, "page">> & ProductListFilters>({
    page: 1,
    category_id: undefined,
    status: undefined,
    is_sensitive: undefined,
    search: undefined,
  });

  const query = useProductsList(filters);
  const categoriesQuery = useProductCategories();
  const deleteMutation = useDeleteProduct();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport(format: ExportFormat) {
    setIsExporting(true);
    try {
      const response = await productsApi.list({ ...filters, page: 1, per_page: 1000 });
      const ok = exportRows(format, `catalogue-${exportStamp()}`, "Catalogue produits", buildProductsListRows(response.data));
      if (!ok) {
        toast.error(translate("t.leNavigateurABloqueLaFenetreAutorisezLesPopUps"));
        return;
      }
      toast.success(`Export ${format} généré — ${response.data.length} référence(s).`);
      setExportOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Export impossible.");
    } finally {
      setIsExporting(false);
    }
  }

  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      header: translate("col.product"),
      width: "minmax(220px,2.4fr)",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-subtle">
            {getPrimaryImageUrl(row) ? (
              // eslint-disable-next-line @next/next/no-img-element -- miniature produit déjà hébergée par l'API, pas d'optimisation Next nécessaire
              <img src={getPrimaryImageUrl(row)} alt="" className="h-full w-full object-cover" />
            ) : (
              <Package className="h-4 w-4 text-text-quaternary" />
            )}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link href={routes.products.detail(row.id)} className="truncate font-semibold text-foreground hover:text-accent-hover">
              {row.name}
            </Link>
            <span className="truncate text-[11px] font-medium text-text-tertiary">{row.reference}</span>
          </div>
        </div>
      ),
    },
    { key: "category", header: translate("col.category"), width: "minmax(140px,1.2fr)", render: (row) => row.category?.name ?? "—" },
    {
      key: "status",
      header: translate("col.status"),
      width: "130px",
      render: (row) => <Badge tone={PRODUCT_STATUS_TONES[row.status]}>{PRODUCT_STATUS_LABELS[row.status]}</Badge>,
    },
    {
      key: "sensitive",
      header: translate("col.sensitive"),
      width: "110px",
      render: (row) =>
        row.is_sensitive ? (
          <Badge tone="destructive">
            <ShieldAlert className="mr-1 h-3 w-3" />
            Sensible
          </Badge>
        ) : (
          <span className="text-text-quaternary">—</span>
        ),
    },
    { key: "variants", header: translate("col.variants"), width: "110px", render: (row) => row.variants_count ?? 0 },
    { key: "moq", header: "MOQ", width: "90px", align: "right", render: (row) => row.min_order_quantity ?? "—" },
    {
      key: "actions",
      header: "",
      width: "116px",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" title={translate("tooltip.open")} onClick={() => router.push(routes.products.detail(row.id))}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={translate("tooltip.edit")}
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title={translate("tooltip.delete")} onClick={() => setToDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const total = query.data?.meta.total;

  return (
    <div className="space-y-6">
      <PageHeader
        title={translate("page.products.title")}
        badges={typeof total === "number" ? <Badge tone="neutral">{total} référence{total > 1 ? "s" : ""}</Badge> : undefined}
        description={translate("page.products.desc")}
        actions={
          <ListPageActions
            secondary={
              <>
                <Button variant="outline" asChild>
                  <Link href={routes.products.categories}>
                    <FolderTree className="h-4 w-4" />
                    Catégories
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={routes.products.attributes}>
                    <SlidersHorizontal className="h-4 w-4" />
                    {translate("t.attributs")}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={routes.products.tags}>
                    <Tags className="h-4 w-4" />
                    {translate("t.tags")}
                  </Link>
                </Button>
              </>
            }
            onImport={() => setImportOpen(true)}
            onExport={() => setExportOpen(true)}
            newLabel={translate("page.products.new")}
            onNew={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            busy={isExporting}
          />
        }
      />

      <ProductFilters filters={filters} onChange={(patch) => setFilters({ ...patch, page: 1 })} />

      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Catalogue produits</p>
          <p className="text-xs text-text-tertiary">{translate("t.cliquezSurUnProduitPourOuvrirSaFicheComplete")}</p>
        </div>
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
          emptyTitle={translate("page.products.empty")}
          emptyDescription={translate("page.products.emptyDesc")}
        />
      </div>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title={translate("page.products.exportTitle")}
        subtitle={translate("export.subtitle")}
        note={typeof query.data?.meta?.total === "number" ? `${query.data.meta.total} référence(s) seront exportées.` : undefined}
        defaultFormat="XLSX"
        isPending={isExporting}
        onSubmit={(format) => handleExport(format)}
      />

      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title={translate("page.products.importTitle")}
        entityLabel="produit(s)"
        columns={PRODUCT_IMPORT_COLUMNS}
        templateName="modele-import-produits"
        createOne={makeImportProductRow(categoriesQuery.data ?? [])}
        onDone={() => query.refetch()}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.products.deleteTitle")}
        description={toDelete ? `« ${toDelete.name} » sera archivé (soft delete) avec ses variantes.` : undefined}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
