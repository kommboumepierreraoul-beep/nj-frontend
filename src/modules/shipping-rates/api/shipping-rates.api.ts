import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiMessage } from "@/types/api";
import type { ShippingRate, ShippingRateListFilters, ShippingRatePayload } from "../types";

/** Ressource non paginée (mêmes conventions que Paramètres → Commissions). */
export const shippingRatesApi = {
  list: (filters: ShippingRateListFilters) => apiClient.get<{ data: ShippingRate[] }>(`${endpoints.shippingRates.base}${toQueryString(filters)}`),
  create: (payload: ShippingRatePayload) => apiClient.post<{ data: ShippingRate }>(endpoints.shippingRates.base, payload),
  update: (id: number, payload: Partial<ShippingRatePayload>) => apiClient.put<{ data: ShippingRate }>(endpoints.shippingRates.detail(id), payload),
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.shippingRates.detail(id)),
};
