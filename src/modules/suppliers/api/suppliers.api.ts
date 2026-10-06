import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiCollection, ApiMessage } from "@/types/api";
import type {
  BlacklistSupplierPayload,
  Supplier,
  SupplierBankAccount,
  SupplierBankAccountPayload,
  SupplierCommunicationLog,
  SupplierCommunicationLogPayload,
  SupplierContact,
  SupplierContactPayload,
  SupplierDocument,
  SupplierDocumentPayload,
  SupplierEvaluation,
  SupplierEvaluationPayload,
  SupplierFormValues,
  SupplierListFilters,
  VerifySupplierPayload,
} from "../types";

export const suppliersApi = {
  list: (filters: SupplierListFilters) => apiClient.get<ApiCollection<Supplier>>(`${endpoints.suppliers.base}${toQueryString(filters)}`),
  get: (id: number) => apiClient.get<{ data: Supplier }>(endpoints.suppliers.detail(id)),
  create: (payload: SupplierFormValues) => apiClient.post<{ data: Supplier }>(endpoints.suppliers.base, payload),
  update: (id: number, payload: Partial<SupplierFormValues>) => apiClient.put<{ data: Supplier }>(endpoints.suppliers.detail(id), payload),
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.suppliers.detail(id)),
  verify: (id: number, payload: VerifySupplierPayload) => apiClient.post<{ data: Supplier }>(endpoints.suppliers.verify(id), payload),
  blacklist: (id: number, payload: BlacklistSupplierPayload) => apiClient.post<{ data: Supplier }>(endpoints.suppliers.blacklist(id), payload),

  contacts: (supplierId: number) => apiClient.get<{ data: SupplierContact[] }>(endpoints.suppliers.contacts(supplierId)),
  createContact: (supplierId: number, payload: SupplierContactPayload) =>
    apiClient.post<{ data: SupplierContact }>(endpoints.suppliers.contacts(supplierId), payload),
  updateContact: (supplierId: number, contactId: number, payload: Partial<SupplierContactPayload>) =>
    apiClient.put<{ data: SupplierContact }>(endpoints.suppliers.contactDetail(supplierId, contactId), payload),
  removeContact: (supplierId: number, contactId: number) => apiClient.delete<ApiMessage>(endpoints.suppliers.contactDetail(supplierId, contactId)),

  bankAccounts: (supplierId: number) => apiClient.get<{ data: SupplierBankAccount[] }>(endpoints.suppliers.bankAccounts(supplierId)),
  createBankAccount: (supplierId: number, payload: SupplierBankAccountPayload) =>
    apiClient.post<{ data: SupplierBankAccount }>(endpoints.suppliers.bankAccounts(supplierId), payload),
  updateBankAccount: (supplierId: number, accountId: number, payload: Partial<SupplierBankAccountPayload>) =>
    apiClient.put<{ data: SupplierBankAccount }>(endpoints.suppliers.bankAccountDetail(supplierId, accountId), payload),
  removeBankAccount: (supplierId: number, accountId: number) =>
    apiClient.delete<ApiMessage>(endpoints.suppliers.bankAccountDetail(supplierId, accountId)),

  documents: (supplierId: number) => apiClient.get<{ data: SupplierDocument[] }>(endpoints.suppliers.documents(supplierId)),
  createDocument: (supplierId: number, payload: SupplierDocumentPayload) =>
    apiClient.post<{ data: SupplierDocument }>(endpoints.suppliers.documents(supplierId), payload),
  updateDocument: (supplierId: number, documentId: number, payload: Partial<SupplierDocumentPayload>) =>
    apiClient.put<{ data: SupplierDocument }>(endpoints.suppliers.documentDetail(supplierId, documentId), payload),
  removeDocument: (supplierId: number, documentId: number) => apiClient.delete<ApiMessage>(endpoints.suppliers.documentDetail(supplierId, documentId)),

  evaluations: (supplierId: number) => apiClient.get<{ data: SupplierEvaluation[] }>(endpoints.suppliers.evaluations(supplierId)),
  createEvaluation: (supplierId: number, payload: SupplierEvaluationPayload) =>
    apiClient.post<{ data: SupplierEvaluation }>(endpoints.suppliers.evaluations(supplierId), payload),
  updateEvaluation: (supplierId: number, evaluationId: number, payload: Partial<SupplierEvaluationPayload>) =>
    apiClient.put<{ data: SupplierEvaluation }>(endpoints.suppliers.evaluationDetail(supplierId, evaluationId), payload),
  removeEvaluation: (supplierId: number, evaluationId: number) =>
    apiClient.delete<ApiMessage>(endpoints.suppliers.evaluationDetail(supplierId, evaluationId)),

  communicationLogs: (supplierId: number) => apiClient.get<{ data: SupplierCommunicationLog[] }>(endpoints.suppliers.communicationLogs(supplierId)),
  createCommunicationLog: (supplierId: number, payload: SupplierCommunicationLogPayload) =>
    apiClient.post<{ data: SupplierCommunicationLog }>(endpoints.suppliers.communicationLogs(supplierId), payload),
  updateCommunicationLog: (supplierId: number, logId: number, payload: Partial<SupplierCommunicationLogPayload>) =>
    apiClient.put<{ data: SupplierCommunicationLog }>(endpoints.suppliers.communicationLogDetail(supplierId, logId), payload),
  removeCommunicationLog: (supplierId: number, logId: number) =>
    apiClient.delete<ApiMessage>(endpoints.suppliers.communicationLogDetail(supplierId, logId)),
};
