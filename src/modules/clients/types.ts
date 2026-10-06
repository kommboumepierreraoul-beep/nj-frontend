import type { Country, Currency, Tag } from "@/modules/reference-data/types";

export interface ClientCategory {
  id: number;
  code: string;
  label: string;
  badge_color: string | null;
  /** Chemin relatif au disque `public` — jamais une URL absolue. Résoudre avec `storageUrl()` (`@/lib/media`). */
  badge_image_path: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  clients_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateClientCategoryPayload {
  code: string;
  label: string;
  badge_color?: string;
  /** Fichier téléversé (§ demande frontend : plus de saisie manuelle d'URL) — `badge_image_path` est calculé côté backend à partir de ce fichier, jamais saisi par l'utilisateur. */
  badge_image?: File;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateClientCategoryPayload extends Partial<Omit<CreateClientCategoryPayload, "code" | "label">> {
  code?: string;
  label?: string;
  /** Retire le logo existant sans en reteleverser un autre. */
  remove_badge_image?: boolean;
}

export interface ContactChannelType {
  id: number;
  code: string;
  label: string;
  icon: string | null;
  is_active: boolean;
  contacts_count?: number;
}

export interface CreateContactChannelPayload {
  code: string;
  label: string;
  icon?: string;
  is_active?: boolean;
}

export type UpdateContactChannelPayload = Partial<CreateContactChannelPayload>;

export type ClientType = "PARTICULIER" | "ENTREPRISE";
export type ClientStatus = "ACTIF" | "INACTIF" | "VIP" | "BLOQUE";
export type ValueSegment = "BRONZE" | "ARGENT" | "PLATINE" | "VIP";
export type BillingMode = "COMMISSION_VISIBLE" | "PRIX_GLOBAL";
export type ClientLanguage = "FR" | "EN";

export interface ClientContact {
  id: number;
  channel_type: ContactChannelType;
  value: string;
  label: string | null;
  is_preferred: boolean;
}

export interface Client {
  id: number;
  client_type: ClientType;
  full_name: string;
  legal_name: string | null;
  category: ClientCategory | null;
  country: Country | null;
  city: string | null;
  region: string | null;
  address_line: string | null;
  preferred_currency: Currency | null;
  preferred_language: ClientLanguage;
  referred_by_client: { id: number; full_name: string } | null;
  billing_mode: BillingMode;
  has_custom_commission: boolean;
  custom_commission_rate: number | null;
  proforma_validity_days: number | null;
  status: ClientStatus;
  value_segment: ValueSegment;
  internal_notes: string | null;
  preferred_contact: ClientContact | null;
  contacts?: ClientContact[];
  tags?: Tag[];
  created_at: string;
  updated_at: string;
}

export interface ClientListFilters {
  page?: number;
  per_page?: number;
  category_id?: number;
  status?: ClientStatus;
  client_type?: ClientType;
  value_segment?: ValueSegment;
  search?: string;
}

export interface ClientFormValues {
  client_type: ClientType;
  full_name: string;
  legal_name?: string;
  category_id?: number;
  country_id?: number;
  city?: string;
  region?: string;
  address_line?: string;
  preferred_currency_id?: number;
  preferred_language: ClientLanguage;
  referred_by_client_id?: number;
  billing_mode: BillingMode;
  has_custom_commission: boolean;
  custom_commission_rate?: number;
  proforma_validity_days?: number;
  status: ClientStatus;
  internal_notes?: string;
}

export interface CreateContactPayload {
  channel_type_id: number;
  value: string;
  label?: string;
  is_preferred?: boolean;
}

export type UpdateContactPayload = Partial<CreateContactPayload>;
