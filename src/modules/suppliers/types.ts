import type { Country, Currency } from "@/modules/reference-data/types";

export type SupplierReliability = "INCONNU" | "FAIBLE" | "MOYEN" | "BON" | "EXCELLENT";
export type SupplierVerificationMethod = "FACTORY_VISIT" | "VIDEO_CALL" | "THIRD_PARTY_AUDIT" | "DOCUMENTS_ONLY";
export type SupplierPaymentMethod = "ALIPAY" | "WECHAT_PAY" | "BANK_TRANSFER_CNY" | "WESTERN_UNION" | "CASH_CHINA" | "OTHER";
export type SupplierDocumentType = "BUSINESS_LICENSE" | "CERTIFICATE_ISO" | "CERTIFICATE_BSCI" | "FACTORY_AUDIT_REPORT" | "OTHER";
export type CommunicationChannel = "WECHAT" | "ALIBABA" | "WHATSAPP" | "EMAIL" | "PHONE" | "IN_PERSON" | "OTHER";
export type CommunicationDirection = "INCOMING" | "OUTGOING";

export interface Supplier {
  id: number;
  company_name: string;
  legal_name: string | null;
  contact_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  wechat_id: string | null;
  alibaba_profile_url: string | null;
  email: string | null;
  website: string | null;
  province: string | null;
  city: string | null;
  address_line: string | null;
  country: Country | null;
  reliability: SupplierReliability;
  reliability_score: number | null;
  payment_terms: string | null;
  notes: string | null;
  is_active: boolean;
  is_blacklisted: boolean;
  blacklist_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierListFilters {
  page?: number;
  per_page?: number;
  is_active?: boolean;
  is_blacklisted?: boolean;
  reliability?: SupplierReliability;
  category_id?: number;
  search?: string;
}

export interface SupplierFormValues {
  company_name: string;
  legal_name?: string;
  contact_name?: string;
  phone?: string;
  whatsapp?: string;
  wechat_id?: string;
  alibaba_profile_url?: string;
  email?: string;
  website?: string;
  province?: string;
  city?: string;
  address_line?: string;
  country_id?: number;
  reliability?: SupplierReliability;
  payment_terms?: string;
  notes?: string;
  is_active?: boolean;
}

export interface VerifySupplierPayload {
  verification_method: SupplierVerificationMethod;
}

export interface BlacklistSupplierPayload {
  is_blacklisted: boolean;
  blacklist_reason?: string;
}

export interface SupplierContact {
  id: number;
  full_name: string;
  role_title: string | null;
  phone: string | null;
  wechat_id: string | null;
  email: string | null;
  is_primary: boolean;
  notes: string | null;
}

export interface SupplierContactPayload {
  full_name: string;
  role_title?: string;
  phone?: string;
  wechat_id?: string;
  email?: string;
  is_primary?: boolean;
  notes?: string;
}

export interface SupplierBankAccount {
  id: number;
  method: SupplierPaymentMethod;
  account_name: string;
  account_number: string;
  bank_name: string | null;
  swift_code: string | null;
  currency: Currency;
  is_default: boolean;
  is_active: boolean;
}

export interface SupplierBankAccountPayload {
  method: SupplierPaymentMethod;
  account_name: string;
  account_number: string;
  bank_name?: string;
  swift_code?: string;
  currency_id: number;
  is_default?: boolean;
  is_active?: boolean;
}

export interface SupplierDocument {
  id: number;
  type: SupplierDocumentType;
  attachment: { id: number; file_name: string; url: string };
  issue_date: string | null;
  expiry_date: string | null;
  is_verified: boolean;
  notes: string | null;
}

export interface SupplierDocumentPayload {
  type: SupplierDocumentType;
  attachment_id: number;
  issue_date?: string;
  expiry_date?: string;
  is_verified?: boolean;
  notes?: string;
}

export interface SupplierEvaluation {
  id: number;
  purchase_order: { id: number; reference: string } | null;
  quality_score: number;
  communication_score: number;
  delay_respect_score: number;
  price_competitiveness_score: number;
  overall_score: number;
  comment: string | null;
  evaluated_at: string;
}

export interface SupplierEvaluationPayload {
  purchase_order_id?: number;
  quality_score: number;
  communication_score: number;
  delay_respect_score: number;
  price_competitiveness_score: number;
  comment?: string;
  evaluated_at: string;
}

export interface SupplierCommunicationLog {
  id: number;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject: string | null;
  summary: string;
  attachment: { id: number; file_name: string; url: string } | null;
  occurred_at: string;
}

export interface SupplierCommunicationLogPayload {
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject?: string;
  summary: string;
  attachment_id?: number;
  occurred_at: string;
}
