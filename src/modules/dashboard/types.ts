import type { SalesOrderClientSummary, SalesOrderPaymentStatus } from "@/modules/sales-orders/types";

/** Doc/spec_pages_dashboard.md § 1 — GET /dashboard/stats?period=&date= */
export type DashboardPeriod = "day" | "week" | "month";

export interface DashboardStatsFilters {
  period: DashboardPeriod;
  date?: string;
}

export interface DashboardActiveOrders {
  count: number;
  montant_total: number;
  commission_totale: number;
}

export interface DashboardRevenue {
  ca_encaisse: number;
  commission_realisee: number;
  nombre_encaissements: number;
  nombre_remboursements: number;
  commandes_actives: DashboardActiveOrders;
}

export interface DashboardPendingInvoicesSummary {
  count: number;
  en_retard: number;
  proche_echeance: number;
}

export interface DashboardConversionRate {
  taux_pourcentage: number;
  commandes_payees: number;
  commandes_non_annulees: number;
}

export interface DashboardProvenancePerformance {
  category_code: string | null;
  category_label: string;
  commandes_count: number;
  ca_total: number;
}

export interface DashboardStats {
  revenue: DashboardRevenue;
  factures_en_attente: DashboardPendingInvoicesSummary;
  taux_transformation: DashboardConversionRate;
  performance_par_provenance: DashboardProvenancePerformance[];
}

/**
 * Doc/spec_pages_dashboard.md § 3 — GET /dashboard/overview : tout ce qui se
 * trouve SOUS les 4 cartes KPI dans NJ Global Trade Dashboard.dc.html (rangées
 * 2 à 5). Volontairement sans paramètre de période — instantané « maintenant » /
 * tout-historique (voir Doc/dashboard_overview_addendum.md).
 */
export interface DashboardMonthlyPoint {
  mois: string;
  ca_engage: number;
  net_encaisse: number;
}

export interface DashboardMonthlyPerformance {
  mois: DashboardMonthlyPoint[];
  resume: {
    engage_6m: number;
    encaisse_6m: number;
    meilleur_mois: string | null;
    conversion_caisse_pourcentage: number;
  };
}

export interface DashboardRecoveryBucket {
  payment_status: SalesOrderPaymentStatus;
  count: number;
  montant: number;
  part_pourcentage: number;
}

export interface DashboardRecoveryQuality {
  ca_engage_total: number;
  net_encaisse_total: number;
  credite_avoir_total: number;
  taux_recouvre_pourcentage: number;
  buckets: DashboardRecoveryBucket[];
}

export interface DashboardVelocityStage {
  from_status: string;
  to_status: string;
  jours_moyen: number;
  commandes_count: number;
}

export interface DashboardLifecycleVelocity {
  total_jours: number;
  etapes: DashboardVelocityStage[];
}

export type DashboardPanelCode =
  | "pipeline_commercial"
  | "tresorerie"
  | "documents_emis"
  | "portefeuille_clients"
  | "catalogue"
  | "sourcing_fournisseurs"
  | "acces_tracabilite"
  | "configuration";

export type DashboardMetricTone = "accent" | "success" | "warning" | "danger";

export interface DashboardPanelMetric {
  code: string;
  valeur: number | string;
  unite?: string;
  ton?: DashboardMetricTone;
}

export interface DashboardPanelBar {
  code: string;
  valeur: number;
  montant?: number;
  pourcentage: number;
}

export interface DashboardModulePanel {
  code: DashboardPanelCode;
  metriques: DashboardPanelMetric[];
  barres: DashboardPanelBar[];
  pied?: Record<string, number> | null;
}

export interface DashboardFeedMovement {
  receipt_number: string | null;
  client_full_name: string | null;
  payment_method: string | null;
  direction: "ENCAISSEMENT" | "REMBOURSEMENT" | null;
  amount: number;
  currency: string | null;
  paid_at: string | null;
  is_voided: boolean;
  sales_order_id: number | null;
}

export interface DashboardFeedDocument {
  invoice_number: string | null;
  client_full_name: string | null;
  document_type: "PROFORMA" | "FACTURE" | "AVOIR" | "RECU" | null;
  version: number | null;
  status: string | null;
  total_amount: number;
  currency: string | null;
  issued_at: string | null;
  sales_order_id: number | null;
}

export interface DashboardFeeds {
  derniers_mouvements: DashboardFeedMovement[];
  derniers_documents: DashboardFeedDocument[];
}

export interface DashboardOverview {
  performance_mensuelle: DashboardMonthlyPerformance;
  qualite_recouvrement: DashboardRecoveryQuality;
  velocite_cycle_vie: DashboardLifecycleVelocity;
  panels: DashboardModulePanel[];
  feeds: DashboardFeeds;
  relances_count: number;
}

export type AlertLevel = "DEPASSEE" | "PROCHE" | null;

/** Doc/spec_pages_dashboard.md § 2 — GET /dashboard/pending-sales-orders, DashboardPendingSalesOrderResource */
export interface DashboardPendingSalesOrder {
  id: number;
  reference: string;
  client: SalesOrderClientSummary;
  total_amount: number;
  currency: string;
  payment_status: SalesOrderPaymentStatus;
  valid_until: string | null;
  jours_restants: number | null;
  niveau_alerte: AlertLevel;
}
