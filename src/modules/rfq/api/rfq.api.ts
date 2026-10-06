import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiCollection, ApiMessage } from "@/types/api";
import type {
  Rfq,
  RfqFormValues,
  RfqItem,
  RfqItemPayload,
  RfqListFilters,
  RfqSupplier,
  RfqSupplierPayload,
  RfqSupplierQuote,
  RfqSupplierQuotePayload,
} from "../types";

export const rfqApi = {
  list: (filters: RfqListFilters) => apiClient.get<ApiCollection<Rfq>>(`${endpoints.rfqs.base}${toQueryString(filters)}`),
  get: (id: number) => apiClient.get<{ data: Rfq }>(endpoints.rfqs.detail(id)),
  create: (payload: RfqFormValues) => apiClient.post<{ data: Rfq }>(endpoints.rfqs.base, payload),
  update: (id: number, payload: Partial<RfqFormValues>) => apiClient.put<{ data: Rfq }>(endpoints.rfqs.detail(id), payload),
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.rfqs.detail(id)),

  items: (rfqId: number) => apiClient.get<{ data: RfqItem[] }>(endpoints.rfqs.items(rfqId)),
  createItem: (rfqId: number, payload: RfqItemPayload) => apiClient.post<{ data: RfqItem }>(endpoints.rfqs.items(rfqId), payload),
  updateItem: (rfqId: number, itemId: number, payload: Partial<RfqItemPayload>) =>
    apiClient.put<{ data: RfqItem }>(endpoints.rfqs.itemDetail(rfqId, itemId), payload),
  removeItem: (rfqId: number, itemId: number) => apiClient.delete<ApiMessage>(endpoints.rfqs.itemDetail(rfqId, itemId)),

  suppliers: (rfqId: number) => apiClient.get<{ data: RfqSupplier[] }>(endpoints.rfqs.suppliers(rfqId)),
  createSupplier: (rfqId: number, payload: RfqSupplierPayload) => apiClient.post<{ data: RfqSupplier }>(endpoints.rfqs.suppliers(rfqId), payload),
  updateSupplier: (rfqId: number, rfqSupplierId: number, payload: Partial<RfqSupplierPayload> & { response_date?: string }) =>
    apiClient.put<{ data: RfqSupplier }>(endpoints.rfqs.supplierDetail(rfqId, rfqSupplierId), payload),
  removeSupplier: (rfqId: number, rfqSupplierId: number) => apiClient.delete<ApiMessage>(endpoints.rfqs.supplierDetail(rfqId, rfqSupplierId)),

  quotes: (rfqSupplierId: number) => apiClient.get<{ data: RfqSupplierQuote[] }>(endpoints.rfqs.quotes(rfqSupplierId)),
  createQuote: (rfqSupplierId: number, payload: RfqSupplierQuotePayload) =>
    apiClient.post<{ data: RfqSupplierQuote }>(endpoints.rfqs.quotes(rfqSupplierId), payload),
  updateQuote: (rfqSupplierId: number, quoteId: number, payload: Partial<RfqSupplierQuotePayload>) =>
    apiClient.put<{ data: RfqSupplierQuote }>(endpoints.rfqs.quoteDetail(rfqSupplierId, quoteId), payload),
  removeQuote: (rfqSupplierId: number, quoteId: number) => apiClient.delete<ApiMessage>(endpoints.rfqs.quoteDetail(rfqSupplierId, quoteId)),
  selectQuote: (rfqSupplierId: number, quoteId: number) => apiClient.post<{ data: RfqSupplierQuote }>(endpoints.rfqs.selectQuote(rfqSupplierId, quoteId), {}),
};
