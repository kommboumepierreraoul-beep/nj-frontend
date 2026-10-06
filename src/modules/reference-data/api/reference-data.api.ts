import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import type { ApiMessage } from "@/types/api";
import type { CreateTagPayload, Country, Currency, Tag, Unit, UpdateTagPayload } from "../types";

export const referenceDataApi = {
  countries: () => apiClient.get<{ data: Country[] }>(endpoints.referenceData.countries),
  currencies: () => apiClient.get<{ data: Currency[] }>(endpoints.referenceData.currencies),
  units: () => apiClient.get<{ data: Unit[] }>(endpoints.referenceData.units),

  tags: () => apiClient.get<{ data: Tag[] }>(endpoints.referenceData.tags),
  createTag: (payload: CreateTagPayload) => apiClient.post<{ data: Tag }>(endpoints.referenceData.tags, payload),
  updateTag: (id: number, payload: UpdateTagPayload) =>
    apiClient.put<{ data: Tag }>(endpoints.referenceData.tagDetail(id), payload),
  deleteTag: (id: number) => apiClient.delete<ApiMessage>(endpoints.referenceData.tagDetail(id)),
};
