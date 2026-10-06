"use client";

import { useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { TableSection } from "@/components/data-display/table-section";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { SupplierContactFormDialog } from "./supplier-contact-form-dialog";
import { useDeleteSupplierContact, useSupplierContacts } from "../hooks/use-supplier-contacts";
import type { SupplierContact } from "../types";
import { translate } from "@/i18n/translate";

export function ContactsTab({ supplierId }: { supplierId: number }) {
  const query = useSupplierContacts(supplierId);
  const deleteMutation = useDeleteSupplierContact(supplierId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierContact | null>(null);
  const [toDelete, setToDelete] = useState<SupplierContact | null>(null);

  const columns: DataTableColumn<SupplierContact>[] = [
    { key: "name", header: "Nom complet", render: (row) => row.full_name },
    { key: "role", header: "Fonction", render: (row) => row.role_title ?? "—" },
    { key: "phone", header: translate("badge.suppliers.communicationChannel.PHONE"), render: (row) => row.phone ?? "—" },
    { key: "wechat", header: "WeChat", render: (row) => row.wechat_id ?? "—" },
    { key: "email", header: "E-mail", render: (row) => row.email ?? "—" },
    { key: "primary", header: "", render: (row) => (row.is_primary ? <Badge tone="accent"><Star className="mr-1 h-3 w-3" />{translate("t.principal")}</Badge> : null) },
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
        title="CONTACTS"
        hint={translate("t.unSeulContactPrincipalParFournisseur")}
        action={
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Ajouter un contact
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
          emptyTitle="Aucun contact"
          emptyDescription="Ajoutez l'interlocuteur principal de ce fournisseur."
          className="rounded-t-none border-0"
        />
      </TableSection>
      <SupplierContactFormDialog open={formOpen} onOpenChange={setFormOpen} supplierId={supplierId} contact={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer ce contact ?"
        description={translate("t.cetteActionEstIrreversible")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </div>
  );
}
