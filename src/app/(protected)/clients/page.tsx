"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tag, Network, User, Eye, ShieldAlert, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { ListPageActions } from "@/components/data-display/list-page-actions";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { PageSuspense } from "@/components/layout/page-suspense";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { ExportDialog } from "@/components/forms/export-dialog";
import { ImportDialog } from "@/components/forms/import-dialog";
import { useQueryParams } from "@/hooks/use-query-params";
import { useClientsList } from "@/modules/clients/hooks/use-clients-list";
import { useClientCategories } from "@/modules/clients/hooks/use-client-categories";
import { useDeleteClient } from "@/modules/clients/hooks/use-client-mutations";
import { ClientFilters } from "@/modules/clients/components/client-filters";
import { ClientFormDialog } from "@/modules/clients/components/client-form-dialog";
import { ChangeStatusDialog } from "@/modules/clients/components/change-status-dialog";
import { clientsApi } from "@/modules/clients/api/clients.api";
import { buildClientsListRows } from "@/modules/clients/export";
import { CLIENT_IMPORT_COLUMNS, makeImportClientRow } from "@/modules/clients/import";
import { CLIENT_STATUS_TONES, CLIENT_TYPE_LABELS, VALUE_SEGMENT_LABELS, VALUE_SEGMENT_TONES } from "@/modules/clients/badges";
import { CLIENT_STATUS_LABELS } from "@/modules/clients/badges";
import type { Client, ClientListFilters } from "@/modules/clients/types";
import { routes } from "@/config/routes";
import { formatCountryLabel } from "@/lib/countries";
import { exportRows, exportStamp, type ExportFormat } from "@/lib/export";
import { ApiError } from "@/lib/http/api-error";
import { storageUrl } from "@/lib/media";
import { getChannelIcon } from "@/config/channel-icons";
import { translate } from "@/i18n/translate";

export default function ClientsPage() {
  return (
    <PageSuspense>
      <ClientsPageContent />
    </PageSuspense>
  );
}

