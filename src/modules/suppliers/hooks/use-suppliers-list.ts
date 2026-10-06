"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { suppliersApi } from "../api/suppliers.api";
import type { SupplierListFilters } from "../types";

export function useSuppliersList(filters: SupplierListFilters) {
  return useQuery({
    queryKey: ["suppliers", "list", filters],
    queryFn: () => suppliersApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
