"use client";

import { useQuery } from "@tanstack/react-query";
import { rfqApi } from "../api/rfq.api";

export function useRfq(id: number) {
  return useQuery({
    queryKey: ["rfqs", "detail", id],
    queryFn: () => rfqApi.get(id),
    select: (data) => data.data,
  });
}
