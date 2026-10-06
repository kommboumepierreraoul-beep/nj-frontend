"use client";

import { useQuery } from "@tanstack/react-query";
import { salesOrdersApi } from "../api/sales-orders.api";

/** Doc/spec_pages_commandes.md § « Onglet Historique de statut » — lecture seule, aucune action possible. */
export function useSalesOrderStatusHistory(id: number) {
  return useQuery({
    queryKey: ["sales-orders", "status-history", id],
    queryFn: () => salesOrdersApi.statusHistory(id),
    select: (data) => data.data,
    enabled: Number.isInteger(id) && id > 0,
  });
}
