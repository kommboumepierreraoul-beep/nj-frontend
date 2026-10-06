import type { Currency } from "@/modules/reference-data/types";
import type { BillingMode } from "@/modules/clients/types";

/**
 * Types du module Commandes clients (Doc/spec_pages_commandes.md). Amorcé
 * avec les enums/résumés réutilisés par le Dashboard ; complété ici avec la
 * fiche commande complète (§2) : lignes, paiements, historique de statut.
 * `BillingMode` est importé du module Clients (même énumération, cf. spec
 * § « Section Commande » : `billing_mode` surcharge ponctuellement le mode
 * par défaut du client).
 */
export type SalesOrderType = "PRODUIT_UNIQUE_MULTI_CHOIX" | "MULTI_PRODUITS" | "PRESTATION_SERVICE";

export type SalesOrderStatus =
  | "BROUILLON"
  | "PROFORMA_ENVOYEE"
  | "CONFIRMEE"
  | "EN_PREPARATION"
  | "EXPEDIEE"
  | "LIVREE"
  | "CLOTUREE"
  | "ANNULEE";

export type SalesOrderPaymentStatus = "NON_PAYEE" | "PARTIELLEMENT_PAYEE" | "PAYEE";

export type TransportMode = "AERIEN_STANDARD" | "AERIEN_SENSIBLE" | "MARITIME" | "NON_APPLICABLE";

export type SalesOrderPaymentMethod = "ORANGE_MONEY" | "VIREMENT_UBA" | "WAVE" | "MTN_MOMO" | "ESPECES" | "AUTRE";

export type PaymentDirection = "ENCAISSEMENT" | "REMBOURSEMENT";

export type SalesOrderItemType = "PRODUIT" | "SERVICE";

export type CommissionType = "POURCENTAGE" | "FORFAIT";

export interface ClientCategorySummary {
  code: string;
  label: string;
  badge_color: string | null;
  badge_image_path: string | null;
}

export interface SalesOrderClientSummary {
  id: number;
  full_name: string;
  category: ClientCategorySummary | null;
}

/** Barème appliqué et figé à la création (§ « Éléments distinctifs » — jamais recalculé). */
export interface CommissionRuleSummary {
  id: number;
  label: string;
}

export interface SalesOrderItem {
  id: number;
  item_type: SalesOrderItemType;
  product_variant: { id: number; sku: string; name: string; level: string | null } | null;
  label: string | null;
  description: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  is_proposed_option: boolean;
  is_selected: boolean;
  sourced_purchase_order_item_id: number | null;
  estimated_weight_kg: number | null;
  estimated_volume_cbm: number | null;
  notes: string | null;
  sort_order: number;
}

/** § 1 « Section Lignes » — création imbriquée en même temps que la commande, ou ajout ultérieur via l'onglet Lignes (§2). */
export interface SalesOrderItemPayload {
  item_type: SalesOrderItemType;
  product_variant_id?: number;
  label?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  is_proposed_option?: boolean;
  is_selected?: boolean;
  sourced_purchase_order_item_id?: number;
  estimated_weight_kg?: number;
  estimated_volume_cbm?: number;
  notes?: string;
  sort_order?: number;
}

/** § 2 « Modifier une ligne » — `item_type`/`product_variant_id` non modifiables après création. */
export interface SalesOrderItemUpdatePayload {
  quantity?: number;
  unit_price?: number;
  discount_amount?: number;
  is_selected?: boolean;
  notes?: string;
  sort_order?: number;
}

