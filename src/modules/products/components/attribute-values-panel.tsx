"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FormField } from "@/components/forms/form-section";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { useCreateAttributeValue, useDeleteAttributeValue, useUpdateAttributeValue } from "../hooks/use-product-attributes";
import { cn } from "@/lib/utils";
import type { ProductAttribute, ProductAttributeValue } from "../types";
import { translate } from "@/i18n/translate";

/** Sous-panneau des valeurs prédéfinies d'un attribut `SELECT` (Doc/spec_pages_produits.md § 5). */
export function AttributeValuesPanel({ attribute }: { attribute: ProductAttribute }) {
  const createMutation = useCreateAttributeValue();
  const updateMutation = useUpdateAttributeValue();
  const deleteMutation = useDeleteAttributeValue();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductAttributeValue | null>(null);
  const [value, setValue] = useState("");
  const [toDelete, setToDelete] = useState<ProductAttributeValue | null>(null);

  const values = [...(attribute.values ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  function openCreate() {
    setEditing(null);
    setValue("");
    setDialogOpen(true);
  }

  function openEdit(entry: ProductAttributeValue) {
    setEditing(entry);
    setValue(entry.value);
    setDialogOpen(true);
  }

  function submit() {
    if (!value.trim()) return;
    if (editing) {
      updateMutation.mutate({ attributeId: attribute.id, valueId: editing.id, payload: { value } }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMutation.mutate({ attributeId: attribute.id, payload: { value } }, { onSuccess: () => setDialogOpen(false) });
    }
  }

  const SUB_GRID_TEMPLATE = "minmax(0,2fr) 140px 130px";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{translate("t.valeursPredefinies")}</p>
        <Button variant="ghost" size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" />{translate("action.add")}</Button>
      </div>
      {values.length === 0 ? (
        <p className="px-1 text-xs text-muted-foreground">{translate("t.aucuneValeurPredefiniePourCetAttribut")}</p>
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
          <div
            className="grid items-center gap-3 border-b border-border bg-surface-subtle px-3"
            style={{ gridTemplateColumns: SUB_GRID_TEMPLATE, minHeight: "36px" }}
          >
            {["VALEUR", "ORDRE", ""].map((label, index) => (
              <div key={index} className="text-[9.5px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                {label}
              </div>
            ))}
          </div>
          {values.map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                "grid items-center gap-3 px-3 hover:bg-surface-subtle",
                index < values.length - 1 && "border-b border-border",
              )}
              style={{ gridTemplateColumns: SUB_GRID_TEMPLATE, minHeight: "40px" }}
            >
              <span className="truncate text-[12.5px] font-semibold text-foreground">{entry.value}</span>
              <span className="text-right text-[12.5px] text-muted-foreground">{entry.sort_order}</span>
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" title="Modifier" onClick={() => openEdit(entry)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" title="Supprimer" onClick={() => setToDelete(entry)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[380px] p-0">
          <DialogFormHeader title={editing ? "Modifier la valeur" : "Nouvelle valeur"} pending={createMutation.isPending || updateMutation.isPending} />
          <div className="px-6 py-5">
            <FormField label={translate("field.valeur")} htmlFor="attribute_value">
              <Input id="attribute_value" value={value} onChange={(event) => setValue(event.target.value)} />
            </FormField>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{translate("action.cancel")}</Button>
            <Button type="button" onClick={submit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFormFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("t.supprimerCetteValeur")}
        description={translate("t.cetteActionEstIrreversible")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate({ attributeId: attribute.id, valueId: toDelete.id }, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
