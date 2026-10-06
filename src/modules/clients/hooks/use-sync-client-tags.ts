"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientsApi } from "../api/clients.api";
import { ApiError } from "@/lib/http/api-error";
import { translate } from "@/i18n/translate";

export function useSyncClientTags(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagIds: number[]) => clientsApi.syncTags(clientId, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", "detail", clientId] });
      toast.success(translate("toast.etiquettesMisesAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}
