"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { purchaseOrdersApi } from "../api/purchase-orders.api";
import { ApiError } from "@/lib/http/api-error";
import type { PurchaseOrderItemPayload } from "../types";
import { translate } from "@/i18n/translate";

function itemsKey(poId: number) {
  return ["purchase-orders", "items", poId] as const;
}

/**
 * Le total de la commande (`total_amount`) est recalculé côté serveur à
 * chaque action sur les articles (Doc/spec_pages_fournisseurs.md § 6) — on
 * invalide donc systématiquement la fiche commande en plus des articles.
 */
export function usePurchaseOrderItems(poId: number) {
  return useQuery({
    queryKey: itemsKey(poId),
    queryFn: () => purchaseOrdersApi.items(poId),
    select: (data) => data.data,
  });
}

export function useCreatePurchaseOrderItem(poId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseOrderItemPayload) => purchaseOrdersApi.createItem(poId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsKey(poId) });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders", "detail", poId] });
      toast.success(translate("toast.articleAjoute"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajoutImpossible")),
  });
}

export function useUpdatePurchaseOrderItem(poId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: number; payload: Partial<PurchaseOrderItemPayload> }) => purchaseOrdersApi.updateItem(poId, itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsKey(poId) });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders", "detail", poId] });
      toast.success(translate("toast.articleMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeletePurchaseOrderItem(poId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => purchaseOrdersApi.removeItem(poId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsKey(poId) });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders", "detail", poId] });
      toast.success(translate("toast.articleSupprime"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
