"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { suppliersApi } from "../api/suppliers.api";
import { ApiError } from "@/lib/http/api-error";
import type { SupplierDocumentPayload } from "../types";
import { translate } from "@/i18n/translate";

function key(supplierId: number) {
  return ["suppliers", "documents", supplierId] as const;
}

export function useSupplierDocuments(supplierId: number) {
  return useQuery({
    queryKey: key(supplierId),
    queryFn: () => suppliersApi.documents(supplierId),
    select: (data) => data.data,
  });
}

export function useCreateSupplierDocument(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierDocumentPayload) => suppliersApi.createDocument(supplierId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      toast.success(translate("toast.documentAjoute"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajoutImpossible")),
  });
}

export function useUpdateSupplierDocument(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, payload }: { documentId: number; payload: Partial<SupplierDocumentPayload> }) =>
      suppliersApi.updateDocument(supplierId, documentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      toast.success(translate("toast.documentMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteSupplierDocument(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: number) => suppliersApi.removeDocument(supplierId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      toast.success(translate("toast.documentSupprime"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
