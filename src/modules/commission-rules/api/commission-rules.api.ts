import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import type { ApiMessage } from "@/types/api";
import type { CommissionRule, CommissionRulePayload } from "../types";

/** Ressource non paginée (Doc/spec_pages_commandes.md § 3 « Conventions générales »). */
export const commissionRulesApi = {
  list: () => apiClient.get<{ data: CommissionRule[] }>(endpoints.commissionRules.base),
  create: (payload: CommissionRulePayload) => apiClient.post<{ data: CommissionRule }>(endpoints.commissionRules.base, payload),
  update: (id: number, payload: Partial<CommissionRulePayload>) => apiClient.put<{ data: CommissionRule }>(endpoints.commissionRules.detail(id), payload),
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.commissionRules.detail(id)),
};
