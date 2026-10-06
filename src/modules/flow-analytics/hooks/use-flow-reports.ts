"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { flowAnalyticsApi } from "../api/flow-analytics.api";
import type { FlowAnalyticsFilters } from "../types";

/** Un hook par onglet (§ Structure « chacun adossé à son propre endpoint ») — chargé uniquement quand l'onglet correspondant est actif (`enabled`), pour ne pas tirer les 5 rapports à l'ouverture de la page. */
export function useBottlenecks(filters: FlowAnalyticsFilters, enabled: boolean) {
  return useQuery({ queryKey: ["flow-analytics", "bottlenecks", filters], queryFn: () => flowAnalyticsApi.bottlenecks(filters), enabled, placeholderData: keepPreviousData });
}

export function usePurchaseFlow(filters: FlowAnalyticsFilters, enabled: boolean) {
  return useQuery({ queryKey: ["flow-analytics", "purchase-flow", filters], queryFn: () => flowAnalyticsApi.purchaseFlow(filters), enabled, placeholderData: keepPreviousData });
}

export function useSalesFlow(filters: FlowAnalyticsFilters, enabled: boolean) {
  return useQuery({ queryKey: ["flow-analytics", "sales-flow", filters], queryFn: () => flowAnalyticsApi.salesFlow(filters), enabled, placeholderData: keepPreviousData });
}

export function useFinancialFlow(filters: FlowAnalyticsFilters, enabled: boolean) {
  return useQuery({ queryKey: ["flow-analytics", "financial", filters], queryFn: () => flowAnalyticsApi.financial(filters), enabled, placeholderData: keepPreviousData });
}

export function useActivityFlow(filters: FlowAnalyticsFilters, enabled: boolean) {
  return useQuery({ queryKey: ["flow-analytics", "activity-flow", filters], queryFn: () => flowAnalyticsApi.activityFlow(filters), enabled, placeholderData: keepPreviousData });
}
