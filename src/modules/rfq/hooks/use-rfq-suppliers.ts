"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rfqApi } from "../api/rfq.api";
import { ApiError } from "@/lib/http/api-error";
import type { RfqSupplierPayload } from "../types";
import { translate } from "@/i18n/translate";

function key(rfqId: number) {
  return ["rfqs", "suppliers", rfqId] as const;
}

export function useRfqSuppliers(rfqId: number) {
  return useQuery({
    queryKey: key(rfqId),
    queryFn: () => rfqApi.suppliers(rfqId),
    select: (data) => data.data,
  });
}

export function useCreateRfqSupplier(rfqId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RfqSupplierPayload) => rfqApi.createSupplier(rfqId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(rfqId) });
      toast.success(translate("toast.fournisseurSollicite"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.actionImpossible")),
  });
}

export function useUpdateRfqSupplier(rfqId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rfqSupplierId, payload }: { rfqSupplierId: number; payload: Partial<RfqSupplierPayload> & { response_date?: string } }) =>
      rfqApi.updateSupplier(rfqId, rfqSupplierId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(rfqId) });
      toast.success(translate("toast.misAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteRfqSupplier(rfqId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rfqSupplierId: number) => rfqApi.removeSupplier(rfqId, rfqSupplierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(rfqId) });
      toast.success(translate("toast.fournisseurRetire"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
