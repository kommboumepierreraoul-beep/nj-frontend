"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { SalesOrderItemAddDialog } from "./sales-order-item-add-dialog";
import { SalesOrderItemEditDialog } from "./sales-order-item-edit-dialog";
import { useDeleteSalesOrderItem, useSalesOrderItems } from "../hooks/use-sales-order-items";
import { SALES_ORDER_ITEM_TYPE_LABELS } from "../badges";
import { formatCurrency } from "@/lib/format";
import type { SalesOrderItem, SalesOrderType } from "../types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_commandes.md § 2 « Onglet Lignes » — ajout/modification/suppression recalcule `subtotal_amount`/`total_amount` côté serveur, jamais la commission (figée à la création). */
export function SalesOrderItemsTab({ salesOrderId, orderType, currencyCode }: { salesOrderId: number; orderType: SalesOrderType; currencyCode: string }) {
  const query = useSalesOrderItems(salesOrderId);
  const deleteMutation = useDeleteSalesOrderItem(salesOrderId);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<SalesOrderItem | null>(null);
  const [toDelete, setToDelete] = useState<SalesOrderItem | null>(null);

  const columns: DataTableColumn<SalesOrderItem>[] = [
    { key: "type", header: "Type", render: (row) => SALES_ORDER_ITEM_TYPE_LABELS[row.item_type] },
    { key: "designation", header: "Produit / prestation", render: (row) => (row.product_variant ? `${row.product_variant.sku} — ${row.product_variant.name}` : row.label) },
    { key: "quantity", header: translate("field.quantite"), render: (row) => row.quantity },
    { key: "unit_price", header: "Prix unitaire", render: (row) => formatCurrency(row.unit_price, currencyCode) },
    { key: "discount", header: "Remise", render: (row) => (row.discount_amount ? formatCurrency(row.discount_amount, currencyCode) : "—") },
    { key: "subtotal", header: "Sous-total", render: (row) => formatCurrency(row.quantity * row.unit_price - row.discount_amount, currencyCode) },
    {
      key: "badges",
      header: translate("col.state"),
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.is_proposed_option ? <Badge tone="neutral">{translate("t.optionProposee")}</Badge> : null}
          {row.is_selected ? <Badge tone="success">{translate("t.retenue")}</Badge> : <span className="text-xs text-text-tertiary">{translate("t.nonRetenue")}</span>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditing(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setToDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const items = query.data ?? [];
  const canSend = items.some((item) => item.is_selected);
  /** Doc/spec_pages_commandes.md § « Onglet Lignes » — même rappel que la maquette (NJ Global Trade Commandes.dc.html lignes 1836-1838). */
  const hint =
    orderType === "PRODUIT_UNIQUE_MULTI_CHOIX"
      ? translate("t.uneSeuleOptionDoitResterRetenueUneFoisLeClientDeci")
      : canSend
        ? translate("t.touteModificationRecalculeSousTotalEtTotalLaCommis")
        : translate("t.aucuneLigneRetenueLEnvoiDuProformaSeraRefuse");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-muted-foreground">{hint}</p>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter une ligne
        </Button>
      </div>
      <DataTable columns={columns} data={query.data} isLoading={query.isLoading} isError={query.isError} error={query.error} onRetry={() => query.refetch()} rowKey={(row) => row.id} emptyTitle="Aucune ligne" />
      <SalesOrderItemAddDialog open={addOpen} onOpenChange={setAddOpen} salesOrderId={salesOrderId} orderType={orderType} />
      <SalesOrderItemEditDialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)} salesOrderId={salesOrderId} item={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("t.supprimerCetteLigne")}
        description={translate("t.leSousTotalEtLeTotalDeLaCommandeSerontRecalcules")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </div>
  );
}
