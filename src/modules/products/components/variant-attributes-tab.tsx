"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { AssignAttributeDialog } from "./assign-attribute-dialog";
import { useRemoveVariantAttribute } from "../hooks/use-variant-attributes";
import type { VariantAttributeValue } from "../types";
import { translate } from "@/i18n/translate";

export function VariantAttributesTab({
  productId,
  variantId,
  attributeValues,
}: {
  productId: number;
  variantId: number;
  attributeValues: VariantAttributeValue[];
}) {
  const deleteMutation = useRemoveVariantAttribute(productId, variantId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<VariantAttributeValue | null>(null);
  const [toDelete, setToDelete] = useState<VariantAttributeValue | null>(null);

  const columns: DataTableColumn<VariantAttributeValue>[] = [
    { key: "attribute", header: "Attribut", render: (row) => row.product_attribute.name },
    {
      key: "value",
      header: "Valeur",
      render: (row) =>
        row.product_attribute_value
          ? row.product_attribute_value.value
          : row.custom_value
            ? `${row.custom_value}${row.product_attribute.unit_suffix ? ` ${row.product_attribute.unit_suffix}` : ""}`
            : "—",
    },
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
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.attributsPersonnalises")}</p>
          <p className="text-xs text-text-tertiary">{translate("t.laSaisieDependDuTypeDeLAttribut")}</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Assigner un attribut
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={attributeValues}
        rowKey={(row) => row.id}
        emptyTitle={translate("t.aucunAttributAssigne")}
      />
      <AssignAttributeDialog open={formOpen} onOpenChange={setFormOpen} productId={productId} variantId={variantId} entry={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Retirer cet attribut ?"
        description={translate("t.cetteActionEstIrreversible")}
        confirmLabel="Retirer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
