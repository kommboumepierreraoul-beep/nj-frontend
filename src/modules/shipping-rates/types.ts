/**
 * Doc/spec_pages_factures.md § 2 « Paramètres → Tarifs de transport » — grille
 * tarifaire de transport aérien/maritime utilisée pour l'estimation
 * logistique affichée sur le comparatif Proforma. Mêmes conventions d'écran
 * que Paramètres → Commissions (spec_pages_commandes.md § 3).
 */
export type ShippingMode = "AERIEN" | "MARITIME";

export interface ShippingRate {
  id: number;
  mode: ShippingMode;
  min_quantity: number;
  max_quantity: number | null;
  rate: number;
  unit: string;
  lead_time_label: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ShippingRatePayload {
  mode: ShippingMode;
  min_quantity: number;
  max_quantity?: number;
  rate: number;
  unit: string;
  lead_time_label: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface ShippingRateListFilters {
  mode?: ShippingMode;
  is_active?: boolean;
}
