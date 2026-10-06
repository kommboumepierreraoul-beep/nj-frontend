"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { EmptyState } from "@/components/data-display/empty-state";
import { ErrorState } from "@/components/data-display/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { ProductAttributeFormDialog } from "@/modules/products/components/product-attribute-form-dialog";
import { AttributeValuesPanel } from "@/modules/products/components/attribute-values-panel";
import { useDeleteProductAttribute, useProductAttributes } from "@/modules/products/hooks/use-product-attributes";
import { ATTRIBUTE_INPUT_TYPE_LABELS } from "@/modules/products/badges";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import type { ProductAttribute } from "@/modules/products/types";
import { translate } from "@/i18n/translate";

/**
 * Colonnes calquées sur NJ Global Trade Produits.dc.html lignes 1521-1559
 * (ATTRIBUT / CODE / TYPE DE SAISIE / SUFFIXE / FILTRABLE / ACTIONS, ligne
 * dépliable vers le sous-panneau des valeurs prédéfinies pour un attribut
 * `SELECT`). Grille manuelle plutôt que `DataTable` (§ 2.3) : ce composant
 * transverse ne supporte pas de sous-ligne dépliable.
 */
const GRID_TEMPLATE = "minmax(0,2fr) 140px 150px 120px 120px 96px";

export default function ProductAttributesPage() {
  const query = useProductAttributes();
  const deleteMutation = useDeleteProductAttribute();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductAttribute | null>(null);
  const [toDelete, setToDelete] = useState<ProductAttribute | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Produits", href: routes.products.list }, { label: "Attributs" }]}
        title={translate("page.productAttributes.title")}
        description={translate("page.productAttributes.desc")}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nouvel attribut
          </Button>
        }
      />

      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.attributs")}</p>
          <p className="text-xs text-text-tertiary">{translate("t.depliezUnAttributDeTypeSelectPourGererSesValeursPredef")}</p>
        </div>

        <div className="overflow-x-auto rounded-[14px] border border-border bg-surface">
          <div style={{ minWidth: "760px" }}>
            <div
              className="grid items-center gap-3 border-b border-border bg-surface-subtle px-[18px]"
              style={{ gridTemplateColumns: GRID_TEMPLATE, minHeight: "44px" }}
            >
              {["ATTRIBUT", "CODE", "TYPE DE SAISIE", "SUFFIXE", "FILTRABLE", ""].map((label, index) => (
                <div key={index} className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  {label}
                </div>
              ))}
            </div>

            {query.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="grid items-center gap-3 border-b border-border px-[18px] py-3 last:border-b-0"
                  style={{ gridTemplateColumns: GRID_TEMPLATE, minHeight: "48px" }}
                >
                  {Array.from({ length: 6 }).map((__, col) => (
                    <Skeleton key={col} className="h-4 w-full max-w-[160px]" />
                  ))}
                </div>
              ))
            ) : query.isError ? (
              <ErrorState error={query.error} onRetry={() => query.refetch()} />
            ) : !query.data || query.data.length === 0 ? (
              <EmptyState title={translate("page.productAttributes.empty")} description={translate("page.productAttributes.emptyDesc")} size="lg" />
            ) : (
              query.data.map((attribute) => {
                const isSelect = attribute.input_type === "SELECT";
                const isExpanded = isSelect && expanded.has(attribute.id);
                return (
                  <div key={attribute.id} className="border-b border-border last:border-b-0">
                    <div
                      className="grid items-center gap-3 px-[18px] py-3 hover:bg-surface-subtle"
                      style={{ gridTemplateColumns: GRID_TEMPLATE, minHeight: "48px" }}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-background text-muted-foreground">
                          <SlidersHorizontal className="h-4 w-4" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          {isSelect ? (
                            <button
                              type="button"
                              onClick={() => toggle(attribute.id)}
                              className="flex items-center gap-1 truncate text-left text-[13.5px] font-semibold text-foreground hover:text-accent-hover"
                            >
                              {isExpanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                              {attribute.name}
                            </button>
                          ) : (
                            <span className="truncate text-[13.5px] font-semibold text-foreground">{attribute.name}</span>
                          )}
                          <span className="truncate text-[11px] text-text-tertiary">
                            {isSelect ? `${attribute.values?.length ?? 0} valeur(s) prédéfinie(s)` : "Saisie libre"}
                          </span>
                        </div>
                      </div>
                      <span className="truncate font-mono text-xs text-text-tertiary">{attribute.code}</span>
                      <div>
                        <Badge tone="neutral">{ATTRIBUTE_INPUT_TYPE_LABELS[attribute.input_type]}</Badge>
                      </div>
                      <span className="text-[13px] text-muted-foreground">{attribute.unit_suffix || "—"}</span>
                      <div>
                        {attribute.is_filterable ? <Badge tone="products">{translate("t.filtrable")}</Badge> : <span className="text-text-quaternary">—</span>}
                      </div>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={translate("tooltip.edit")}
                          onClick={() => {
                            setEditing(attribute);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title={translate("tooltip.delete")} onClick={() => setToDelete(attribute)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className={cn(!isExpanded && "hidden", "bg-surface-subtle px-[18px] pb-[18px] pt-1")}>
                      <div className="rounded-xl border border-border bg-surface p-3">
                        <AttributeValuesPanel attribute={attribute} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <ProductAttributeFormDialog open={formOpen} onOpenChange={setFormOpen} attribute={editing} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.productAttributes.deleteTitle")}
        description={translate("page.productAttributes.deleteDesc")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
