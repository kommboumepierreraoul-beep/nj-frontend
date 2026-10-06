"use client";

import { useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { ClientContactFormDialog } from "./client-contact-form-dialog";
import { useClientContacts, useDeleteClientContact } from "../hooks/use-client-contacts";
import { getChannelIcon } from "@/config/channel-icons";
import type { ClientContact } from "../types";
import { translate } from "@/i18n/translate";

export function ContactsTab({ clientId }: { clientId: number }) {
  const query = useClientContacts(clientId);
  const deleteMutation = useDeleteClientContact(clientId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientContact | null>(null);
  const [toDelete, setToDelete] = useState<ClientContact | null>(null);

  const columns: DataTableColumn<ClientContact>[] = [
    {
      key: "channel",
      header: "Canal",
      render: (row) => {
        const ChannelIcon = getChannelIcon(row.channel_type.icon);
        return (
          <span className="flex items-center gap-1.5">
            <ChannelIcon className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
            {row.channel_type.label}
          </span>
        );
      },
    },
    { key: "value", header: "Valeur", render: (row) => row.value },
    { key: "label", header: translate("field.precision"), render: (row) => row.label ?? "—" },
    {
      key: "preferred",
      header: "",
      render: (row) => (row.is_preferred ? <Badge tone="accent"><Star className="mr-1 h-3 w-3" />{translate("t.prefere")}</Badge> : null),
    },
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
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" />
          Nouveau contact
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
        emptyTitle={translate("t.aucunContactEnregistre")}
      />
      <ClientContactFormDialog open={formOpen} onOpenChange={setFormOpen} clientId={clientId} contact={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer ce contact ?"
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
