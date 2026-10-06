import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import type { UserRole, Permission } from "@/types/permissions";
import type { UpdateRolePermissionsPayload } from "../types";

/** Doc/spec_pages_utilisateurs.md § D1 — catalogue en lecture seule, codes créés par migration/seed (décision §10.3). */
export const permissionsCatalogApi = {
  list: () => apiClient.get<{ data: Permission[] }>(endpoints.permissionsCatalog.base),
};

/** § D2 — matrice rôle × permission ; SUPER_ADMIN toujours coché côté interface, jamais interrogé ici (contournement systématique côté backend, § note). */
export const rolePermissionsApi = {
  get: (role: UserRole) => apiClient.get<{ data: string[] }>(endpoints.rolePermissions.detail(role)),
  update: (role: UserRole, payload: UpdateRolePermissionsPayload) => apiClient.put<{ data: string[] }>(endpoints.rolePermissions.detail(role), payload),
};
