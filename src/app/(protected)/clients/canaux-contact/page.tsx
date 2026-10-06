"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { ContactChannelFormDialog } from "@/modules/clients/components/contact-channel-form-dialog";
import { useContactChannels, useDeleteContactChannel } from "@/modules/clients/hooks/use-contact-channels";
import { getChannelIcon } from "@/config/channel-icons";
import { routes } from "@/config/routes";
import type { ContactChannelType } from "@/modules/clients/types";
import { translate } from "@/i18n/translate";

export default function ContactChannelsPage() {
  const query = useContactChannels();
  const deleteMutation = useDeleteContactChannel();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContactChannelType | null>(null);
  const [toDelete, setToDelete] = useState<ContactChannelType | null>(null);

  const columns: DataTableColumn<ContactChannelType>[] = [
    {
      // NJ Global Trade Clients.dc.html § viewChannels (colonne "CANAL") : icône
      // + libellé dans la même cellule, comme pour tout référentiel à icône.
      key: "label",
      header: translate("col.channel"),
      render: (row) => {
        const ChannelIcon = getChannelIcon(row.icon);
        return (
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-background text-muted-foreground">
              <ChannelIcon className="h-4 w-4" />
            </span>
            <span className="truncate font-medium text-foreground">{row.label}</span>
          </span>
        );
      },
    },
    { key: "code", header: translate("col.code"), render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.code}</span> },
    {
      key: "icon",
      header: translate("col.icon"),
      render: (row) => <span className="font-mono text-xs text-text-tertiary">{row.icon || "—"}</span>,
    },
    {
      key: "status",
      header: translate("col.status"),
      render: (row) => <Badge tone={row.is_active ? "success" : "neutral"}>{row.is_active ? translate("value.active") : translate("value.inactive")}</Badge>,
    },
    { key: "count", header: translate("col.contacts"), render: (row) => row.contacts_count ?? "—" },
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
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Clients", href: routes.clients.list }, { label: "Canaux de contact" }]}
        title={translate("page.contactChannels.title")}
        description={translate("page.contactChannels.desc")}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nouveau canal
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={query.data}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        rowKey={(row) => row.id}
        emptyTitle={translate("page.contactChannels.empty")}
      />

      <ContactChannelFormDialog open={formOpen} onOpenChange={setFormOpen} channel={editing} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.contactChannels.deleteTitle")}
        description={
          toDelete?.contacts_count
            ? `${toDelete.contacts_count} contact(s) l'utilisent encore — la suppression sera refusée ; désactivez-le plutôt.`
            : translate("t.cetteActionEstIrreversible")
        }
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