export interface SalesOrder {
  id: number;
  reference: string;
  client: SalesOrderClientSummary;
  type: SalesOrderType;
  status: SalesOrderStatus;
  payment_status: SalesOrderPaymentStatus;
  currency: Currency;
  billing_mode: BillingMode;
  subtotal_amount: number;
  discount_amount: number;
  commission_rule: CommissionRuleSummary | null;
  commission_type: CommissionType | null;
  commission_rate_applied: number | null;
  commission_amount: number | null;
  /** TVA (Doc/tva_addendum.md) — `tax_rate` null = aucune TVA ; `total_amount` inclut `tax_amount`. */
  tax_rate: number | null;
  tax_amount: number;
  total_amount: number;
  /** Cumul des avoirs émis (Doc/spec_pages_factures.md § « Éléments distinctifs ») — déduit du solde restant dû, peut à lui seul faire passer `payment_status` à `PAYEE` sans encaissement. */
  credited_amount: number;
  transport_mode: TransportMode;
  carrier_name: string | null;
  tracking_number: string | null;
  estimated_weight_kg: number | null;
  estimated_volume_cbm: number | null;
  actual_weight_kg: number | null;
  actual_volume_cbm: number | null;
  order_date: string;
  validity_days: number | null;
  valid_until: string | null;
  notes: string | null;
  internal_notes: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  closed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  items?: SalesOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface SalesOrderListFilters {
  page?: number;
  per_page?: number;
  client_id?: number;
  status?: SalesOrderStatus;
  payment_status?: SalesOrderPaymentStatus;
  type?: SalesOrderType;
}

/** § 1 « Formulaire Nouvelle commande » — commande + lignes créées en une seule fois. */
export interface SalesOrderCreatePayload {
  client_id: number;
  type: SalesOrderType;
  currency_id: number;
  billing_mode?: BillingMode;
  discount_amount?: number;
  transport_mode?: TransportMode;
  carrier_name?: string;
  tracking_number?: string;
  order_date: string;
  validity_days?: number;
  notes?: string;
  internal_notes?: string;
  /** TVA (Doc/tva_addendum.md) — omis => défaut société, 0 => aucune TVA. */
  tax_rate?: number;
  items: SalesOrderItemPayload[];
}

/** § 1 « Formulaire Modifier la commande » — champs logistiques uniquement, montants/lignes gérés depuis la fiche (§2). */
export interface SalesOrderUpdatePayload {
  billing_mode?: BillingMode;
  transport_mode?: TransportMode;
  estimated_weight_kg?: number;
  estimated_volume_cbm?: number;
  actual_weight_kg?: number;
  actual_volume_cbm?: number;
  carrier_name?: string;
  tracking_number?: string;
  notes?: string;
  internal_notes?: string;
  /** TVA (Doc/tva_addendum.md) — recalcule tax_amount/total_amount sur le snapshot de montants courant. */
  tax_rate?: number;
}

export interface ChangeStatusPayload {
  status: SalesOrderStatus;
  reason?: string;
}

export interface SalesOrderStatusHistoryEntry {
  id: number;
  previous_status: SalesOrderStatus | null;
  new_status: SalesOrderStatus;
  reason: string | null;
  changed_by: { id: number; name: string } | null;
  created_at: string;
}

export interface SalesOrderPayment {
  id: number;
  direction: PaymentDirection;
  amount: number;
  currency: Currency;
  payment_method: SalesOrderPaymentMethod;
  invoice_id: number | null;
  external_reference: string | null;
  receipt_number: string;
  paid_at: string;
  is_voided: boolean;
  voided_reason: string | null;
  notes: string | null;
  created_at: string;
}

/** Contexte commande/client, présent uniquement sur le registre transverse (§ ci-dessous). */
export interface SalesOrderPaymentOrderSummary {
  id: number;
  reference: string;
  client: { id: number; full_name: string } | null;
}

export interface SalesOrderPaymentWithOrder extends SalesOrderPayment {
  sales_order: SalesOrderPaymentOrderSummary;
}

/**
 * Doc/design_system_maquette_complete.md § 6.2 « Paiements (registre transverse) » —
 * GET /sales-order-payments, seul endpoint qui agrège les mouvements de toutes les
 * commandes (les autres routes de paiement restent rattachées à une commande ou un
 * document précis).
 */
export interface SalesOrderPaymentListFilters {
  page?: number;
  per_page?: number;
  direction?: PaymentDirection;
  payment_method?: SalesOrderPaymentMethod;
  is_voided?: boolean;
  client_id?: number;
  currency_id?: number;
  search?: string;
  paid_from?: string;
  paid_to?: string;
}

/** Un total par devise — jamais toutes devises confondues (cf. commentaire backend). */
export interface SalesOrderPaymentCurrencyTotal {
  currency_id: number;
  currency_code: string;
  gross_collected: number;
  total_refunded: number;
  net: number;
}

export interface SalesOrderPaymentRegistryMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  totals_by_currency: SalesOrderPaymentCurrencyTotal[];
}

export interface SalesOrderPaymentRegistryResponse {
  data: SalesOrderPaymentWithOrder[];
  meta: SalesOrderPaymentRegistryMeta;
}

/** § « Onglet Paiements » — sert aussi bien à un `ENCAISSEMENT` qu'à un `REMBOURSEMENT` (maj 2026-08-18). */
export interface RecordPaymentPayload {
  direction?: PaymentDirection;
  amount: number;
  currency_id: number;
  payment_method: SalesOrderPaymentMethod;
  invoice_id?: number;
  external_reference?: string;
  paid_at: string;
  notes?: string;
}

export interface VoidPaymentPayload {
  voided_reason: string;
}
