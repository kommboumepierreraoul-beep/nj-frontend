"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productsApi } from "../api/products.api";
import { ApiError } from "@/lib/http/api-error";
import type { LinkVariantSupplierPayload } from "../types";
import { translate } from "@/i18n/translate";

function variantKey(productId: number, variantId: number) {
  return ["products", "detail", productId, "variants", variantId] as const;
}

export function useLinkVariantSupplier(productId: number, variantId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LinkVariantSupplierPayload) => productsApi.linkSupplier(productId, variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKey(productId, variantId) });
      toast.success(translate("toast.fournisseurLie"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.liaisonImpossible")),
  });
}

export function useUpdateVariantSupplierLink(productId: number, variantId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ linkId, payload }: { linkId: number; payload: Partial<LinkVariantSupplierPayload> }) =>
      productsApi.updateSupplierLink(productId, variantId, linkId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKey(productId, variantId) });
      toast.success(translate("toast.liaisonMiseAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useRemoveVariantSupplierLink(productId: number, variantId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: number) => productsApi.removeSupplierLink(productId, variantId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKey(productId, variantId) });
      toast.success(translate("toast.liaisonSupprimee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