function ClientsPageContent() {
  const [filters, setFilters] = useQueryParams<Required<Pick<ClientListFilters, "page">> & ClientListFilters>({
    page: 1,
    category_id: undefined,
    status: undefined,
    client_type: undefined,
    value_segment: undefined,
    search: undefined,
  });

  const query = useClientsList(filters);
  const categoriesQuery = useClientCategories();
  const router = useRouter();
  const deleteMutation = useDeleteClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [statusClient, setStatusClient] = useState<Client | null>(null);
  const [toDelete, setToDelete] = useState<Client | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport(format: ExportFormat) {
    setIsExporting(true);
    try {
      const response = await clientsApi.list({ ...filters, page: 1, per_page: 1000 });
      const ok = exportRows(format, `clients-${exportStamp()}`, "Portefeuille clients", buildClientsListRows(response.data));
      if (!ok) {
        toast.error(translate("t.leNavigateurABloqueLaFenetreAutorisezLesPopUps"));
        return;
      }
      toast.success(`Export ${format} généré — ${response.data.length} client(s).`);
      setExportOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Export impossible.");
    } finally {
      setIsExporting(false);
    }
  }

  const columns: DataTableColumn<Client>[] = [
    {
      // Le badge de provenance (icône ou logo) vit dans la cellule du client,
      // pas dans une colonne séparée — NJ Global Trade Clients.dc.html
      // lignes 1044-1054 (`badgeCell`) : icône/couleur de la catégorie +
      // nom + dénomination légale + puce "PROVENANCE" en majuscules.
      key: "full_name",
      header: translate("col.client"),
      width: "minmax(240px,2.4fr)",
      render: (row) => {
        const cat = row.category;
        const logoUrl = storageUrl(cat?.badge_image_path);
        const hasLogo = Boolean(logoUrl);
        const color = cat?.badge_color ?? "#666666";
        return (
          <Link href={routes.clients.detail(row.id)} className="group flex min-w-0 items-center gap-3">
            <span
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border"
              style={{ backgroundColor: cat ? (hasLogo ? "var(--color-surface-subtle)" : `${color}1a`) : "var(--color-surface-subtle)" }}
            >
              {logoUrl ? (
                <Image src={logoUrl} alt="" width={18} height={18} className="h-[18px] w-[18px] rounded-full object-cover" unoptimized />
              ) : cat ? (
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              ) : (
                <User className="h-[18px] w-[18px] text-text-quaternary" />
              )}
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="truncate font-medium text-foreground group-hover:text-accent-hover">{row.full_name}</span>
              <span className="flex min-w-0 items-center gap-2">
                {row.legal_name ? <span className="truncate text-[11px] font-medium text-text-tertiary">{row.legal_name}</span> : null}
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-wide whitespace-nowrap"
                  style={{
                    backgroundColor: cat ? (hasLogo ? "var(--color-surface-subtle)" : `${color}1a`) : "var(--color-surface-subtle)",
                    color: cat ? (hasLogo ? "var(--color-muted-foreground)" : color) : "var(--color-text-tertiary)",
                  }}
                >
                  {cat ? cat.label.toUpperCase() : translate("t.sansCategorie2")}
                </span>
              </span>
            </span>
          </Link>
        );
      },
    },
    { key: "client_type", header: translate("col.type"), render: (row) => CLIENT_TYPE_LABELS[row.client_type] },
    { key: "country", header: translate("col.country"), render: (row) => formatCountryLabel(row.country) },
    {
      key: "status",
      header: translate("col.status"),
      render: (row) => <Badge tone={CLIENT_STATUS_TONES[row.status]}>{CLIENT_STATUS_LABELS[row.status]}</Badge>,
    },
    {
      key: "value_segment",
      header: translate("col.segment"),
      render: (row) => <Badge tone={VALUE_SEGMENT_TONES[row.value_segment]}>{VALUE_SEGMENT_LABELS[row.value_segment]}</Badge>,
    },
    {
      key: "contact",
      header: translate("col.preferredContact"),
      render: (row) => {
        if (!row.preferred_contact) return "—";
        const ChannelIcon = getChannelIcon(row.preferred_contact.channel_type.icon);
        return (
          <span className="flex min-w-0 items-center gap-1.5">
            <ChannelIcon className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
            <span className="truncate">
              {row.preferred_contact.channel_type.label} · {row.preferred_contact.value}
            </span>
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      width: "150px",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" title={translate("tooltip.open")} onClick={() => router.push(routes.clients.detail(row.id))}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title={translate("tooltip.changeStatus")} onClick={() => setStatusClient(row)}>
            <ShieldAlert className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={translate("tooltip.edit")}
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title={translate("tooltip.delete")} onClick={() => setToDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={translate("page.clients.title")}
        description={translate("page.clients.desc")}
        actions={
          <ListPageActions
            secondary={
              <>
                <Button variant="outline" asChild>
                  <Link href={routes.clients.categories}>
                    <Tag className="h-4 w-4" />
                    Catégories
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={routes.clients.contactChannels}>
                    <Network className="h-4 w-4" />
                    Canaux
                  </Link>
                </Button>
              </>
            }
            onImport={() => setImportOpen(true)}
            onExport={() => setExportOpen(true)}
            newLabel={translate("page.clients.new")}
            onNew={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            busy={isExporting}
          />
        }
      />

      <ClientFilters filters={filters} onChange={(patch) => setFilters({ ...patch, page: 1 })} />

      <DataTable
        columns={columns}
        data={query.data?.data}
        meta={query.data?.meta}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        onPageChange={(page) => setFilters({ page })}
        rowKey={(row) => row.id}
        rowClassName={(row) => (row.status === "BLOQUE" ? "bg-destructive-bg/40" : undefined)}
        emptyTitle={translate("page.clients.empty")}
        emptyDescription={translate("page.clients.emptyDesc")}
      />

      <ClientFormDialog open={formOpen} onOpenChange={setFormOpen} client={editing} />

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title={translate("page.clients.exportTitle")}
        subtitle={translate("export.subtitle")}
        note={typeof query.data?.meta?.total === "number" ? `${query.data.meta.total} client(s) seront exportés.` : undefined}
        defaultFormat="XLSX"
        isPending={isExporting}
        onSubmit={(format) => handleExport(format)}
      />

      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title={translate("page.clients.importTitle")}
        entityLabel="client(s)"
        columns={CLIENT_IMPORT_COLUMNS}
        templateName="modele-import-clients"
        createOne={makeImportClientRow(categoriesQuery.data ?? [])}
        onDone={() => query.refetch()}
      />

      {statusClient ? (
        <ChangeStatusDialog
          open={Boolean(statusClient)}
          onOpenChange={(open) => !open && setStatusClient(null)}
          clientId={statusClient.id}
          currentStatus={statusClient.status}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.clients.deleteTitle")}
        description={toDelete ? `« ${toDelete.full_name} » sera archivé (soft delete). Ses factures restent liées à l'enregistrement.` : undefined}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
