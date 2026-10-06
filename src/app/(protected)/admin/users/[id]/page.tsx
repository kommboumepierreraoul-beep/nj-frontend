"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { LogOut, Mail, Pencil, Power, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/data-display/avatar";
import { PageHeader } from "@/components/data-display/page-header";
import { ErrorState } from "@/components/data-display/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { DeleteUserDialog } from "@/modules/users/components/delete-user-dialog";
import { UserPermissionsSection } from "@/modules/users/components/user-permissions-section";
import { UserHistorySection } from "@/modules/users/components/user-history-section";
import { useUser } from "@/modules/users/hooks/use-user";
import { useDeleteUser, useResendInvitation, useRevokeUserSessions, useUpdateUserStatus } from "@/modules/users/hooks/use-user-mutations";
import { ROLE_LABELS, ROLE_TONES, PASSWORD_PENDING_LABEL, statusLabel, statusTone } from "@/modules/users/badges";
import { useAuthStore } from "@/stores/auth.store";
import { hasPermission } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_utilisateurs.md § C2 « Fiche utilisateur ». */
export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = Number(id);
  if (!Number.isInteger(userId)) notFound();

  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const canManagePermissions = isSuperAdmin || hasPermission(currentUser, "users.manage_permissions");
  const isSelf = currentUser?.id === userId;

  const query = useUser(userId);
  const revokeMutation = useRevokeUserSessions();
  const statusMutation = useUpdateUserStatus(userId);
  const deleteMutation = useDeleteUser();
  const resendMutation = useResendInvitation();

  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [confirmToggleStatus, setConfirmToggleStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const user = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: translate("page.users.title"), href: routes.users.list }, { label: user.full_name }]}
        title={user.full_name}
        badges={
          <>
            <Badge tone={ROLE_TONES[user.role]}>{ROLE_LABELS[user.role]}</Badge>
            <Badge tone={statusTone(user.is_active)}>{statusLabel(user.is_active)}</Badge>
            {user.must_change_password ? <Badge tone="warning">{PASSWORD_PENDING_LABEL}</Badge> : null}
          </>
        }
        description={user.email}
        actions={
          <>
            {!user.last_login_at ? (
              <Button variant="outline" onClick={() => resendMutation.mutate(user.email)} disabled={resendMutation.isPending}>
                <Mail className="h-4 w-4" />
                {translate("t.renvoyerLInvitation")}
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => setConfirmRevoke(true)}>
              <LogOut className="h-4 w-4" />
              {translate("t.forcerLaDeconnexionBtn")}
            </Button>
            {isSuperAdmin ? (
              <Button variant="outline" disabled={isSelf} onClick={() => setConfirmToggleStatus(true)} title={isSelf ? translate("t.vousNePouvezPasVousDesactiverVousMeme") : undefined}>
                <Power className="h-4 w-4" />
                {user.is_active ? translate("t.desactiver") : translate("t.reactiver")}
              </Button>
            ) : null}
            <Button asChild>
              <Link href={routes.users.edit(user.id)}>
                <Pencil className="h-4 w-4" />
                {translate("action.edit")}
              </Link>
            </Button>
            {isSuperAdmin ? (
              <Button variant="destructive" disabled={isSelf} onClick={() => setConfirmDelete(true)} title={isSelf ? translate("t.vousNePouvezPasVousSupprimerVousMeme") : undefined}>
                <Trash2 className="h-4 w-4" />
                {translate("action.delete")}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
          <Avatar name={user.full_name} src={user.avatar_url} size={48} />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{user.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <InfoItem label={translate("t.creeLe")} value={formatDateTime(user.created_at)} />
        <InfoItem label={translate("t.creePar")} value={user.created_by?.full_name ?? "—"} />
        <InfoItem label={translate("t.derniereConnexion")} value={user.last_login_at ? formatDateTime(user.last_login_at) : translate("value.neverConnected")} />
        <InfoItem label={translate("t.connexionGoogleLabel")} value={user.google_id ? translate("t.liee") : translate("t.nonLiee")} />
      </div>

      {/* Doc/spec_pages_utilisateurs.md § C2 — mêmes trois sections que NJ Global Trade
          Utilisateurs.dc.html `viewUser()` (Permissions / Sessions actives / Historique),
          présentées en onglets comme sur les autres fiches à sections multiples
          (ex. src/app/(protected)/clients/[id]/page.tsx) plutôt qu'empilées. */}
      <Tabs defaultValue="permissions">
        <TabsList>
          <TabsTrigger value="permissions">{translate("t.permissions")}</TabsTrigger>
          <TabsTrigger value="sessions">{translate("t.sessionsActivesTab")}</TabsTrigger>
          <TabsTrigger value="history">{translate("t.historique")}</TabsTrigger>
        </TabsList>
        <TabsContent value="permissions">
          <UserPermissionsSection user={user} canEdit={canManagePermissions} />
        </TabsContent>
        <TabsContent value="sessions">
          <section className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-muted-foreground">
              {translate("t.sessionsOtherUserP1")}<code className="text-xs">GET /auth/sessions</code>{translate("t.sessionsOtherUserP2")}
            </p>
          </section>
        </TabsContent>
        <TabsContent value="history">
          <UserHistorySection userId={user.id} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmRevoke}
        onOpenChange={setConfirmRevoke}
        title={translate("page.users.forceLogoutTitle")}
        description={translate("page.users.forceLogoutDesc")}
        confirmLabel={translate("t.deconnecter")}
        isPending={revokeMutation.isPending}
        onConfirm={() => revokeMutation.mutate(user.id, { onSuccess: () => setConfirmRevoke(false) })}
      />
      <ConfirmDialog
        open={confirmToggleStatus}
        onOpenChange={setConfirmToggleStatus}
        title={user.is_active ? translate("t.desactiverCetUtilisateur") : translate("t.reactiverCetUtilisateur")}
        description={user.is_active ? translate("t.cetUtilisateurNePourraPlusSeConnecterTantQuIlNEstP") : translate("t.cetUtilisateurPourraDeNouveauSeConnecter")}
        confirmLabel={user.is_active ? translate("t.desactiver") : translate("t.reactiver")}
        destructive={user.is_active}
        isPending={statusMutation.isPending}
        onConfirm={() => statusMutation.mutate({ is_active: !user.is_active }, { onSuccess: () => setConfirmToggleStatus(false) })}
      />
      <DeleteUserDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        user={user}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(user.id, { onSuccess: () => router.replace(routes.users.list) })}
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  );
}
