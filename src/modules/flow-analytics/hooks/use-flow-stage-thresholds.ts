"use client";

import { useQuery } from "@tanstack/react-query";
import { flowStageThresholdsApi } from "../api/flow-stage-thresholds.api";
import type { FlowStageThresholdListFilters } from "../types";

export function useFlowStageThresholds(filters: FlowStageThresholdListFilters) {
  return useQuery({
    queryKey: ["flow-stage-thresholds", "list", filters],
    queryFn: () => flowStageThresholdsApi.list(filters),
    select: (data) => data.data,
  });
}
