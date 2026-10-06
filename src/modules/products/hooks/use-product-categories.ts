"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productCategoriesApi } from "../api/products.api";
import { ApiError } from "@/lib/http/api-error";
import type { CreateProductCategoryPayload, UpdateProductCategoryPayload } from "../types";
import { translate } from "@/i18n/translate";

const KEY = ["products", "categories"] as const;

export function useProductCategories() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => productCategoriesApi.list(),
    select: (data) => data.data,
  });
}

export function useCreateProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductCategoryPayload) => productCategoriesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.categorieCreee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProductCategoryPayload }) => productCategoriesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.categorieMiseAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productCategoriesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.categorieSupprimee"));
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError && error.status === 409
          ? translate("t.desProduitsOuDesSousCategoriesSontEncoreRattachesA")
          : error instanceof ApiError
            ? error.message
            : translate("toast.suppressionImpossible"),
      ),
  });
}
