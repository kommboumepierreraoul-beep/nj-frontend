"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { suppliersApi } from "../api/suppliers.api";
import { ApiError } from "@/lib/http/api-error";
import type { SupplierCommunicationLogPayload } from "../types";
import { translate } from "@/i18n/translate";

function key(supplierId: number) {
  return ["suppliers", "communication-logs", supplierId] as const;
}

export function useSupplierCommunicationLogs(supplierId: number) {
  return useQuery({
    queryKey: key(supplierId),
    queryFn: () => suppliersApi.communicationLogs(supplierId),
    select: (data) => data.data,
  });
}

export function useCreateSupplierCommunicationLog(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierCommunicationLogPayload) => suppliersApi.createCommunicationLog(supplierId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      toast.success(translate("toast.entreeAjoutee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajoutImpossible")),
  });
}

export function useUpdateSupplierCommunicationLog(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, payload }: { logId: number; payload: Partial<SupplierCommunicationLogPayload> }) =>
      suppliersApi.updateCommunicationLog(supplierId, logId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      toast.success(translate("toast.entreeMiseAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteSupplierCommunicationLog(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId: number) => suppliersApi.removeCommunicationLog(supplierId, logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      toast.success(translate("toast.entreeSupprimee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
