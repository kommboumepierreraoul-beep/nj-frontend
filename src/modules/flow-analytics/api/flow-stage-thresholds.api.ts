import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiMessage } from "@/types/api";
import type { FlowStageThreshold, FlowStageThresholdCreatePayload, FlowStageThresholdListFilters, FlowStageThresholdUpdatePayload } from "../types";

/** Ressource non paginée, triée `flow_type` puis `sort_order` côté API (§ Structure). */
export const flowStageThresholdsApi = {
  list: (filters: FlowStageThresholdListFilters) => apiClient.get<{ data: FlowStageThreshold[] }>(`${endpoints.flowStageThresholds.base}${toQueryString(filters)}`),
  create: (payload: FlowStageThresholdCreatePayload) => apiClient.post<{ data: FlowStageThreshold }>(endpoints.flowStageThresholds.base, payload),
  update: (id: number, payload: FlowStageThresholdUpdatePayload) => apiClient.put<{ data: FlowStageThreshold }>(endpoints.flowStageThresholds.detail(id), payload),
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.flowStageThresholds.detail(id)),
};
