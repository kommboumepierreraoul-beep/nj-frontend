"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { salesOrdersApi } from "../api/sales-orders.api";
import { ApiError } from "@/lib/http/api-error";
import { routes } from "@/config/routes";
import type { ChangeStatusPayload, SalesOrderCreatePayload, SalesOrderUpdatePayload } from "../types";
import { translate } from "@/i18n/translate";

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: SalesOrderCreatePayload) => salesOrdersApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "list"] });
      toast.success(translate("toast.commandeCreee"));
      router.push(routes.salesOrders.detail(data.data.id));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateSalesOrder(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalesOrderUpdatePayload) => salesOrdersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "detail", id] });
      toast.success(translate("toast.commandeMiseAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: number) => salesOrdersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "list"] });
      toast.success(translate("toast.commandeSupprimee"));
      router.push(routes.salesOrders.list);
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}

/** § « Action Changer le statut » — passer à `PROFORMA_ENVOYEE` exige une ligne sélectionnée, à `ANNULEE` un motif : messages renvoyés tels quels par l'API plutôt que redéfinis côté client. */
export function useChangeSalesOrderStatus(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangeStatusPayload) => salesOrdersApi.changeStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "status-history", id] });
      toast.success(translate("toast.statutMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.changementDeStatutImpossible")),
  });
}
