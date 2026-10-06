"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { rfqApi } from "../api/rfq.api";
import type { RfqListFilters } from "../types";

export function useRfqsList(filters: RfqListFilters) {
  return useQuery({
    queryKey: ["rfqs", "list", filters],
    queryFn: () => rfqApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
