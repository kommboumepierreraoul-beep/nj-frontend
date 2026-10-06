import type { Currency } from "@/modules/reference-data/types";

export type RfqStatus = "BROUILLON" | "ENVOYE" | "REPONDU" | "EXPIRE" | "ANNULE";
export type RfqSupplierStatus = "PENDING" | "RESPONDED" | "DECLINED" | "EXPIRED";

export interface Rfq {
  id: number;
  reference: string;
  status: RfqStatus;
  request_date: string;
  expected_response_date: string | null;
  notes: string | null;
  items_count?: number;
  suppliers_count?: number;
  created_at: string;
  updated_at: string;
}

export interface RfqListFilters {
  page?: number;
  per_page?: number;
  status?: RfqStatus;
}

export interface RfqFormValues {
  reference?: string;
  status?: RfqStatus;
  request_date: string;
  expected_response_date?: string;
  notes?: string;
}

export interface RfqItem {
  id: number;
  product: { id: number; name: string; reference: string } | null;
  custom_description: string | null;
  target_quantity: number;
  target_unit: { id: number; name: string } | null;
  target_price: number | null;
  notes: string | null;
}

export interface RfqItemPayload {
  product_id?: number;
  custom_description?: string;
  target_quantity: number;
  target_unit_id?: number;
  target_price?: number;
  notes?: string;
}

export interface RfqSupplierQuote {
  id: number;
  rfq_item: { id: number; product: { name: string } | null; custom_description: string | null };
  quoted_unit_price: number;
  currency: Currency;
  quoted_moq: number | null;
  quoted_lead_time_days: number | null;
  notes: string | null;
  quoted_at: string;
  is_selected: boolean;
}

export interface RfqSupplierQuotePayload {
  rfq_item_id: number;
  quoted_unit_price: number;
  currency_id: number;
  quoted_moq?: number;
  quoted_lead_time_days?: number;
  notes?: string;
  quoted_at: string;
}

export interface RfqSupplier {
  id: number;
  supplier: { id: number; company_name: string };
  status: RfqSupplierStatus;
  sent_at: string | null;
  response_date: string | null;
  notes: string | null;
  quotes?: RfqSupplierQuote[];
}

export interface RfqSupplierPayload {
  supplier_id: number;
  status?: RfqSupplierStatus;
  sent_at?: string;
  response_date?: string;
  notes?: string;
}
