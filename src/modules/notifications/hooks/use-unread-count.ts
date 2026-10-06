"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications.api";

/** § Conventions générales — pas de temps réel (hors périmètre) : sondage à 45s, alimente le badge de la cloche sur toutes les pages authentifiées. */
export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.unreadCount(),
    select: (data) => data.unread_count,
    refetchInterval: 45_000,
    refetchOnWindowFocus: true,
  });
}
