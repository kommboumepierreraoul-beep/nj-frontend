import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import type { NotificationPreference, UpdateNotificationPreferencesPayload } from "../types";

export const notificationPreferencesApi = {
  list: () => apiClient.get<{ data: NotificationPreference[] }>(endpoints.notificationPreferences.base),
  update: (payload: UpdateNotificationPreferencesPayload) => apiClient.put<{ data: NotificationPreference[] }>(endpoints.notificationPreferences.base, payload),
};
