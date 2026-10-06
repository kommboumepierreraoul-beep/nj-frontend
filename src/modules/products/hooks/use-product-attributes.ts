"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productAttributesApi } from "../api/products.api";
import { ApiError } from "@/lib/http/api-error";
import type { CreateProductAttributePayload, UpdateProductAttributePayload } from "../types";
import { translate } from "@/i18n/translate";

const KEY = ["products", "attributes"] as const;

export function useProductAttributes() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => productAttributesApi.list(),
    select: (data) => data.data,
  });
}

export function useCreateProductAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductAttributePayload) => productAttributesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.attributCree"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateProductAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProductAttributePayload }) => productAttributesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.attributMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteProductAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productAttributesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.attributSupprime"));
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError && error.status === 409
          ? translate("t.cetAttributEstEncoreUtiliseParDesVariantesRetirezL")
          : error instanceof ApiError
            ? error.message
            : translate("toast.suppressionImpossible"),
      ),
  });
}

export function useCreateAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId, payload }: { attributeId: number; payload: { value: string; sort_order?: number } }) =>
      productAttributesApi.createValue(attributeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.valeurAjoutee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajoutImpossible")),
  });
}

export function useUpdateAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attributeId,
      valueId,
      payload,
    }: {
      attributeId: number;
      valueId: number;
      payload: { value?: string; sort_order?: number };
    }) => productAttributesApi.updateValue(attributeId, valueId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.valeurMiseAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId, valueId }: { attributeId: number; valueId: number }) =>
      productAttributesApi.removeValue(attributeId, valueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.valeurSupprimee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
