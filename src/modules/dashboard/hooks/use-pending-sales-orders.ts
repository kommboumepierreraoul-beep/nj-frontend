"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";

export function usePendingSalesOrders(page: number, perPage = 20) {
  return useQuery({
    queryKey: ["dashboard", "pending-sales-orders", page, perPage],
    queryFn: () => dashboardApi.pendingSalesOrders(page, perPage),
    placeholderData: keepPreviousData,
  });
}
