import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiCollection, ApiMessage, ApiResource } from "@/types/api";
import type { AdminUser, AdminUserListFilters, InviteUserPayload, UpdateUserPayload, UpdateUserPermissionsPayload, UpdateUserStatusPayload } from "../types";

export const usersApi = {
  list: (filters: AdminUserListFilters) => apiClient.get<ApiCollection<AdminUser>>(`${endpoints.users.base}${toQueryString(filters)}`),
  show: (id: number) => apiClient.get<ApiResource<AdminUser>>(endpoints.users.detail(id)),
  invite: (payload: InviteUserPayload) => apiClient.post<ApiResource<AdminUser>>(endpoints.users.base, payload),
  update: (id: number, payload: UpdateUserPayload) => apiClient.put<ApiResource<AdminUser>>(endpoints.users.detail(id), payload),
  updateStatus: (id: number, payload: UpdateUserStatusPayload) => apiClient.put<ApiResource<AdminUser>>(endpoints.users.status(id), payload),
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.users.detail(id)),
  updatePermissions: (id: number, payload: UpdateUserPermissionsPayload) => apiClient.put<ApiResource<AdminUser>>(endpoints.users.permissions(id), payload),
  revokeSessions: (id: number) => apiClient.delete<ApiMessage>(endpoints.users.sessions(id)),
  /** § Actions rapides « Renvoyer l'invitation » (décision §10.4) — réutilise directement le endpoint public existant, pas de route dédiée. */
  resendInvitation: (email: string) => apiClient.post<ApiMessage>(endpoints.auth.forgotPassword, { email }, { skipAuth: true }),
};
