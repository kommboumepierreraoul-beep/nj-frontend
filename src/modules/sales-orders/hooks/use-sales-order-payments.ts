"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { salesOrdersApi } from "../api/sales-orders.api";
import { ApiError } from "@/lib/http/api-error";
import type { RecordPaymentPayload, SalesOrderPaymentListFilters, VoidPaymentPayload } from "../types";
import { translate } from "@/i18n/translate";

function paymentsKey(id: number) {
  return ["sales-orders", "payments", id] as const;
}

/** `payment_status` est recalculé côté serveur à chaque mouvement — la fiche commande est donc toujours invalidée en même temps que la liste des paiements. */
export function useSalesOrderPayments(id: number) {
  return useQuery({
    queryKey: paymentsKey(id),
    queryFn: () => salesOrdersApi.payments(id),
    select: (data) => data.data,
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useRecordSalesOrderPayment(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordPaymentPayload) => salesOrdersApi.recordPayment(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentsKey(id) });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "invoices", id] });
      toast.success(data.data.direction === "REMBOURSEMENT" ? translate("t.remboursementEnregistre") : translate("t.encaissementEnregistre"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.enregistrementImpossible")),
  });
}

export function useVoidSalesOrderPayment(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, payload }: { paymentId: number; payload: VoidPaymentPayload }) => salesOrdersApi.voidPayment(id, paymentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey(id) });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "detail", id] });
      toast.success(translate("toast.mouvementAnnule"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.annulationImpossible")),
  });
}

/** Doc/design_system_maquette_complete.md § 6.2 — registre transverse, toutes commandes confondues. */
export function useSalesOrderPaymentsRegistry(filters: SalesOrderPaymentListFilters) {
  return useQuery({
    queryKey: ["sales-order-payments", "list", filters] as const,
    queryFn: () => salesOrdersApi.listAllPayments(filters),
    placeholderData: keepPreviousData,
  });
}

/**
 * Même endpoint d'annulation que useVoidSalesOrderPayment ci-dessus, mais appelable
 * depuis le registre transverse où l'identifiant de la commande varie ligne par ligne
 * (passé explicitement à chaque appel plutôt que figé à l'initialisation du hook).
 * Invalide le registre, la liste de paiements et la fiche de la commande concernée.
 */
export function useVoidSalesOrderPaymentGlobal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ salesOrderId, paymentId, payload }: { salesOrderId: number; paymentId: number; payload: VoidPaymentPayload }) =>
      salesOrdersApi.voidPayment(salesOrderId, paymentId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-order-payments"] });
      queryClient.invalidateQueries({ queryKey: paymentsKey(variables.salesOrderId) });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "detail", variables.salesOrderId] });
      toast.success(translate("toast.mouvementAnnule"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.annulationImpossible")),
  });
}
