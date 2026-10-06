import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiCollection, ApiMessage } from "@/types/api";
import type {
  Client,
  ClientCategory,
  ClientContact,
  ClientFormValues,
  ClientListFilters,
  ClientStatus,
  ContactChannelType,
  CreateClientCategoryPayload,
  CreateContactChannelPayload,
  CreateContactPayload,
  UpdateClientCategoryPayload,
  UpdateContactChannelPayload,
  UpdateContactPayload,
  ValueSegment,
} from "../types";

/**
 * Le logo est un fichier téléversé, pas une chaîne (§ demande frontend :
 * plus de saisie manuelle d'URL) — la création et la mise à jour d'une
 * catégorie client passent donc toujours en `multipart/form-data`, même
 * sans fichier, pour rester cohérentes avec
 * `ClientCategoryController::store/update` (nj-backend), qui valide
 * `badge_image` comme un fichier optionnel.
 */
function clientCategoryFormData(payload: CreateClientCategoryPayload | UpdateClientCategoryPayload): FormData {
  const formData = new FormData();
  if (payload.code !== undefined) formData.set("code", payload.code);
  if (payload.label !== undefined) formData.set("label", payload.label);
  if (payload.badge_color !== undefined) formData.set("badge_color", payload.badge_color);
  if (payload.description !== undefined) formData.set("description", payload.description);
  if (payload.sort_order !== undefined) formData.set("sort_order", String(payload.sort_order));
  if (payload.is_active !== undefined) formData.set("is_active", payload.is_active ? "1" : "0");
  if (payload.badge_image) formData.set("badge_image", payload.badge_image);
  if ((payload as UpdateClientCategoryPayload).remove_badge_image) formData.set("remove_badge_image", "1");
  return formData;
}

export const clientCategoriesApi = {
  list: () => apiClient.get<{ data: ClientCategory[] }>(endpoints.clients.categories),
  create: (payload: CreateClientCategoryPayload) =>
    apiClient.postForm<{ data: ClientCategory }>(endpoints.clients.categories, clientCategoryFormData(payload)),
  update: (id: number, payload: UpdateClientCategoryPayload) => {
    // PHP ne peuple $_FILES que pour une requête POST multipart : on "spoof"
    // donc un PUT via `_method` (mécanisme natif Laravel) plutôt que
    // `apiClient.put`, qui enverrait un vrai PUT dont le corps multipart ne
    // serait pas parsé côté serveur (route réelle : `Route::put(...)`, voir
    // routes/client/client.php).
    const formData = clientCategoryFormData(payload);
    formData.set("_method", "PUT");
    return apiClient.postForm<{ data: ClientCategory }>(endpoints.clients.categoryDetail(id), formData);
  },
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.clients.categoryDetail(id)),
};

export const contactChannelsApi = {
  list: () => apiClient.get<{ data: ContactChannelType[] }>(endpoints.clients.contactChannels),
  create: (payload: CreateContactChannelPayload) => apiClient.post<{ data: ContactChannelType }>(endpoints.clients.contactChannels, payload),
  update: (id: number, payload: UpdateContactChannelPayload) =>
    apiClient.put<{ data: ContactChannelType }>(endpoints.clients.contactChannelDetail(id), payload),
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.clients.contactChannelDetail(id)),
};

export const clientsApi = {
  list: (filters: ClientListFilters) => apiClient.get<ApiCollection<Client>>(`${endpoints.clients.base}${toQueryString(filters)}`),
  get: (id: number) => apiClient.get<{ data: Client }>(endpoints.clients.detail(id)),
  create: (payload: ClientFormValues) => apiClient.post<{ data: Client }>(endpoints.clients.base, payload),
  update: (id: number, payload: Partial<ClientFormValues>) => apiClient.put<{ data: Client }>(endpoints.clients.detail(id), payload),
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.clients.detail(id)),
  changeStatus: (id: number, status: ClientStatus) => apiClient.put<{ data: Client }>(endpoints.clients.status(id), { status }),
  adjustValueSegment: (id: number, value_segment: ValueSegment) =>
    apiClient.put<{ data: Client }>(endpoints.clients.valueSegment(id), { value_segment }),

  contacts: (clientId: number) => apiClient.get<{ data: ClientContact[] }>(endpoints.clients.contacts(clientId)),
  createContact: (clientId: number, payload: CreateContactPayload) =>
    apiClient.post<{ data: ClientContact }>(endpoints.clients.contacts(clientId), payload),
  updateContact: (clientId: number, contactId: number, payload: UpdateContactPayload) =>
    apiClient.put<{ data: ClientContact }>(endpoints.clients.contactDetail(clientId, contactId), payload),
  removeContact: (clientId: number, contactId: number) => apiClient.delete<ApiMessage>(endpoints.clients.contactDetail(clientId, contactId)),

  syncTags: (clientId: number, tagIds: number[]) =>
    apiClient.put<{ data: Client }>(endpoints.clients.tags(clientId), { tag_ids: tagIds }),
};
