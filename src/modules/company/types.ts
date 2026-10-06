/**
 * Types du module « Paramètres → Entreprise » (Doc/design_system_maquette_complete.md
 * § 5.10). Miroir direct des `CompanySettingsResource` / `CompanyPaymentMethodResource`
 * / `CurrencyResource` de nj-backend (API livrée le 2026-09-03).
 */

export type PaymentMethodType = "MOBILE_MONEY" | "BANK_TRANSFER" | "CASH" | "OTHER";

export interface CompanySettings {
  id: number;
  legal_name: string;
  tagline: string | null;
  address_line: string;
  representation_line: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  logo_path: string | null;
  logo_url: string | null;
  default_proforma_validity_days: number;
  /** Taux de TVA par défaut appliqué aux nouvelles commandes (Doc/tva_addendum.md). */
  default_tax_rate: number;
  default_proforma_conditions: string | null;
  default_proforma_production_delay: string | null;
  default_proforma_payment_terms: string | null;
  default_proforma_customs: string | null;
}

export interface CompanySettingsPayload {
  legal_name?: string;
  tagline?: string | null;
  address_line?: string;
  representation_line?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  default_proforma_validity_days?: number;
  default_tax_rate?: number;
  default_proforma_conditions?: string | null;
  default_proforma_production_delay?: string | null;
  default_proforma_payment_terms?: string | null;
  default_proforma_customs?: string | null;
}

export interface CompanyPaymentMethod {
  id: number;
  label: string;
  method_type: PaymentMethodType;
  account_number: string | null;
  account_holder: string | null;
  iban: string | null;
  swift: string | null;
  instructions: string | null;
  is_active: boolean;
  show_on_documents: boolean;
  sort_order: number;
}

export interface CompanyPaymentMethodPayload {
  label: string;
  method_type: PaymentMethodType;
  account_number?: string | null;
  account_holder?: string | null;
  iban?: string | null;
  swift?: string | null;
  instructions?: string | null;
  is_active?: boolean;
  show_on_documents?: boolean;
  sort_order?: number;
}

/** Devise vue depuis l'écran de gestion (avec le dernier taux connu). */
export interface AdminCurrency {
  id: number;
  code: string;
  name: string;
  symbol: string | null;
  is_default: boolean;
  is_active: boolean;
  latest_rate_to_xaf: string | null;
  latest_rate_effective_date: string | null;
}

export interface CurrencyPayload {
  code: string;
  name: string;
  symbol?: string | null;
  is_default?: boolean;
  is_active?: boolean;
}

export interface ExchangeRatePayload {
  rate_to_xaf: number;
  effective_date: string;
}
