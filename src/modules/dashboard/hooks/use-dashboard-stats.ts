"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import type { DashboardStatsFilters } from "../types";
import { DASHBOARD_REFETCH_INTERVAL_MS } from "./dashboard-refresh";

/**
 * 4 cartes KPI (Doc/spec_pages_dashboard.md § 1). Rafraîchissement automatique
 * activé (focus + intervalle) : tableau de bord « temps réel » du cahier des
 * charges §2.3, alignée sur `useDashboardOverview` — le défaut global
 * `createQueryClient()` garde ces options désactivées pour le reste de l'app.
 */
export function useDashboardStats(filters: DashboardStatsFilters) {
  return useQuery({
    queryKey: ["dashboard", "stats", filters],
    queryFn: () => dashboardApi.stats(filters),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}
