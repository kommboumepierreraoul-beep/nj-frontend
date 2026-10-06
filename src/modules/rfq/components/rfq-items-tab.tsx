"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { TableSection } from "@/components/data-display/table-section";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { RfqItemFormDialog } from "./rfq-item-form-dialog";
import { useDeleteRfqItem, useRfqItems } from "../hooks/use-rfq-items";
import { formatCurrency } from "@/lib/format";
import type { RfqItem } from "../types";
import { translate } from "@/i18n/translate";

export function RfqItemsTab({ rfqId }: { rfqId: number }) {
  const query = useRfqItems(rfqId);
  const deleteMutation = useDeleteRfqItem(rfqId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RfqItem | null>(null);
  const [toDelete, setToDelete] = useState<RfqItem | null>(null);

  const columns: DataTableColumn<RfqItem>[] = [
    { key: "product", header: "Produit / description", render: (row) => row.product?.name ?? row.custom_description ?? "—" },
    { key: "quantity", header: translate("field.quantiteCible"), render: (row) => `${row.target_quantity}${row.target_unit ? ` ${row.target_unit.name}` : ""}` },
    { key: "price", header: "Prix cible", render: (row) => (row.target_price !== null ? formatCurrency(row.target_price) : "—") },
    { key: "notes", header: "Notes", render: (row) => row.notes ?? "—" },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(row); setFormOpen(true); }}>
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
    <div className="space-y-4">
      <TableSection
        title={translate("t.articlesDemandes")}
        hint={translate("t.produitDuCatalogueOuDescriptionLibre")}
        action={
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Ajouter un article
          </Button>
        }
      >
        <DataTable
          columns={columns}
          data={query.data}
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          onRetry={() => query.refetch()}
          rowKey={(row) => row.id}
          emptyTitle="Aucun article"
          emptyDescription="Composez la demande avant de solliciter les fournisseurs."
          className="rounded-t-none border-0"
        />
      </TableSection>
      <RfqItemFormDialog open={formOpen} onOpenChange={setFormOpen} rfqId={rfqId} item={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer cet article ?"
        description={translate("t.cetteActionEstIrreversible")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </div>
  );
}
