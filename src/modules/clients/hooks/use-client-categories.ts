"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientCategoriesApi } from "../api/clients.api";
import { ApiError } from "@/lib/http/api-error";
import type { CreateClientCategoryPayload, UpdateClientCategoryPayload } from "../types";
import { translate } from "@/i18n/translate";

const KEY = ["clients", "categories"] as const;

export function useClientCategories() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => clientCategoriesApi.list(),
    select: (data) => data.data,
  });
}

export function useCreateClientCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientCategoryPayload) => clientCategoriesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.categorieCreee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateClientCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateClientCategoryPayload }) => clientCategoriesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.categorieMiseAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteClientCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clientCategoriesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.categorieSupprimee"));
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError && error.status === 409
          ? translate("t.desClientsSontEncoreRattachesACetteCategorieDesact")
          : error instanceof ApiError
            ? error.message
            : translate("toast.suppressionImpossible"),
      ),
  });
}
