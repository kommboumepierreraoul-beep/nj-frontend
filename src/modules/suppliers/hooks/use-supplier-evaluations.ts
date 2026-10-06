"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { suppliersApi } from "../api/suppliers.api";
import { ApiError } from "@/lib/http/api-error";
import type { SupplierEvaluationPayload } from "../types";
import { translate } from "@/i18n/translate";

function key(supplierId: number) {
  return ["suppliers", "evaluations", supplierId] as const;
}

/**
 * Chaque mutation recalcule `reliability_score` côté serveur (Doc/spec_pages_fournisseurs.md
 * § Onglet Évaluations) — on invalide donc systématiquement la fiche fournisseur en plus
 * de la liste des évaluations, pour que le score affiché en en-tête se rafraîchisse.
 */
export function useSupplierEvaluations(supplierId: number) {
  return useQuery({
    queryKey: key(supplierId),
    queryFn: () => suppliersApi.evaluations(supplierId),
    select: (data) => data.data,
  });
}

export function useCreateSupplierEvaluation(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierEvaluationPayload) => suppliersApi.createEvaluation(supplierId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      queryClient.invalidateQueries({ queryKey: ["suppliers", "detail", supplierId] });
      toast.success(translate("toast.evaluationEnregistree"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.enregistrementImpossible")),
  });
}

export function useUpdateSupplierEvaluation(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ evaluationId, payload }: { evaluationId: number; payload: Partial<SupplierEvaluationPayload> }) =>
      suppliersApi.updateEvaluation(supplierId, evaluationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      queryClient.invalidateQueries({ queryKey: ["suppliers", "detail", supplierId] });
      toast.success(translate("toast.evaluationMiseAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteSupplierEvaluation(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (evaluationId: number) => suppliersApi.removeEvaluation(supplierId, evaluationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      queryClient.invalidateQueries({ queryKey: ["suppliers", "detail", supplierId] });
      toast.success(translate("toast.evaluationSupprimee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
