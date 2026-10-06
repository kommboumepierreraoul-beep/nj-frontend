"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications.api";
import type { NotificationListFilters } from "../types";

export function useNotificationsList(filters: NotificationListFilters, enabled = true) {
  return useQuery({
    queryKey: ["notifications", "list", filters],
    queryFn: () => notificationsApi.list(filters),
    enabled,
  });
}
