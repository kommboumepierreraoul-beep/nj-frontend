"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, KeyRound, MoreVertical, Pencil, LogOut, Mail, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/data-display/avatar";
import { PageHeader } from "@/components/data-display/page-header";
import { ListPageActions } from "@/components/data-display/list-page-actions";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { ExportDialog } from "@/components/forms/export-dialog";
import { UserFilters } from "@/modules/users/components/user-filters";
import { DeleteUserDialog } from "@/modules/users/components/delete-user-dialog";
import { useUsersList } from "@/modules/users/hooks/use-users-list";
import { useListExport } from "@/hooks/use-list-export";
import { useDeleteUser, useResendInvitation, useRevokeUserSessions, useUpdateUserStatus } from "@/modules/users/hooks/use-user-mutations";
import { usersApi } from "@/modules/users/api/users.api";
import { buildUsersListRows } from "@/modules/users/export";
import { ROLE_LABELS, ROLE_TONES, statusLabel, statusTone } from "@/modules/users/badges";
import { useAuthStore } from "@/stores/auth.store";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/config/routes";
import type { AdminUser, AdminUserListFilters } from "@/modules/users/types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_utilisateurs.md § C1 « Liste des utilisateurs ». */
export default function UsersListPage() {
  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const [filters, setFilters] = useState<AdminUserListFilters>({ page: 1 });
  const query = useUsersList(filters);

  // Compteurs de l'en-tête (§ C1, badges à côté du titre — NJ Global Trade Utilisateurs.dc.html
  // `viewUsers().page.badges`) : aucun endpoint de statistiques dédié n'existe pour ce module
  // (voir § 8 du cadrage) — comptages réels obtenus via 3 requêtes légères (per_page=1, seul `meta.total` sert).
  const totalQuery = useUsersList({ per_page: 1 });
  const activeQuery = useUsersList({ per_page: 1, is_active: true });
  const inactiveQuery = useUsersList({ per_page: 1, is_active: false });
  const pendingQuery = useUsersList({ per_page: 1, must_change_password: true });

  const [toRevoke, setToRevoke] = useState<AdminUser | null>(null);
  const [toToggleStatus, setToToggleStatus] = useState<AdminUser | null>(null);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const exportState = useListExport({
    fetchAll: async () => (await usersApi.list({ ...filters, page: 1, per_page: 1000 })).data,
    buildRows: buildUsersListRows,
    fileBase: "utilisateurs",
    title: "Utilisateurs",
    entityLabel: "compte(s)",
  });

  const revokeMutation = useRevokeUserSessions();
  const statusMutation = useUpdateUserStatus(toToggleStatus?.id ?? 0);
  const deleteMutation = useDeleteUser();
  const resendMutation = useResendInvitation();

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: "user",
      header: translate("col.actor"),
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.full_name} src={row.avatar_url} size={32} />
          <span className="font-medium text-foreground">{row.full_name}</span>
        </div>
      ),
    },
    { key: "email", header: translate("col.email"), render: (row) => row.email },
    { key: "role", header: translate("col.role"), render: (row) => <Badge tone={ROLE_TONES[row.role]}>{ROLE_LABELS[row.role]}</Badge> },
    {
      key: "status",
      header: translate("col.status"),
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Badge tone={statusTone(row.is_active)}>{statusLabel(row.is_active)}</Badge>
          {row.must_change_password ? <span className="h-2 w-2 rounded-full bg-warning" title={translate("tooltip.pwChangePending")} /> : null}
        </div>
      ),
    },
    { key: "last_login", header: translate("col.lastLogin"), render: (row) => (row.last_login_at ? formatDateTime(row.last_login_at) : translate("value.neverConnected")) },
    { key: "created_by", header: translate("col.createdBy"), render: (row) => row.created_by?.full_name ?? "—" },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => {
        const isSelf = row.id === currentUser?.id;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={routes.users.detail(row.id)}>
                    <Eye className="mr-2 h-4 w-4" /> Voir la fiche
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={routes.users.edit(row.id)}>
                    <Pencil className="mr-2 h-4 w-4" /> Modifier
                  </Link>
                </DropdownMenuItem>
                {!row.last_login_at ? (
                  <DropdownMenuItem onSelect={() => resendMutation.mutate(row.email)}>
                    <Mail className="mr-2 h-4 w-4" /> Renvoyer l&apos;invitation
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onSelect={() => setToRevoke(row)}>
                  <LogOut className="mr-2 h-4 w-4" /> Forcer la déconnexion
                </DropdownMenuItem>
                {isSuperAdmin ? (
                  <DropdownMenuItem disabled={isSelf} onSelect={() => setToToggleStatus(row)}>
                    <Power className="mr-2 h-4 w-4" /> {row.is_active ? translate("t.desactiver") : translate("t.reactiver")}
                  </DropdownMenuItem>
                ) : null}
                {isSuperAdmin ? (
                  <DropdownMenuItem disabled={isSelf} onSelect={() => setToDelete(row)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer définitivement
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const total = totalQuery.data?.meta.total;
  const active = activeQuery.data?.meta.total;
  const inactive = inactiveQuery.data?.meta.total;
  const pending = pendingQuery.data?.meta.total;

  return (
    <div className="space-y-6">
      <PageHeader
        title={translate("page.users.title")}
        badges={
          <>
            <span className="inline-flex h-[24px] items-center rounded-full border border-border bg-surface px-[10px] text-[11px] font-semibold whitespace-nowrap text-muted-foreground">
              {total ?? "…"} comptes
            </span>
            <Badge tone="success">{active ?? "…"} actifs</Badge>
            <Badge tone="neutral">{inactive ?? "…"} inactifs</Badge>
            <Badge tone="warning">{pending ?? "…"} mot de passe à changer</Badge>
          </>
        }
        description={translate("page.users.desc")}
        actions={
          <ListPageActions
            secondary={
              isSuperAdmin ? (
                <Button variant="outline" asChild>
                  <Link href={routes.users.roles}>
                    <KeyRound className="h-4 w-4" />
                    Rôles &amp; permissions
                  </Link>
                </Button>
              ) : null
            }
            onExport={() => exportState.setOpen(true)}
            newLabel={translate("page.userInvite.title")}
            newHref={routes.users.invite}
            busy={exportState.isExporting}
          />
        }
      />

      <UserFilters filters={filters} onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch, page: 1 }))} />

      <DataTable
        columns={columns}
        data={query.data?.data}
        meta={query.data?.meta}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        rowKey={(row) => row.id}
        emptyTitle={translate("page.users.empty")}
      />

      <ExportDialog
        open={exportState.open}
        onOpenChange={exportState.setOpen}
        title={translate("page.users.exportTitle")}
        subtitle={translate("export.subtitle")}
        note={typeof total === "number" ? `${total} compte(s) seront exportés.` : undefined}
        defaultFormat="XLSX"
        isPending={exportState.isExporting}
        onSubmit={(format) => exportState.run(format)}
      />

      <ConfirmDialog
        open={Boolean(toRevoke)}
        onOpenChange={(open) => !open && setToRevoke(null)}
        title={translate("page.users.forceLogoutTitle")}
        description={`Toutes les sessions de ${toRevoke?.full_name} seront révoquées immédiatement — utile en cas de compte compromis.`}
        confirmLabel={translate("t.deconnecter")}
        isPending={revokeMutation.isPending}
        onConfirm={() => {
          if (toRevoke) revokeMutation.mutate(toRevoke.id, { onSuccess: () => setToRevoke(null) });
        }}
      />
      <ConfirmDialog
        open={Boolean(toToggleStatus)}
        onOpenChange={(open) => !open && setToToggleStatus(null)}
        title={toToggleStatus?.is_active ? translate("t.desactiverCetUtilisateur") : translate("t.reactiverCetUtilisateur")}
        description={toToggleStatus?.is_active ? translate("t.cetUtilisateurNePourraPlusSeConnecterTantQuIlNEstP") : translate("t.cetUtilisateurPourraDeNouveauSeConnecter")}
        confirmLabel={toToggleStatus?.is_active ? translate("t.desactiver") : translate("t.reactiver")}
        destructive={Boolean(toToggleStatus?.is_active)}
        isPending={statusMutation.isPending}
        onConfirm={() => {
          if (toToggleStatus) statusMutation.mutate({ is_active: !toToggleStatus.is_active }, { onSuccess: () => setToToggleStatus(null) });
        }}
      />
      <DeleteUserDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        user={toDelete}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
