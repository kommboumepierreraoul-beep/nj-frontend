"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { flowStageThresholdsApi } from "../api/flow-stage-thresholds.api";
import { ApiError } from "@/lib/http/api-error";
import type { FlowStageThresholdCreatePayload, FlowStageThresholdUpdatePayload } from "../types";
import { translate } from "@/i18n/translate";

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["flow-stage-thresholds", "list"] });
  queryClient.invalidateQueries({ queryKey: ["flow-analytics", "bottlenecks"] });
}

export function useCreateFlowStageThreshold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FlowStageThresholdCreatePayload) => flowStageThresholdsApi.create(payload),
    onSuccess: () => {
      invalidate(queryClient);
      toast.success(translate("toast.seuilCree"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateFlowStageThreshold(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FlowStageThresholdUpdatePayload) => flowStageThresholdsApi.update(id, payload),
    onSuccess: () => {
      invalidate(queryClient);
      toast.success(translate("toast.seuilMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteFlowStageThreshold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => flowStageThresholdsApi.remove(id),
    onSuccess: () => {
      invalidate(queryClient);
      toast.success(translate("toast.seuilSupprime"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
