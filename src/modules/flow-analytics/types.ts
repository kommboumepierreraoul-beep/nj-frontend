import type { PurchaseOrderStatus } from "@/modules/purchase-orders/types";
import type { SalesOrderStatus } from "@/modules/sales-orders/types";
import type { AuditEntityType } from "@/modules/audit/types";
import type { DashboardPeriod } from "@/modules/dashboard/types";

/**
 * Types du module Analyse des flux (Doc/spec_pages_analyse_flux.md). Réutilise
 * `DashboardPeriod` (même enum `period`/`date` que le Tableau de bord, § Conventions
 * générales) plutôt qu'un doublon local.
 */
export type FlowAnalyticsPeriod = DashboardPeriod;

export interface FlowAnalyticsFilters {
  period: FlowAnalyticsPeriod;
  date?: string;
}

export type FlowType = "ACHAT" | "VENTE" | "ACTIVITE";
export type ThresholdType = "DUREE_JOURS" | "COMPTEUR";
export type FlowExportFormat = "csv" | "pdf";
export type FlowReportKey = "purchase-flow" | "sales-flow" | "financial" | "activity-flow" | "bottlenecks";

/** § Onglet A — un goulot d'étranglement, déjà trié par sévérité décroissante côté API (ne jamais retrier côté interface). */
export interface Bottleneck {
  flow_type: FlowType;
  stage_code: string;
  label: string;
  valeur_observee: number;
  unite: "jours" | "occurrences";
  seuil: number;
  ecart: number;
}

export interface BottlenecksReport {
  goulots: Bottleneck[];
}

/** Objets à clés dynamiques (§ Point d'attention) : une étape sans transition sur la période n'apparaît pas du tout comme clé. */
export type PurchaseOrderStatusMap = Partial<Record<PurchaseOrderStatus, number>>;
export type SalesOrderStatusMap = Partial<Record<SalesOrderStatus, number>>;

export interface PurchaseFlowSupplierResponse {
  sollicitations: number;
  reponses: number;
  refus: number;
  expirees: number;
  taux_reponse_pourcentage: number;
  delai_moyen_reponse_jours: number | null;
}

export interface PurchaseFlowSupplierPerformance {
  supplier_id: number;
  company_name: string;
  sollicitations: number;
  reponses: number;
  taux_reponse_pourcentage: number;
}

export interface PurchaseFlowQuotes {
  total: number;
  selectionnes: number;
  taux_selection_pourcentage: number;
}

export interface PurchaseFlowCycle {
  commandes_receptionnees: number;
  delai_moyen_jours: number | null;
  livraisons_en_retard: number;
}

export interface PurchaseFlowRfq {
  total: number;
  annulees: number;
  expirees: number;
  /** RFQ de la période ayant abouti à ≥ 1 commande fournisseur liée (via purchase_orders.rfq_id, depuis 2026-09-03). */
  converties_en_commande: number;
  taux_transformation_pourcentage: number;
}

/** § Onglet B — `limite` doit être affiché à l'écran (bandeau discret), pas ignoré : limite de données réelle sur le lien RFQ → commande fournisseur. */
export interface PurchaseFlowReport {
  pipeline_actuel: PurchaseOrderStatusMap;
  reponse_fournisseur: PurchaseFlowSupplierResponse;
  performance_par_fournisseur: PurchaseFlowSupplierPerformance[];
  devis: PurchaseFlowQuotes;
  cycle_commande_fournisseur: PurchaseFlowCycle;
  rfq: PurchaseFlowRfq;
  temps_moyen_par_statut_jours: PurchaseOrderStatusMap;
  limite: string;
}

/** § Onglet C. */
export interface SalesFlowReport {
  pipeline_actuel: SalesOrderStatusMap;
  temps_moyen_par_statut_jours: SalesOrderStatusMap;
  abandons_par_etape: SalesOrderStatusMap;
  commandes_creees: number;
  atteintes_par_etape: SalesOrderStatusMap;
  delai_moyen_paiement_jours: number | null;
}

/** § Onglet D. */
export interface FinancialTreasury {
  encaisse: number;
  rembourse: number;
  net: number;
}

export interface FinancialExposure {
  commandes_en_attente: number;
  montant_en_attente: number;
  age_moyen_jours: number | null;
}

export interface FinancialCommission {
  realisee: number;
  theorique_sur_commandes_creees: number;
}

export interface FinancialCreditNotes {
  count: number;
  montant_total: number;
}

/** Marge estimée (Doc/analyse_flux_modele_donnees.md §4bis) — coût = dernier prix du fournisseur préféré converti en XAF, approximation assumée. */
export interface FinancialEstimatedMargin {
  ca_produits_estime: number;
  cout_achat_estime: number;
  marge_estimee: number;
  taux_marge_pourcentage: number;
  commandes_analysees: number;
  lignes_sans_cout_estime: number;
  methode: string;
}

export interface FinancialReport {
  tresorerie: FinancialTreasury;
  exposition: FinancialExposure;
  commission: FinancialCommission;
  avoirs: FinancialCreditNotes;
  marge_estimee: FinancialEstimatedMargin;
}

/** § Onglet E — réutilise le mapping `entity_type` → module et le dictionnaire `action` du module Audit plutôt que de les dupliquer. */
export interface ActivityByModule {
  entity_type: AuditEntityType;
  total: number;
}

export interface ActivityByUser {
  user_id: number;
  full_name: string;
  total: number;
}

export interface ActivityByAction {
  action: string;
  total: number;
}

export interface ActivityConnection {
  echecs_connexion: number;
  comptes_verrouilles: number;
  acces_refuses_permission: number;
  acces_refuses_role: number;
}

export interface ActivityFlowReport {
  actions_par_module: ActivityByModule[];
  actions_par_utilisateur: ActivityByUser[];
  actions_par_type: ActivityByAction[];
  connexion: ActivityConnection;
}

/** § Page 2 « Paramètres → Analyse des flux ». */
export interface FlowStageThreshold {
  id: number;
  flow_type: FlowType;
  stage_code: string;
  label: string;
  threshold_type: ThresholdType;
  threshold_value: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FlowStageThresholdListFilters {
  flow_type?: FlowType;
  is_active?: boolean;
}

/** `flow_type`/`stage_code` non modifiables après création (doublon `flow_type`+`stage_code` rejeté en 422). */
export interface FlowStageThresholdCreatePayload {
  flow_type: FlowType;
  stage_code: string;
  label: string;
  threshold_type: ThresholdType;
  threshold_value: number;
  is_active?: boolean;
  sort_order?: number;
}

export interface FlowStageThresholdUpdatePayload {
  label?: string;
  threshold_type?: ThresholdType;
  threshold_value?: number;
  is_active?: boolean;
  sort_order?: number;
}
