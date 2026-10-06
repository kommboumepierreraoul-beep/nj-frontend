import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiCollection, ApiMessage, ApiResource } from "@/types/api";
import type { Notification, NotificationListFilters } from "../types";

export const notificationsApi = {
  list: (filters: NotificationListFilters) => apiClient.get<ApiCollection<Notification>>(`${endpoints.notifications.base}${toQueryString(filters)}`),
  unreadCount: () => apiClient.get<{ unread_count: number }>(endpoints.notifications.unreadCount),
  markRead: (id: number) => apiClient.patch<ApiResource<Notification>>(endpoints.notifications.markRead(id)),
  markAllRead: () => apiClient.patch<ApiMessage>(endpoints.notifications.markAllRead),
};
