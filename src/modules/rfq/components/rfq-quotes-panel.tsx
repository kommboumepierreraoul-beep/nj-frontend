"use client";

import { useState } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { RfqQuoteFormDialog } from "./rfq-quote-form-dialog";
import { useDeleteRfqQuote, useRfqQuotes, useSelectRfqQuote } from "../hooks/use-rfq-quotes";
import { formatCurrency, formatDate } from "@/lib/format";
import type { RfqSupplierQuote } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Niveau 2 « Devis » d'un fournisseur sollicité (Doc/spec_pages_fournisseurs.md
 * § 4). `onQuoteSelected` remonte l'info au tableau parent pour rafraîchir la
 * liste des fournisseurs sollicités après une sélection.
 */
export function RfqQuotesPanel({ rfqId, rfqSupplierId, onQuoteSelected }: { rfqId: number; rfqSupplierId: number; onQuoteSelected?: () => void }) {
  const query = useRfqQuotes(rfqSupplierId);
  const deleteMutation = useDeleteRfqQuote(rfqSupplierId);
  const selectMutation = useSelectRfqQuote(rfqSupplierId);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<RfqSupplierQuote | null>(null);

  const columns: DataTableColumn<RfqSupplierQuote>[] = [
    { key: "item", header: "Article", render: (row) => row.rfq_item.product?.name ?? row.rfq_item.custom_description ?? "—" },
    { key: "price", header: "Prix unitaire", render: (row) => formatCurrency(row.quoted_unit_price, row.currency.code) },
    { key: "moq", header: "MOQ", render: (row) => row.quoted_moq ?? "—" },
    { key: "lead_time", header: translate("t.delaiJ"), render: (row) => row.quoted_lead_time_days ?? "—" },
    { key: "quoted_at", header: "Date de cotation", render: (row) => formatDate(row.quoted_at) },
    { key: "selected", header: "", render: (row) => (row.is_selected ? <Badge tone="success">{translate("t.retenu")}</Badge> : null) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          {!row.is_selected ? (
            <Button
              variant="ghost"
              size="icon"
              title={translate("t.selectionnerCeDevis")}
              onClick={() => selectMutation.mutate(row.id, { onSuccess: () => onQuoteSelected?.() })}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" onClick={() => setToDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-2.5">
        <span className="text-[10.5px] font-semibold tracking-[0.11em] text-muted-foreground uppercase">{translate("t.devisRecus")}</span>
        <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Ajouter un devis
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={query.data}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        rowKey={(row) => row.id}
        emptyTitle="Aucun devis"
        emptyDescription={translate("t.aucunDevisRecuDeCeFournisseur")}
        className="rounded-none border-0"
      />
      <RfqQuoteFormDialog open={formOpen} onOpenChange={setFormOpen} rfqId={rfqId} rfqSupplierId={rfqSupplierId} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer ce devis ?"
        description={translate("t.cetteActionEstIrreversible")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </div>
  );
}
