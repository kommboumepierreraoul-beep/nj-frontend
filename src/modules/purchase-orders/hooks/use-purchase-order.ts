"use client";

import { useQuery } from "@tanstack/react-query";
import { purchaseOrdersApi } from "../api/purchase-orders.api";

export function usePurchaseOrder(id: number) {
  return useQuery({
    queryKey: ["purchase-orders", "detail", id],
    queryFn: () => purchaseOrdersApi.get(id),
    select: (data) => data.data,
  });
}
