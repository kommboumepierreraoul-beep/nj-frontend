"use client";

import { useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { LinkSupplierDialog } from "./link-supplier-dialog";
import { useRemoveVariantSupplierLink } from "../hooks/use-variant-suppliers";
import { formatCurrency, formatDate } from "@/lib/format";
import type { VariantSupplierLink } from "../types";
import { translate } from "@/i18n/translate";

export function VariantSuppliersTab({ productId, variantId, links }: { productId: number; variantId: number; links: VariantSupplierLink[] }) {
  const deleteMutation = useRemoveVariantSupplierLink(productId, variantId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<VariantSupplierLink | null>(null);
  const [toDelete, setToDelete] = useState<VariantSupplierLink | null>(null);

  const columns: DataTableColumn<VariantSupplierLink>[] = [
    { key: "supplier", header: "Fournisseur", render: (row) => row.supplier.name },
    { key: "sku", header: "SKU fournisseur", render: (row) => row.supplier_sku ?? "—" },
    { key: "price", header: "Prix unitaire", render: (row) => formatCurrency(row.unit_price, row.currency.code) },
    { key: "moq", header: "MOQ", render: (row) => row.moq ?? "—" },
    { key: "lead_time", header: translate("t.delaiJ"), render: (row) => row.lead_time_days ?? "—" },
    {
      key: "preferred",
      header: "",
      render: (row) => (row.is_preferred ? <Badge tone="accent"><Star className="mr-1 h-3 w-3" />{translate("t.prefere")}</Badge> : null),
    },
    { key: "last_quoted", header: translate("field.derniereCotation"), render: (row) => (row.last_quoted_at ? formatDate(row.last_quoted_at) : "—") },
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.fournisseursLies")}</p>
          <p className="text-xs text-text-tertiary">{translate("t.unSeulFournisseurPrefereParVariante")}</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Lier un fournisseur
        </Button>
      </div>
      <DataTable columns={columns} data={links} rowKey={(row) => row.id} emptyTitle={translate("t.aucunFournisseurLie")} />
      <LinkSupplierDialog open={formOpen} onOpenChange={setFormOpen} productId={productId} variantId={variantId} link={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("t.supprimerCetteLiaison")}
        description={translate("t.cetteActionEstIrreversible")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
