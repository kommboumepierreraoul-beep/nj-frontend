"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { List, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/data-display/page-header";
import { InfoBanner } from "@/components/data-display/info-banner";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { usePermissionsCatalog } from "@/modules/users/hooks/use-permissions-catalog";
import { useRolePermissions, useUpdateRolePermissions } from "@/modules/users/hooks/use-role-permissions";
import { routes } from "@/config/routes";
import type { Permission } from "@/types/permissions";
import { translate } from "@/i18n/translate";

function moduleOf(code: string): string {
  return code.split(".")[0] ?? code;
}

/**
 * Doc/spec_pages_utilisateurs.md § D2 « Permissions par rôle » — matrice
 * lignes = permissions, colonnes = SUPER_ADMIN (toujours coché, en lecture
 * seule : contournement systématique côté backend, jamais interrogé) et
 * ADMIN (cases à cocher). Édition réservée SUPER_ADMIN / `users.manage_permissions`
 * — l'accès à cette route est déjà filtré par la navigation/les permissions
 * de plus haut niveau, cette page ne fait qu'implémenter l'écran.
 */
export default function RolePermissionsPage() {
  const catalog = usePermissionsCatalog();
  const adminQuery = useRolePermissions("ADMIN");
  const updateMutation = useUpdateRolePermissions("ADMIN");

  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const serverSet = useMemo(() => new Set(adminQuery.data ?? []), [adminQuery.data]);
  const isChecked = (code: string) => (code in overrides ? overrides[code] : serverSet.has(code));

  const isDirty = Object.keys(overrides).length > 0;

  function handleSave() {
    const codes = (catalog.data ?? []).map((permission) => permission.code).filter((code) => isChecked(code));
    updateMutation.mutate({ permissions: codes }, { onSuccess: () => setOverrides({}) });
  }

  const isLoading = catalog.isLoading || adminQuery.isLoading;
  const isError = catalog.isError || adminQuery.isError;

  /**
   * Matrice rôle × permission (NJ Global Trade Utilisateurs.dc.html
   * `viewRoles()` lignes 1239-1274) : liste plate — le module apparaît comme
   * une colonne badge, pas comme un regroupement de lignes — même grille CSS
   * que le reste du système (§ 2.3, DataTable, « à utiliser pour C1, D1, D2, E1 »).
   */
  const columns: DataTableColumn<Permission>[] = [
    {
      key: "permission",
      header: translate("col.permission"),
      width: "minmax(200px,1.6fr)",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-foreground">{row.label}</p>
          <p className="truncate text-xs text-muted-foreground">{row.code}</p>
        </div>
      ),
    },
    {
      key: "description",
      header: translate("col.description"),
      width: "minmax(200px,2fr)",
      render: (row) => <span className="text-muted-foreground">{row.description ?? "—"}</span>,
    },
    { key: "module", header: translate("col.module"), width: "140px", render: (row) => <Badge tone="neutral">{moduleOf(row.code)}</Badge> },
    {
      key: "super_admin",
      header: translate("col.superAdmin"),
      width: "170px",
      align: "center",
      render: () => (
        <Badge tone="clients" className="gap-1" title={translate("tooltip.superAdminBypass")}>
          <Lock className="h-3 w-3" />
          {translate("t.toujoursLabel")}
        </Badge>
      ),
    },
    {
      key: "admin",
      header: translate("col.admin"),
      width: "170px",
      align: "center",
      render: (row) => <Checkbox checked={isChecked(row.code)} onCheckedChange={(value) => setOverrides((prev) => ({ ...prev, [row.code]: Boolean(value) }))} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={translate("page.roles.title")}
        description={translate("page.roles.desc")}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={routes.users.permissionsCatalog}>
                <List className="h-4 w-4" />
                {translate("nav.settings.catalog")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={routes.users.list}>
                <Users className="h-4 w-4" />
                {translate("page.users.title")}
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={!isDirty || updateMutation.isPending}>
              {updateMutation.isPending ? translate("t.enregistrementEnCours") : translate("action.save")}
            </Button>
          </>
        }
      />

      <InfoBanner>{translate("t.leRoleSuperAdministrateurNAPasBesoinDAssociationEx")}</InfoBanner>

      <DataTable
        columns={columns}
        data={catalog.data}
        isLoading={isLoading}
        isError={isError}
        error={catalog.error ?? adminQuery.error}
        onRetry={() => {
          catalog.refetch();
          adminQuery.refetch();
        }}
        rowKey={(row) => row.code}
        emptyTitle={translate("page.roles.empty")}
      />
    </div>
  );
}
