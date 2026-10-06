"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { referenceDataApi } from "../api/reference-data.api";
import { ApiError } from "@/lib/http/api-error";
import type { CreateTagPayload, UpdateTagPayload } from "../types";
import { translate } from "@/i18n/translate";

const TAGS_KEY = ["reference-data", "tags"] as const;

export function useTags() {
  return useQuery({
    queryKey: TAGS_KEY,
    queryFn: () => referenceDataApi.tags(),
    select: (data) => data.data,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTagPayload) => referenceDataApi.createTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toast.success(translate("toast.tagCree"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTagPayload }) => referenceDataApi.updateTag(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toast.success(translate("toast.tagMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => referenceDataApi.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toast.success(translate("toast.tagSupprime"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("t.suppressionImpossibleVerifiezQuAucunProduitNeLUtil")),
  });
}
