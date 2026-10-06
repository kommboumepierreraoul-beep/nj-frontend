"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productsApi } from "../api/products.api";
import { ApiError } from "@/lib/http/api-error";
import type { VariantFormValues } from "../types";
import { translate } from "@/i18n/translate";

function variantsKey(productId: number) {
  return ["products", "detail", productId, "variants"] as const;
}

export function useCreateVariant(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VariantFormValues) => productsApi.createVariant(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKey(productId) });
      queryClient.invalidateQueries({ queryKey: ["products", "detail", productId] });
      toast.success(translate("toast.varianteCreee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateVariant(productId: number, variantId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<VariantFormValues>) => productsApi.updateVariant(productId, variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKey(productId) });
      queryClient.invalidateQueries({ queryKey: [...variantsKey(productId), variantId] });
      toast.success(translate("toast.varianteMiseAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteVariant(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: number) => productsApi.removeVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKey(productId) });
      queryClient.invalidateQueries({ queryKey: ["products", "detail", productId] });
      toast.success(translate("toast.varianteSupprimee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
