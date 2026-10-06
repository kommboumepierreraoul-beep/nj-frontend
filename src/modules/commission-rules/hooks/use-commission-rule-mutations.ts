"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { commissionRulesApi } from "../api/commission-rules.api";
import { ApiError } from "@/lib/http/api-error";
import type { CommissionRulePayload } from "../types";
import { translate } from "@/i18n/translate";

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["commission-rules", "list"] });
}

export function useCreateCommissionRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommissionRulePayload) => commissionRulesApi.create(payload),
    onSuccess: () => {
      invalidate(queryClient);
      toast.success(translate("toast.palierCree"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateCommissionRule(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CommissionRulePayload>) => commissionRulesApi.update(id, payload),
    onSuccess: () => {
      invalidate(queryClient);
      toast.success(translate("toast.palierMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteCommissionRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => commissionRulesApi.remove(id),
    onSuccess: () => {
      invalidate(queryClient);
      toast.success(translate("toast.palierSupprime"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
