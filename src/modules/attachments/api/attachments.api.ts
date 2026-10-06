import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import type { ApiMessage } from "@/types/api";
import type {
  Attachment,
  AttachmentListFilters,
  CreateAttachmentPayload,
  UpdateAttachmentPayload,
} from "../types";

export const attachmentsApi = {
  list: (filters: AttachmentListFilters) =>
    apiClient.get<{ data: Attachment[] }>(
      `${endpoints.attachments.base}?attachable_type=${filters.attachable_type}&attachable_id=${filters.attachable_id}`,
    ),

  create: (payload: CreateAttachmentPayload) => {
    const formData = new FormData();
    formData.set("attachable_type", payload.attachable_type);
    formData.set("attachable_id", String(payload.attachable_id));
    formData.set("file", payload.file);
    payload.media_types.forEach((type, index) => formData.append(`media_types[${index}]`, type));
    if (payload.is_primary !== undefined) formData.set("is_primary", payload.is_primary ? "1" : "0");
    if (payload.sort_order !== undefined) formData.set("sort_order", String(payload.sort_order));
    return apiClient.postForm<{ data: Attachment }>(endpoints.attachments.base, formData);
  },

  update: (id: number, payload: UpdateAttachmentPayload) =>
    apiClient.put<{ data: Attachment }>(endpoints.attachments.detail(id), payload),

  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.attachments.detail(id)),
};
