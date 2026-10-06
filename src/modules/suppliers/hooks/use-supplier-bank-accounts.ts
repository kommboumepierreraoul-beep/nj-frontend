"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { suppliersApi } from "../api/suppliers.api";
import { ApiError } from "@/lib/http/api-error";
import type { SupplierBankAccountPayload } from "../types";
import { translate } from "@/i18n/translate";

function key(supplierId: number) {
  return ["suppliers", "bank-accounts", supplierId] as const;
}

export function useSupplierBankAccounts(supplierId: number) {
  return useQuery({
    queryKey: key(supplierId),
    queryFn: () => suppliersApi.bankAccounts(supplierId),
    select: (data) => data.data,
  });
}

export function useCreateSupplierBankAccount(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierBankAccountPayload) => suppliersApi.createBankAccount(supplierId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      toast.success(translate("toast.compteAjoute"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajoutImpossible")),
  });
}

export function useUpdateSupplierBankAccount(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, payload }: { accountId: number; payload: Partial<SupplierBankAccountPayload> }) =>
      suppliersApi.updateBankAccount(supplierId, accountId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      toast.success(translate("toast.compteMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteSupplierBankAccount(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: number) => suppliersApi.removeBankAccount(supplierId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      toast.success(translate("toast.compteSupprime"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
