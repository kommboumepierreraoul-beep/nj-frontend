"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/data-display/page-header";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { TagFormDialog } from "@/modules/products/components/tag-form-dialog";
import { useDeleteTag, useTags } from "@/modules/reference-data/hooks/use-tags";
import { routes } from "@/config/routes";
import type { Tag } from "@/modules/reference-data/types";
import { translate } from "@/i18n/translate";

export default function ProductTagsPage() {
  const query = useTags();
  const deleteMutation = useDeleteTag();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [toDelete, setToDelete] = useState<Tag | null>(null);

  const columns: DataTableColumn<Tag>[] = [
    {
      key: "badge",
      header: translate("col.tag"),
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${row.color}1a`, color: row.color }}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
          {row.name}
        </span>
      ),
    },
    { key: "slug", header: translate("col.slug"), render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.slug}</span> },
    { key: "count", header: translate("col.products"), render: (row) => row.products_count ?? "—" },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setToDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Produits", href: routes.products.list }, { label: "Tags" }]}
        title={translate("page.tags.title")}
        description={translate("page.tags.desc")}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nouveau tag
          </Button>
        }
      />

      <div>
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.tags")}</p>
        <p className="text-xs text-text-tertiary">{translate("t.leSlugEstGenereAutomatiquementDepuisLeNom")}</p>
      </div>

      <DataTable
        columns={columns}
        data={query.data}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        rowKey={(row) => row.id}
        emptyTitle={translate("page.tags.empty")}
        emptyDescription={translate("page.tags.emptyDesc")}
      />

      <TagFormDialog open={formOpen} onOpenChange={setFormOpen} tag={editing} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.tags.deleteTitle")}
        description={translate("page.tags.deleteDesc")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
