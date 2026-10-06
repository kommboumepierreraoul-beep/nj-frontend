"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationPreferencesApi } from "../api/notification-preferences.api";
import { ApiError } from "@/lib/http/api-error";
import type { UpdateNotificationPreferencesPayload } from "../types";
import { translate } from "@/i18n/translate";

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => notificationPreferencesApi.list(),
    select: (data) => data.data,
  });
}

/** § 3 — un bouton « Enregistrer » unique envoie les 6 lignes en une requête, même si une seule a changé. */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateNotificationPreferencesPayload) => notificationPreferencesApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success(translate("toast.preferencesEnregistrees"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.enregistrementImpossible")),
  });
}
