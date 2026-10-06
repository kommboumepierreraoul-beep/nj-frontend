"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { salesOrdersApi } from "../api/sales-orders.api";
import { ApiError } from "@/lib/http/api-error";
import type { SalesOrderItemPayload, SalesOrderItemUpdatePayload } from "../types";
import { translate } from "@/i18n/translate";

function itemsKey(id: number) {
  return ["sales-orders", "items", id] as const;
}

/**
 * Ajouter/modifier/supprimer une ligne recalcule `subtotal_amount` et
 * `total_amount` côté serveur, mais ne touche jamais la commission figée
 * (Doc/spec_pages_commandes.md § « Onglet Lignes ») — on invalide donc
 * systématiquement la fiche commande en plus des lignes.
 */
export function useSalesOrderItems(id: number) {
  return useQuery({
    queryKey: itemsKey(id),
    queryFn: () => salesOrdersApi.items(id),
    select: (data) => data.data,
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useCreateSalesOrderItem(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalesOrderItemPayload) => salesOrdersApi.createItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsKey(id) });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "detail", id] });
      toast.success(translate("toast.ligneAjoutee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajoutImpossible")),
  });
}

export function useUpdateSalesOrderItem(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: number; payload: SalesOrderItemUpdatePayload }) => salesOrdersApi.updateItem(id, itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsKey(id) });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "detail", id] });
      toast.success(translate("toast.ligneMiseAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteSalesOrderItem(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => salesOrdersApi.removeItem(id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsKey(id) });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "detail", id] });
      toast.success(translate("toast.ligneSupprimee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
