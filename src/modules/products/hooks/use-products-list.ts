"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products.api";
import type { ProductListFilters } from "../types";

export function useProductsList(filters: ProductListFilters) {
  return useQuery({
    queryKey: ["products", "list", filters],
    queryFn: () => productsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
