"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productsApi } from "../api/products.api";
import { ApiError } from "@/lib/http/api-error";
import type { AssignVariantAttributePayload } from "../types";
import { translate } from "@/i18n/translate";

function variantKey(productId: number, variantId: number) {
  return ["products", "detail", productId, "variants", variantId] as const;
}

export function useAssignVariantAttribute(productId: number, variantId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignVariantAttributePayload) => productsApi.assignAttribute(productId, variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKey(productId, variantId) });
      toast.success(translate("toast.attributAjoute"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajoutImpossible")),
  });
}

export function useUpdateVariantAttribute(productId: number, variantId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ valueId, payload }: { valueId: number; payload: Partial<AssignVariantAttributePayload> }) =>
      productsApi.updateAttributeValue(productId, variantId, valueId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKey(productId, variantId) });
      toast.success(translate("toast.attributMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useRemoveVariantAttribute(productId: number, variantId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (valueId: number) => productsApi.removeAttributeValue(productId, variantId, valueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKey(productId, variantId) });
      toast.success(translate("toast.attributRetire"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
