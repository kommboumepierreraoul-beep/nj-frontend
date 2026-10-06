"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productsApi } from "../api/products.api";
import { ApiError } from "@/lib/http/api-error";
import type { RecordVariantPricePayload } from "../types";
import { translate } from "@/i18n/translate";

function key(productId: number, variantId: number) {
  return ["products", "detail", productId, "variants", variantId, "price-history"] as const;
}

export function useVariantPriceHistory(productId: number, variantId: number) {
  return useQuery({
    queryKey: key(productId, variantId),
    queryFn: () => productsApi.priceHistory(productId, variantId),
    select: (data) => data.data,
  });
}

export function useRecordVariantPrice(productId: number, variantId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordVariantPricePayload) => productsApi.recordPrice(productId, variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(productId, variantId) });
      queryClient.invalidateQueries({ queryKey: ["products", "detail", productId, "variants", variantId] });
      toast.success(translate("toast.prixEnregistre"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.enregistrementImpossible")),
  });
}
