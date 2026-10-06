"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { purchaseOrdersApi } from "../api/purchase-orders.api";
import type { PurchaseOrderListFilters } from "../types";

export function usePurchaseOrdersList(filters: PurchaseOrderListFilters) {
  return useQuery({
    queryKey: ["purchase-orders", "list", filters],
    queryFn: () => purchaseOrdersApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
