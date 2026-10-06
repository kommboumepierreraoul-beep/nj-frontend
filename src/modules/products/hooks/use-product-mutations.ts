"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { productsApi } from "../api/products.api";
import { ApiError } from "@/lib/http/api-error";
import { routes } from "@/config/routes";
import type { ProductFormValues } from "../types";
import { translate } from "@/i18n/translate";

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: ProductFormValues) => productsApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      toast.success(translate("toast.produitCree"));
      router.push(routes.products.detail(data.data.id));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ProductFormValues>) => productsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      queryClient.invalidateQueries({ queryKey: ["products", "detail", id] });
      toast.success(translate("toast.produitMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      toast.success(translate("toast.produitSupprime"));
      router.push(routes.products.list);
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}

export function useSyncProductTags(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagIds: number[]) => productsApi.syncTags(id, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "detail", id] });
      toast.success(translate("toast.etiquettesMisesAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}
