"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { useTags } from "@/modules/reference-data/hooks/use-tags";
import { useSyncProductTags } from "../hooks/use-product-mutations";
import { cn } from "@/lib/utils";
import type { Tag } from "@/modules/reference-data/types";
import { translate } from "@/i18n/translate";

/**
 * Onglet « Tags » de la fiche produit (Doc/spec_pages_produits.md § 3.2),
 * calqué sur le tableau TAGS ASSIGNÉS de NJ Global Trade Produits.dc.html
 * (lignes 1376-1397) : une ligne par tag existant avec une action
 * assigné/assigner, plutôt qu'une liste de puces à cocher.
 */
export function ProductTagsTab({ productId, assignedTags }: { productId: number; assignedTags: Tag[] }) {
  const tagsQuery = useTags();
  const syncMutation = useSyncProductTags(productId);

  const assignedKey = assignedTags
    .map((tag) => tag.id)
    .sort((a, b) => a - b)
    .join(",");
  const [syncedKey, setSyncedKey] = useState(assignedKey);
  const [selected, setSelected] = useState<Set<number>>(() => new Set(assignedTags.map((tag) => tag.id)));
  if (assignedKey !== syncedKey) {
    setSyncedKey(assignedKey);
    setSelected(new Set(assignedTags.map((tag) => tag.id)));
  }

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isDirty = selected.size !== assignedTags.length || assignedTags.some((tag) => !selected.has(tag.id));

  const columns: DataTableColumn<Tag>[] = [
    {
      key: "tag",
      header: "Tag",
      width: "minmax(180px,2.4fr)",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
          <span className="truncate font-medium text-foreground">{row.name}</span>
        </div>
      ),
    },
    { key: "slug", header: "Slug", width: "minmax(120px,1.4fr)", render: (row) => <span className="text-text-tertiary">{row.slug}</span> },
    { key: "count", header: translate("t.produitsAssocies"), width: "150px", render: (row) => `${row.products_count ?? 0} produits` },
    {
      key: "assigned",
      header: translate("t.assigne"),
      width: "140px",
      render: (row) => {
        const on = selected.has(row.id);
        return (
          <button
            type="button"
            onClick={() => toggle(row.id)}
            className={cn(
              "flex items-center gap-1.5 text-[13px] font-semibold",
              on ? "text-success" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {on ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            {on ? translate("t.assigne") : "Assigner"}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.tagsAssignes")}</p>
          <p className="text-xs text-text-tertiary">
            {isDirty ? translate("t.modificationsNonEnregistreesCliquezSurEnregistrerL") : translate("t.cochezLesTagsAAssignerPuisEnregistrez")}
          </p>
        </div>
        {isDirty ? (
          <Button size="sm" disabled={syncMutation.isPending} onClick={() => syncMutation.mutate(Array.from(selected))}>
            Enregistrer les tags
          </Button>
        ) : null}
      </div>
      <DataTable
        columns={columns}
        data={tagsQuery.data}
        isLoading={tagsQuery.isLoading}
        rowKey={(row) => row.id}
        emptyTitle={translate("t.aucunTagDefini")}
        emptyDescription={translate("t.creezDesTagsDepuisProduitsTags")}
      />
    </div>
  );
}
