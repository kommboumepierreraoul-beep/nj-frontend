import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiCollection } from "@/types/api";
import type { AuditLog, AuditLogListFilters } from "../types";

export const auditApi = {
  list: (filters: AuditLogListFilters) => apiClient.get<ApiCollection<AuditLog>>(`${endpoints.audit.base}${toQueryString(filters)}`),
};
