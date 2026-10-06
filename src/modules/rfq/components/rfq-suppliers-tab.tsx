"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSection } from "@/components/data-display/table-section";
import { EmptyState } from "@/components/data-display/empty-state";
import { ErrorState } from "@/components/data-display/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { RfqSupplierFormDialog } from "./rfq-supplier-form-dialog";
import { RfqQuotesPanel } from "./rfq-quotes-panel";
import { useDeleteRfqSupplier, useRfqSuppliers } from "../hooks/use-rfq-suppliers";
import { RFQ_SUPPLIER_STATUS_LABELS, RFQ_SUPPLIER_STATUS_TONES } from "../badges";
import { formatDate } from "@/lib/format";
import type { RfqSupplier } from "../types";
import { translate } from "@/i18n/translate";

const GRID_TEMPLATE = "minmax(0,2fr) 130px 120px 120px minmax(0,1.4fr) 180px";

/**
 * Niveau 1 « Fournisseurs sollicités » (Doc/spec_pages_fournisseurs.md § 4) —
 * grille à colonnes fixes calquée sur NJ Global Trade Fournisseurs.dc.html
 * lignes 1386-1431, chaque ligne dépliable révélant ses devis (niveau 2, voir
 * RfqQuotesPanel) plutôt qu'une liste plate sans en-tête de colonnes.
 */
export function RfqSuppliersTab({ rfqId }: { rfqId: number }) {
  const query = useRfqSuppliers(rfqId);
  const deleteMutation = useDeleteRfqSupplier(rfqId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RfqSupplier | null>(null);
  const [toDelete, setToDelete] = useState<RfqSupplier | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const excludeSupplierIds = (query.data ?? []).map((entry) => entry.supplier.id);

  return (
    <div className="space-y-4">
      <TableSection
        title={translate("t.fournisseursSollicites")}
        hint={translate("t.depliezUneLignePourComparerLesDevisRecus")}
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Solliciter un fournisseur
          </Button>
        }
      >
        {query.isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : !query.data || query.data.length === 0 ? (
          <EmptyState title={translate("t.aucunFournisseurSollicite")} description={translate("t.sollicitezAuMoinsUnFournisseurPourRecevoirDesCotations")} size="lg" />
        ) : (
          <>
            <div className="grid items-center gap-3 border-b border-border bg-surface-subtle px-[18px]" style={{ gridTemplateColumns: GRID_TEMPLATE, minHeight: "44px" }}>
              {["FOURNISSEUR", "STATUT", "ENVOI", translate("t.reponse"), "NOTES", "ACTIONS"].map((label) => (
                <div key={label} className={`text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase ${label === "ACTIONS" ? "text-right" : ""}`}>
                  {label}
                </div>
              ))}
            </div>
            {query.data.map((entry) => {
              const isExpanded = expanded.has(entry.id);
              return (
                <div key={entry.id} className="border-b border-border last:border-b-0">
                  <div className="grid items-center gap-3 px-[18px] py-3 hover:bg-surface-subtle" style={{ gridTemplateColumns: GRID_TEMPLATE, minHeight: "48px" }}>
                    <button type="button" onClick={() => toggle(entry.id)} className="flex min-w-0 items-center gap-2.5 text-left">
                      {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                      <span className="min-w-0 truncate text-[13.5px] font-semibold text-foreground">{entry.supplier.company_name}</span>
                    </button>
                    <div>
                      <Badge tone={RFQ_SUPPLIER_STATUS_TONES[entry.status]}>{RFQ_SUPPLIER_STATUS_LABELS[entry.status]}</Badge>
                    </div>
                    <span className="text-[12.5px] text-muted-foreground">{entry.sent_at ? formatDate(entry.sent_at) : "—"}</span>
                    <span className="text-[12.5px] text-muted-foreground">{entry.response_date ? formatDate(entry.response_date) : "—"}</span>
                    <span className="min-w-0 truncate text-[12.5px] text-muted-foreground">{entry.notes ?? "—"}</span>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(entry);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setToDelete(entry)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {isExpanded ? (
                    <div className="bg-surface-subtle px-[18px] pb-[18px]">
                      <RfqQuotesPanel rfqId={rfqId} rfqSupplierId={entry.id} onQuoteSelected={() => query.refetch()} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </>
        )}
      </TableSection>

      <RfqSupplierFormDialog open={formOpen} onOpenChange={setFormOpen} rfqId={rfqId} entry={editing} excludeSupplierIds={excludeSupplierIds} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("t.retirerCeFournisseurDeLaRfq")}
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
