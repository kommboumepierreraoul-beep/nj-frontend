"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products.api";

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: () => productsApi.get(id),
    select: (data) => data.data,
  });
}
