"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsApi } from "../api/notifications.api";
import { ApiError } from "@/lib/http/api-error";
import { translate } from "@/i18n/translate";

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
}

/** § 1/§ 2 — marque une notification comme lue ; l'appelant (cloche ou page liste) enchaîne ensuite avec la navigation vers `data.link` si présent. */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => invalidate(queryClient),
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Impossible de marquer cette notification comme lue."),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      invalidate(queryClient);
      toast.success(translate("toast.toutesLesNotificationsOntEteMarqueesCommeLues"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.actionImpossible")),
  });
}
