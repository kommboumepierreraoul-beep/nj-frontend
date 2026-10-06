"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { CategoryBadge } from "@/modules/clients/components/category-badge";
import { ClientCategoryFormDialog } from "@/modules/clients/components/client-category-form-dialog";
import { useClientCategories, useDeleteClientCategory } from "@/modules/clients/hooks/use-client-categories";
import { routes } from "@/config/routes";
import type { ClientCategory } from "@/modules/clients/types";
import { translate } from "@/i18n/translate";

export default function ClientCategoriesPage() {
  const query = useClientCategories();
  const deleteMutation = useDeleteClientCategory();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientCategory | null>(null);
  const [toDelete, setToDelete] = useState<ClientCategory | null>(null);

  const columns: DataTableColumn<ClientCategory>[] = [
    { key: "badge", header: translate("col.badge"), render: (row) => <CategoryBadge category={row} /> },
    { key: "code", header: translate("col.code"), render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.code}</span> },
    {
      key: "status",
      header: translate("col.status"),
      render: (row) => <Badge tone={row.is_active ? "success" : "neutral"}>{row.is_active ? translate("value.activeF") : translate("value.inactiveF")}</Badge>,
    },
    { key: "count", header: translate("col.clients"), render: (row) => row.clients_count ?? "—" },
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
        breadcrumbs={[{ label: "Clients", href: routes.clients.list }, { label: "Provenances" }]}
        title={translate("page.clientCategories.title")}
        description={translate("page.clientCategories.desc")}
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

      <DataTable
        columns={columns}
        data={query.data}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        rowKey={(row) => row.id}
        emptyTitle={translate("page.clientCategories.empty")}
        emptyDescription={translate("page.clientCategories.emptyDesc")}
      />

      <ClientCategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editing} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.productCategories.deleteTitle")}
        description={
          toDelete?.clients_count
            ? `${toDelete.clients_count} client(s) y sont rattachés — la suppression sera refusée ; désactivez-la plutôt.`
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
