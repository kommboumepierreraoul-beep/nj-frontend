"use client";

import { useQuery } from "@tanstack/react-query";
import { salesOrdersApi } from "../api/sales-orders.api";

export function useSalesOrder(id: number) {
  return useQuery({
    queryKey: ["sales-orders", "detail", id],
    queryFn: () => salesOrdersApi.get(id),
    select: (data) => data.data,
    enabled: Number.isInteger(id) && id > 0,
  });
}
