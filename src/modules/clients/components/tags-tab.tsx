"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { useTags } from "@/modules/reference-data/hooks/use-tags";
import { useSyncClientTags } from "../hooks/use-sync-client-tags";
import { cn } from "@/lib/utils";
import type { Tag } from "@/modules/reference-data/types";
import { translate } from "@/i18n/translate";

/**
 * Onglet « Étiquettes » (Doc/spec_pages_clients.md § Onglet Étiquettes),
 * calqué sur le tableau ÉTIQUETTES de NJ Global Trade Clients.dc.html
 * (lignes 1245-1266, `clientTab` cas "tags") : une ligne par étiquette
 * existante avec une action assignée/assigner, comme `ProductTagsTab` côté
 * Produits — plutôt que des puces libres, `PUT /clients/{id}/tags`.
 */
export function TagsTab({ clientId, assignedTags }: { clientId: number; assignedTags: Tag[] }) {
  const tagsQuery = useTags();
  const syncMutation = useSyncClientTags(clientId);

  // Resynchronise la sélection quand le serveur renvoie une nouvelle liste
  // (après un `sync` réussi, ou un changement de client) — dérivé pendant le
  // rendu plutôt que dans un effet (pattern React "adjusting state when a
  // prop changes"), pour éviter un rendu en cascade inutile.
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
      header: translate("badge.audit.entityType.Tag"),
      width: "minmax(180px,2.4fr)",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
          <span className="truncate font-medium text-foreground">{row.name}</span>
        </div>
      ),
    },
    { key: "slug", header: "Slug", width: "minmax(120px,1.6fr)", render: (row) => <span className="text-text-tertiary">{row.slug}</span> },
    {
      key: "assigned",
      header: translate("t.assignee"),
      width: "160px",
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
            {on ? translate("t.assignee") : "Assigner"}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-text-tertiary">
          {isDirty ? translate("t.modificationsNonEnregistreesCliquezSurEnregistrerL2") : translate("t.referentielPartageAvecLeModuleProduits")}
        </p>
        {isDirty ? (
          <Button size="sm" disabled={syncMutation.isPending} onClick={() => syncMutation.mutate(Array.from(selected))}>
            Enregistrer les étiquettes
          </Button>
        ) : null}
      </div>
      <DataTable
        columns={columns}
        data={tagsQuery.data}
        isLoading={tagsQuery.isLoading}
        rowKey={(row) => row.id}
        emptyTitle={translate("t.aucuneEtiquetteDefinie")}
        emptyDescription={translate("t.creezDesEtiquettesDepuisProduitsTags")}
      />
    </div>
  );
}
