import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiCollection } from "@/types/api";
import type { DashboardOverview, DashboardPendingSalesOrder, DashboardStats, DashboardStatsFilters } from "../types";

export const dashboardApi = {
  stats: (filters: DashboardStatsFilters) =>
    apiClient.get<DashboardStats>(`${endpoints.dashboard.stats}${toQueryString(filters)}`),

  /** Blocs sous les 4 cartes KPI — sans paramètre de période (Doc/spec_pages_dashboard.md § 3). */
  overview: () => apiClient.get<DashboardOverview>(endpoints.dashboard.overview),

  pendingSalesOrders: (page: number, perPage = 20) =>
    apiClient.get<ApiCollection<DashboardPendingSalesOrder>>(
      `${endpoints.dashboard.pendingSalesOrders}${toQueryString({ page, per_page: perPage })}`,
    ),
};
