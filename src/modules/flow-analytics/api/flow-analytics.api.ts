import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import { ApiError } from "@/lib/http/api-error";
import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth.store";
import type { ActivityFlowReport, BottlenecksReport, FinancialReport, FlowAnalyticsFilters, FlowExportFormat, FlowReportKey, PurchaseFlowReport, SalesFlowReport } from "../types";

export const flowAnalyticsApi = {
  bottlenecks: (filters: FlowAnalyticsFilters) => apiClient.get<BottlenecksReport>(`${endpoints.flowAnalytics.bottlenecks}${toQueryString(filters)}`),
  purchaseFlow: (filters: FlowAnalyticsFilters) => apiClient.get<PurchaseFlowReport>(`${endpoints.flowAnalytics.purchaseFlow}${toQueryString(filters)}`),
  salesFlow: (filters: FlowAnalyticsFilters) => apiClient.get<SalesFlowReport>(`${endpoints.flowAnalytics.salesFlow}${toQueryString(filters)}`),
  financial: (filters: FlowAnalyticsFilters) => apiClient.get<FinancialReport>(`${endpoints.flowAnalytics.financial}${toQueryString(filters)}`),
  activityFlow: (filters: FlowAnalyticsFilters) => apiClient.get<ActivityFlowReport>(`${endpoints.flowAnalytics.activityFlow}${toQueryString(filters)}`),
};

/**
 * Doc/spec_pages_analyse_flux.md § Export — téléchargement direct (réponse
 * immédiate, pas de génération asynchrone). `apiClient` ne gère que le JSON ;
 * fetch direct ici pour récupérer un blob (CSV/PDF) avec le header
 * Authorization, comme le fait `api-client.ts` pour les appels JSON.
 */
export async function downloadFlowExport(flow: FlowReportKey, format: FlowExportFormat, filters: FlowAnalyticsFilters): Promise<void> {
  const token = useAuthStore.getState().token;
  const url = `${env.NEXT_PUBLIC_API_BASE_URL}${endpoints.flowAnalytics.export(flow)}${toQueryString({ ...filters, format })}`;
  const response = await fetch(url, {
    headers: { Accept: "application/octet-stream", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw ApiError.fromResponse(response.status, payload, response.headers.get("Retry-After"));
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${flow}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
