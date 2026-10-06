"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { TableSection } from "@/components/data-display/table-section";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { SupplierEvaluationFormDialog } from "./supplier-evaluation-form-dialog";
import { useDeleteSupplierEvaluation, useSupplierEvaluations } from "../hooks/use-supplier-evaluations";
import { formatDate } from "@/lib/format";
import type { SupplierEvaluation } from "../types";
import { translate } from "@/i18n/translate";

export function EvaluationsTab({ supplierId }: { supplierId: number }) {
  const query = useSupplierEvaluations(supplierId);
  const deleteMutation = useDeleteSupplierEvaluation(supplierId);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<SupplierEvaluation | null>(null);

  const columns: DataTableColumn<SupplierEvaluation>[] = [
    { key: "date", header: "Date", render: (row) => formatDate(row.evaluated_at) },
    { key: "po", header: translate("t.commandeLiee"), render: (row) => row.purchase_order?.reference ?? "—" },
    { key: "quality", header: translate("field.qualite"), render: (row) => `${row.quality_score}/5` },
    { key: "communication", header: "Communication", render: (row) => `${row.communication_score}/5` },
    { key: "delay", header: translate("t.delais"), render: (row) => `${row.delay_respect_score}/5` },
    { key: "price", header: "Prix", render: (row) => `${row.price_competitiveness_score}/5` },
    { key: "comment", header: "Commentaire", render: (row) => row.comment ?? "—" },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <Button variant="ghost" size="icon" onClick={() => setToDelete(row)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <TableSection
        title={translate("t.evaluations")}
        hint={translate("t.chaqueEnregistrementRecalculeLeScoreDeFiabiliteAffiche")}
        action={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle évaluation
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
          emptyTitle={translate("t.aucuneEvaluation")}
          emptyDescription={translate("t.notezCeFournisseurApresReceptionDUneCommande")}
          className="rounded-t-none border-0"
        />
      </TableSection>
      <SupplierEvaluationFormDialog open={formOpen} onOpenChange={setFormOpen} supplierId={supplierId} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("t.supprimerCetteEvaluation")}
        description={translate("t.leScoreDeFiabiliteDuFournisseurSeraRecalcule")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </div>
  );
}
