"use client";

import { useQuery } from "@tanstack/react-query";
import { commissionRulesApi } from "../api/commission-rules.api";

export function useCommissionRules() {
  return useQuery({
    queryKey: ["commission-rules", "list"],
    queryFn: () => commissionRulesApi.list(),
    select: (data) => data.data,
  });
}
