"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { TableSection } from "@/components/data-display/table-section";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { PurchaseOrderItemFormDialog } from "./purchase-order-item-form-dialog";
import { useDeletePurchaseOrderItem, usePurchaseOrderItems } from "../hooks/use-purchase-order-items";
import { formatCurrency } from "@/lib/format";
import type { PurchaseOrderItem } from "../types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_fournisseurs.md § 6 — sous-total calculé côté UI pour affichage seulement (le total commande vient du serveur). */
export function PurchaseOrderItemsTab({ poId, currencyCode }: { poId: number; currencyCode: string }) {
  const query = usePurchaseOrderItems(poId);
  const deleteMutation = useDeletePurchaseOrderItem(poId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrderItem | null>(null);
  const [toDelete, setToDelete] = useState<PurchaseOrderItem | null>(null);

  const columns: DataTableColumn<PurchaseOrderItem>[] = [
    { key: "variant", header: "Variante", render: (row) => `${row.product_variant.sku} — ${row.product_variant.name}` },
    { key: "quantity", header: translate("field.quantite"), render: (row) => row.quantity },
    { key: "unit_price", header: "Prix unitaire", render: (row) => formatCurrency(row.unit_price, currencyCode) },
    { key: "subtotal", header: "Sous-total", render: (row) => formatCurrency(row.quantity * row.unit_price, currencyCode) },
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
        title={translate("t.articlesDeLaCommande")}
        hint={translate("t.leSousTotalCalculeAffichageTotalRecalcule")}
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
          emptyDescription={translate("t.ajoutezLesVariantesCommandeesPourCalculerLeMontant")}
          className="rounded-t-none border-0"
        />
      </TableSection>
      <PurchaseOrderItemFormDialog open={formOpen} onOpenChange={setFormOpen} poId={poId} item={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer cet article ?"
        description={translate("t.leMontantTotalDeLaCommandeSeraRecalcule")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </div>
  );
}
