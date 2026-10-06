"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { purchaseOrdersApi } from "../api/purchase-orders.api";
import { ApiError } from "@/lib/http/api-error";
import { routes } from "@/config/routes";
import type { PurchaseOrderFormValues } from "../types";
import { translate } from "@/i18n/translate";

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: PurchaseOrderFormValues) => purchaseOrdersApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders", "list"] });
      toast.success(translate("toast.commandeCreee"));
      router.push(routes.suppliers.purchaseOrderDetail(data.data.id));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdatePurchaseOrder(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PurchaseOrderFormValues>) => purchaseOrdersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders", "detail", id] });
      toast.success(translate("toast.commandeMiseAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: number) => purchaseOrdersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders", "list"] });
      toast.success(translate("toast.commandeSupprimee"));
      router.push(routes.suppliers.purchaseOrderList);
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
