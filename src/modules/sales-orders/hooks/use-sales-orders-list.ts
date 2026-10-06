"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { salesOrdersApi } from "../api/sales-orders.api";
import type { SalesOrderListFilters } from "../types";

export function useSalesOrdersList(filters: SalesOrderListFilters) {
  return useQuery({
    queryKey: ["sales-orders", "list", filters],
    queryFn: () => salesOrdersApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
