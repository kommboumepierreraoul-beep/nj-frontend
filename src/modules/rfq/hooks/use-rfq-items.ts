"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rfqApi } from "../api/rfq.api";
import { ApiError } from "@/lib/http/api-error";
import type { RfqItemPayload } from "../types";
import { translate } from "@/i18n/translate";

function key(rfqId: number) {
  return ["rfqs", "items", rfqId] as const;
}

export function useRfqItems(rfqId: number) {
  return useQuery({
    queryKey: key(rfqId),
    queryFn: () => rfqApi.items(rfqId),
    select: (data) => data.data,
  });
}

export function useCreateRfqItem(rfqId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RfqItemPayload) => rfqApi.createItem(rfqId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(rfqId) });
      toast.success(translate("toast.articleAjoute"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajoutImpossible")),
  });
}

export function useUpdateRfqItem(rfqId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: number; payload: Partial<RfqItemPayload> }) => rfqApi.updateItem(rfqId, itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(rfqId) });
      toast.success(translate("toast.articleMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteRfqItem(rfqId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => rfqApi.removeItem(rfqId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(rfqId) });
      toast.success(translate("toast.articleSupprime"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
