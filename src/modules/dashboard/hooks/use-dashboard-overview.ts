"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import { DASHBOARD_REFETCH_INTERVAL_MS } from "./dashboard-refresh";

/**
 * Blocs complémentaires du tableau de bord (NJ Global Trade Dashboard.dc.html,
 * rangées 2 à 5). Aucun filtre : l'endpoint est un instantané « maintenant » /
 * tout-historique, indépendant du sélecteur période/date de la page.
 *
 * Données « temps réel » (cahier des charges §2.3) : on réactive localement le
 * rafraîchissement au focus et on ajoute un intervalle de re-fetch — le défaut
 * `createQueryClient()` les laisse volontairement désactivés pour le reste du
 * back-office (voir le commentaire de src/config/query-client.ts).
 */
export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => dashboardApi.overview(),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}
