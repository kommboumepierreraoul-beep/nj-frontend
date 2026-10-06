"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { clientsApi } from "../api/clients.api";
import type { ClientListFilters } from "../types";

export function useClientsList(filters: ClientListFilters) {
  return useQuery({
    queryKey: ["clients", "list", filters],
    queryFn: () => clientsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
