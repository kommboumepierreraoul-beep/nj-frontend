/**
 * Cadence de rafraîchissement automatique du tableau de bord « temps réel »
 * (cahier des charges §2.3). Partagée par `useDashboardStats` et
 * `useDashboardOverview` pour que les 4 cartes KPI et les blocs du dessous se
 * réactualisent ensemble. 60 s : assez frais pour un poste de pilotage, sans
 * marteler l'API (les agrégats sont coûteux côté SQL).
 */
export const DASHBOARD_REFETCH_INTERVAL_MS = 60_000;
