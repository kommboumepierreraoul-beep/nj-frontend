"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { suppliersApi } from "../api/suppliers.api";
import { ApiError } from "@/lib/http/api-error";
import { routes } from "@/config/routes";
import type { BlacklistSupplierPayload, SupplierFormValues, VerifySupplierPayload } from "../types";
import { translate } from "@/i18n/translate";

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: SupplierFormValues) => suppliersApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
      toast.success(translate("toast.fournisseurCree"));
      router.push(routes.suppliers.detail(data.data.id));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateSupplier(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SupplierFormValues>) => suppliersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", "detail", id] });
      toast.success(translate("toast.fournisseurMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: number) => suppliersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
      toast.success(translate("toast.fournisseurSupprime"));
      router.push(routes.suppliers.list);
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}

export function useVerifySupplier(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifySupplierPayload) => suppliersApi.verify(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
      toast.success(translate("toast.fournisseurVerifie"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.verificationImpossible")),
  });
}

export function useBlacklistSupplier(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BlacklistSupplierPayload) => suppliersApi.blacklist(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
      toast.success(translate("toast.statutDeListeNoireMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.actionImpossible")),
  });
}
