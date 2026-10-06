"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Folder, CornerDownRight, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { ProductCategoryFormDialog } from "@/modules/products/components/product-category-form-dialog";
import { useDeleteProductCategory, useProductCategories } from "@/modules/products/hooks/use-product-categories";
import { routes } from "@/config/routes";
import type { ProductCategory } from "@/modules/products/types";
import { translate } from "@/i18n/translate";

/**
 * Liste indentée par `parent_id` plutôt qu'un vrai composant arbre à
 * glisser-déposer : le drag & drop de `sort_order` est marqué "optionnel"
 * dans la spec (§ 1) — l'ordre reste modifiable via le champ numérique du
 * formulaire.
 *
 * Repliable par catégorie (`collapsedIds`) : une catégorie sans sous-catégorie
 * n'a pas de chevron ; une catégorie repliée masque toute sa descendance
 * (récursif, une catégorie peut en théorie avoir plusieurs niveaux même si le
 * template ne montre que 2 niveaux dans ses données de démonstration).
 */
function buildTree(
  categories: ProductCategory[],
  collapsedIds: Set<number>,
): { category: ProductCategory; depth: number; hasChildren: boolean }[] {
  const byParent = new Map<number | null, ProductCategory[]>();
  for (const category of categories) {
    const key = category.parent_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(category);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.sort_order - b.sort_order);

  const rows: { category: ProductCategory; depth: number; hasChildren: boolean }[] = [];
  function walk(parentId: number | null, depth: number) {
    for (const category of byParent.get(parentId) ?? []) {
      const hasChildren = (byParent.get(category.id) ?? []).length > 0;
      rows.push({ category, depth, hasChildren });
      if (hasChildren && !collapsedIds.has(category.id)) {
        walk(category.id, depth + 1);
      }
    }
  }
  walk(null, 0);
  return rows;
}

export default function ProductCategoriesPage() {
  const query = useProductCategories();
  const deleteMutation = useDeleteProductCategory();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [toDelete, setToDelete] = useState<ProductCategory | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());

  function toggleCollapsed(id: number) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const rows = query.data ? buildTree(query.data, collapsedIds) : [];

  const columns: DataTableColumn<{ category: ProductCategory; depth: number; hasChildren: boolean }>[] = [
    {
      key: "name",
      header: translate("col.category"),
      width: "minmax(220px,2.4fr)",
      render: ({ category, depth, hasChildren }) => {
        const collapsed = collapsedIds.has(category.id);
        return (
          <div className="flex min-w-0 items-center gap-1" style={{ paddingLeft: depth * 24 }}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleCollapsed(category.id)}
                aria-label={collapsed ? `Déplier ${category.name}` : `Replier ${category.name}`}
                aria-expanded={!collapsed}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-foreground"
              >
                {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            ) : (
              <span className="h-5 w-5 shrink-0" />
            )}
            <div className="flex min-w-0 items-center gap-2.5">
              {depth > 0 ? (
                <CornerDownRight className="h-4 w-4 shrink-0 text-text-tertiary" />
              ) : (
                <Folder className="h-4 w-4 shrink-0 text-text-tertiary" />
              )}
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13.5px] font-semibold text-foreground">{category.name}</span>
                {category.description ? <span className="truncate text-[11px] text-text-tertiary">{category.description}</span> : null}
              </div>
            </div>
          </div>
        );
      },
    },
    { key: "slug", header: translate("col.slug"), width: "minmax(0,1.4fr)", render: ({ category }) => <span className="text-text-tertiary">{category.slug}</span> },
    {
      key: "children",
      header: translate("col.subcategories"),
      width: "170px",
      render: ({ category }) =>
        category.children_count ? `${category.children_count} sous-catégorie${category.children_count > 1 ? "s" : ""}` : "—",
    },
    { key: "sort_order", header: translate("col.sortOrder"), width: "90px", align: "right", render: ({ category }) => category.sort_order },
    {
      key: "status",
      header: translate("col.status"),
      width: "110px",
      render: ({ category }) => <Badge tone={category.is_active ? "success" : "neutral"}>{category.is_active ? "Active" : "Inactive"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      width: "88px",
      align: "right",
      render: ({ category }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            title={translate("tooltip.edit")}
            onClick={() => {
              setEditing(category);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title={translate("tooltip.delete")} onClick={() => setToDelete(category)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Produits", href: routes.products.list }, { label: translate("nav.products.categories") }]}
        title={translate("page.productCategories.title")}
        description={translate("page.productCategories.desc")}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nouvelle catégorie
          </Button>
        }
      />

      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.arborescence")}</p>
          <p className="text-xs text-text-tertiary">{translate("t.uneCategorieContenantDesSousCategoriesNePeutPasEtreSup")}</p>
        </div>
        <DataTable
          columns={columns}
          data={rows}
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          onRetry={() => query.refetch()}
          rowKey={({ category }) => category.id}
          emptyTitle={translate("page.clientCategories.empty")}
          emptyDescription={translate("page.productCategories.emptyDesc")}
        />
      </div>

      <ProductCategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editing} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.productCategories.deleteTitle")}
        description={
          toDelete?.children_count || toDelete?.products_count
            ? translate("t.desSousCategoriesOuDesProduitsYSontEncoreRattaches")
            : translate("t.cetteActionEstIrreversible")
        }
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
