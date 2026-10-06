"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AddUserPermissionDialog } from "./add-user-permission-dialog";
import { useRolePermissions } from "../hooks/use-role-permissions";
import { useUpdateUserPermissions } from "../hooks/use-user-permissions";
import type { AdminUser } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_utilisateurs.md § C2 « Section Permissions ». `AdminUser.permissions`
 * mélange permissions héritées du rôle et permissions individuelles (comme
 * `AuthUser.permissions`, reflet direct de `UserResource`) : on les
 * distingue ici en comparant à `GET /roles/{role}/permissions`, plutôt que
 * de supposer un champ séparé côté API non documenté. Pour un SUPER_ADMIN,
 * la distinction est sans objet (le rôle contourne systématiquement toute
 * vérification) — section affichée en lecture seule informative.
 */
export function UserPermissionsSection({ user, canEdit }: { user: AdminUser; canEdit: boolean }) {
  const [addOpen, setAddOpen] = useState(false);
  const roleQuery = useRolePermissions(user.role === "SUPER_ADMIN" ? "ADMIN" : user.role);
  const updateMutation = useUpdateUserPermissions(user.id);

  if (user.role === "SUPER_ADMIN") {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">{translate("t.permissions")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {translate("t.superAdminBypassP1")}<code className="text-xs">User::hasPermission()</code>{translate("t.superAdminBypassP2")}
        </p>
      </section>
    );
  }

  if (roleQuery.isLoading) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <Skeleton className="h-32 w-full" />
      </section>
    );
  }

  const roleCodes = roleQuery.data ?? [];
  const inherited = user.permissions.filter((permission) => roleCodes.includes(permission.code));
  const individual = user.permissions.filter((permission) => !roleCodes.includes(permission.code));

  function handleRemove(code: string) {
    updateMutation.mutate({ permissions: individual.filter((permission) => permission.code !== code).map((permission) => permission.code) });
  }

  function handleAdd(code: string) {
    updateMutation.mutate({ permissions: [...individual.map((permission) => permission.code), code] }, { onSuccess: () => setAddOpen(false) });
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{translate("t.permissionsHeriteesDuRole")}</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {inherited.length === 0 ? (
            <span className="text-sm text-muted-foreground">{translate("t.aucuneF")}</span>
          ) : (
            inherited.map((permission) => (
              <Badge key={permission.code} tone="neutral" title={permission.description ?? undefined}>
                {permission.label}
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{translate("t.permissionsIndividuellesTitle")}</h2>
          {canEdit ? (
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
              {translate("t.ajouterUnePermissionBtn")}
            </Button>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {individual.length === 0 ? (
            <span className="text-sm text-muted-foreground">{translate("t.aucunePermissionIndividuelleAccordee")}</span>
          ) : (
            individual.map((permission) => (
              <Badge key={permission.code} tone="accent" className="gap-1" title={permission.description ?? undefined}>
                {permission.label}
                {canEdit ? (
                  <button type="button" onClick={() => handleRemove(permission.code)} className="ml-0.5 hover:opacity-70" title={translate("action.remove")}>
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </Badge>
            ))
          )}
        </div>
      </div>

      {canEdit ? (
        <AddUserPermissionDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          excludeCodes={user.permissions.map((permission) => permission.code)}
          isPending={updateMutation.isPending}
          onConfirm={handleAdd}
        />
      ) : null}
    </section>
  );
}
