import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiCollection, ApiMessage } from "@/types/api";
import type {
  ChangeStatusPayload,
  RecordPaymentPayload,
  SalesOrder,
  SalesOrderCreatePayload,
  SalesOrderItem,
  SalesOrderItemPayload,
  SalesOrderItemUpdatePayload,
  SalesOrderListFilters,
  SalesOrderPayment,
  SalesOrderPaymentListFilters,
  SalesOrderPaymentRegistryResponse,
  SalesOrderStatusHistoryEntry,
  SalesOrderUpdatePayload,
  VoidPaymentPayload,
} from "../types";

export const salesOrdersApi = {
  list: (filters: SalesOrderListFilters) => apiClient.get<ApiCollection<SalesOrder>>(`${endpoints.salesOrders.base}${toQueryString(filters)}`),
  get: (id: number) => apiClient.get<{ data: SalesOrder }>(endpoints.salesOrders.detail(id)),
  create: (payload: SalesOrderCreatePayload) => apiClient.post<{ data: SalesOrder }>(endpoints.salesOrders.base, payload),
  update: (id: number, payload: SalesOrderUpdatePayload) => apiClient.put<{ data: SalesOrder }>(endpoints.salesOrders.detail(id), payload),
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.salesOrders.detail(id)),
  changeStatus: (id: number, payload: ChangeStatusPayload) => apiClient.put<{ data: SalesOrder }>(endpoints.salesOrders.status(id), payload),

  items: (id: number) => apiClient.get<{ data: SalesOrderItem[] }>(endpoints.salesOrders.items(id)),
  createItem: (id: number, payload: SalesOrderItemPayload) => apiClient.post<{ data: SalesOrderItem }>(endpoints.salesOrders.items(id), payload),
  updateItem: (id: number, itemId: number, payload: SalesOrderItemUpdatePayload) =>
    apiClient.put<{ data: SalesOrderItem }>(endpoints.salesOrders.itemDetail(id, itemId), payload),
  removeItem: (id: number, itemId: number) => apiClient.delete<ApiMessage>(endpoints.salesOrders.itemDetail(id, itemId)),

  payments: (id: number) => apiClient.get<{ data: SalesOrderPayment[] }>(endpoints.salesOrders.payments(id)),
  recordPayment: (id: number, payload: RecordPaymentPayload) => apiClient.post<{ data: SalesOrderPayment }>(endpoints.salesOrders.payments(id), payload),
  voidPayment: (id: number, paymentId: number, payload: VoidPaymentPayload) =>
    apiClient.post<{ data: SalesOrderPayment }>(endpoints.salesOrders.voidPayment(id, paymentId), payload),

  statusHistory: (id: number) => apiClient.get<{ data: SalesOrderStatusHistoryEntry[] }>(endpoints.salesOrders.statusHistory(id)),

  /** Doc/design_system_maquette_complete.md § 6.2 — registre transverse, toutes commandes confondues. */
  listAllPayments: (filters: SalesOrderPaymentListFilters) =>
    apiClient.get<SalesOrderPaymentRegistryResponse>(`${endpoints.salesOrderPayments.base}${toQueryString(filters)}`),
};
