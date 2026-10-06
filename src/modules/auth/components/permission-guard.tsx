"use client";

import type { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth.store";
import type { UserRole } from "@/types/permissions";

interface PermissionGuardProps {
  children: ReactNode;
  /** Un seul des codes suffit (OR) — reflète les paires view/manage du plan du site. */
  permissions?: string[];
  roles?: UserRole[];
  fallback?: ReactNode;
}

/** Équivalent frontend d'EnsureUserHasPermission/EnsureUserHasRole : masque plutôt que de laisser l'API refuser en 403. */
export function PermissionGuard({ children, permissions, roles, fallback = null }: PermissionGuardProps) {
  const user = useAuthStore((state) => state.user);
  const checkPermission = useAuthStore((state) => state.hasPermission);
  const checkRole = useAuthStore((state) => state.hasRole);

  const roleOk = !roles || roles.some((role) => checkRole(role));
  const permissionOk = !permissions || permissions.some((code) => checkPermission(code));

  if (!user || !roleOk || !permissionOk) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
