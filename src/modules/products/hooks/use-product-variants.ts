"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products.api";

export function useProductVariants(productId: number) {
  return useQuery({
    queryKey: ["products", "detail", productId, "variants"],
    queryFn: () => productsApi.variants(productId),
    select: (data) => data.data,
  });
}

export function useProductVariant(productId: number, variantId: number) {
  return useQuery({
    queryKey: ["products", "detail", productId, "variants", variantId],
    queryFn: () => productsApi.variant(productId, variantId),
    select: (data) => data.data,
    enabled: Number.isFinite(variantId),
  });
}
