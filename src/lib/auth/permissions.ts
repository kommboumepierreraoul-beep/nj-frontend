import type { AuthUser } from "@/modules/auth/types";
import type { UserRole } from "@/types/permissions";

/**
 * SUPER_ADMIN outrepasse toujours toute permission (voir EnsureUserHasPermission
 * côté backend, et auth_system.md) — reproduit ici pour ne jamais masquer une
 * action à un super admin à cause d'une permission non accordée individuellement.
 */
export function hasPermission(user: AuthUser | null, code: string): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;
  return user.permissions.some((permission) => permission.code === code);
}

export function hasAnyPermission(user: AuthUser | null, codes: string[]): boolean {
  return codes.some((code) => hasPermission(user, code));
}

export function hasRole(user: AuthUser | null, role: UserRole): boolean {
  return user?.role === role;
}
