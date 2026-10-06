"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { TableSection } from "@/components/data-display/table-section";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { CommunicationLogFormDialog } from "./communication-log-form-dialog";
import { useDeleteSupplierCommunicationLog, useSupplierCommunicationLogs } from "../hooks/use-supplier-communication-logs";
import { COMMUNICATION_CHANNEL_LABELS } from "../badges";
import { formatDateTime } from "@/lib/format";
import type { SupplierCommunicationLog } from "../types";
import { translate } from "@/i18n/translate";

export function CommunicationLogsTab({ supplierId }: { supplierId: number }) {
  const query = useSupplierCommunicationLogs(supplierId);
  const deleteMutation = useDeleteSupplierCommunicationLog(supplierId);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<SupplierCommunicationLog | null>(null);

  const sorted = [...(query.data ?? [])].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

  const columns: DataTableColumn<SupplierCommunicationLog>[] = [
    { key: "channel", header: "Canal", render: (row) => COMMUNICATION_CHANNEL_LABELS[row.channel] },
    {
      key: "direction",
      header: "Sens",
      render: (row) => (row.direction === "INCOMING" ? <ArrowDownLeft className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-accent" />),
    },
    { key: "subject", header: "Sujet", render: (row) => row.subject ?? "—" },
    { key: "summary", header: translate("field.resume"), render: (row) => <span className="line-clamp-2">{row.summary}</span> },
    { key: "date", header: "Date", render: (row) => formatDateTime(row.occurred_at) },
    {
      key: "attachment",
      header: translate("badge.audit.entityType.Attachment"),
      render: (row) =>
        row.attachment ? (
          <a href={row.attachment.url} target="_blank" rel="noreferrer" className="text-accent-hover hover:underline">
            {row.attachment.file_name}
          </a>
        ) : (
          "—"
        ),
    },
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
        title="HISTORIQUE DE COMMUNICATION"
        hint={translate("t.journalChronologiqueDesEchangesAvecCeFournisseur")}
        action={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Journaliser un échange
          </Button>
        }
      >
        <DataTable
          columns={columns}
          data={sorted}
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          onRetry={() => query.refetch()}
          rowKey={(row) => row.id}
          emptyTitle={translate("t.aucunEchangeJournalise")}
          emptyDescription="Consignez appels, messages WeChat et e-mails pour garder une trace."
          className="rounded-t-none border-0"
        />
      </TableSection>
      <CommunicationLogFormDialog open={formOpen} onOpenChange={setFormOpen} supplierId={supplierId} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("t.supprimerCetteEntree")}
        description={translate("t.cetteActionEstIrreversible")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </div>
  );
}
