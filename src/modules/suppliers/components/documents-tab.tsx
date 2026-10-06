"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { TableSection } from "@/components/data-display/table-section";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { AttachmentDropzone } from "@/components/forms/attachment-dropzone";
import { SupplierDocumentFormDialog } from "./supplier-document-form-dialog";
import { useDeleteSupplierDocument, useSupplierDocuments } from "../hooks/use-supplier-documents";
import { DOCUMENT_TYPE_LABELS } from "../badges";
import { formatDate } from "@/lib/format";
import type { SupplierDocument } from "../types";
import { translate } from "@/i18n/translate";

function isExpiringSoon(expiryDate: string | null): "expired" | "soon" | null {
  if (!expiryDate) return null;
  const days = (new Date(expiryDate).getTime() - Date.now()) / 86_400_000;
  if (days < 0) return "expired";
  if (days <= 30) return "soon";
  return null;
}

export function DocumentsTab({ supplierId }: { supplierId: number }) {
  const query = useSupplierDocuments(supplierId);
  const deleteMutation = useDeleteSupplierDocument(supplierId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierDocument | null>(null);
  const [toDelete, setToDelete] = useState<SupplierDocument | null>(null);

  const columns: DataTableColumn<SupplierDocument>[] = [
    { key: "type", header: "Type", render: (row) => <Badge tone="neutral">{DOCUMENT_TYPE_LABELS[row.type]}</Badge> },
    {
      key: "file",
      header: "Fichier",
      render: (row) => (
        <a href={row.attachment.url} target="_blank" rel="noreferrer" className="text-accent-hover hover:underline">
          {row.attachment.file_name}
        </a>
      ),
    },
    { key: "issue", header: translate("col.issuedAt"), render: (row) => (row.issue_date ? formatDate(row.issue_date) : "—") },
    {
      key: "expiry",
      header: "Expire le",
      render: (row) => {
        const alert = isExpiringSoon(row.expiry_date);
        if (!row.expiry_date) return "—";
        return (
          <span className={alert ? "flex items-center gap-1 text-warning" : undefined}>
            {alert ? <TriangleAlert className="h-3.5 w-3.5" /> : null}
            {formatDate(row.expiry_date)}
          </span>
        );
      },
    },
    { key: "verified", header: "", render: (row) => (row.is_verified ? <Badge tone="success">{translate("t.verifie")}</Badge> : null) },
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
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{translate("t.1TeleverserUnFichier")}</p>
        <AttachmentDropzone attachableType="supplier" attachableId={supplierId} mediaTypes={["SUPPLIER_DOCUMENT", "OTHER"]} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{translate("t.2ReferencerUnDocument")}</p>
        <TableSection
          title="DOCUMENTS"
          hint={translate("t.lesDocumentsExpiresOuProchesDeLExpirationSontSignales")}
          action={
            <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" />
              Ajouter un document
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
            emptyTitle="Aucun document"
            emptyDescription={translate("t.televersezLaLicenceCommercialeEtLesCertificatsDuFo")}
            className="rounded-t-none border-0"
          />
        </TableSection>
      </div>
      <SupplierDocumentFormDialog open={formOpen} onOpenChange={setFormOpen} supplierId={supplierId} document={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer ce document ?"
        description={translate("t.actionIrreversibleFichierRestePj")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </div>
  );
}
