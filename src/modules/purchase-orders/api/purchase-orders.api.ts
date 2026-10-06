import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiCollection, ApiMessage } from "@/types/api";
import type { PurchaseOrder, PurchaseOrderFormValues, PurchaseOrderItem, PurchaseOrderItemPayload, PurchaseOrderListFilters } from "../types";

export const purchaseOrdersApi = {
  list: (filters: PurchaseOrderListFilters) => apiClient.get<ApiCollection<PurchaseOrder>>(`${endpoints.purchaseOrders.base}${toQueryString(filters)}`),
  get: (id: number) => apiClient.get<{ data: PurchaseOrder }>(endpoints.purchaseOrders.detail(id)),
  create: (payload: PurchaseOrderFormValues) => apiClient.post<{ data: PurchaseOrder }>(endpoints.purchaseOrders.base, payload),
  update: (id: number, payload: Partial<PurchaseOrderFormValues>) => apiClient.put<{ data: PurchaseOrder }>(endpoints.purchaseOrders.detail(id), payload),
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.purchaseOrders.detail(id)),

  items: (poId: number) => apiClient.get<{ data: PurchaseOrderItem[] }>(endpoints.purchaseOrders.items(poId)),
  createItem: (poId: number, payload: PurchaseOrderItemPayload) => apiClient.post<{ data: PurchaseOrderItem }>(endpoints.purchaseOrders.items(poId), payload),
  updateItem: (poId: number, itemId: number, payload: Partial<PurchaseOrderItemPayload>) =>
    apiClient.put<{ data: PurchaseOrderItem }>(endpoints.purchaseOrders.itemDetail(poId, itemId), payload),
  removeItem: (poId: number, itemId: number) => apiClient.delete<ApiMessage>(endpoints.purchaseOrders.itemDetail(poId, itemId)),
};
