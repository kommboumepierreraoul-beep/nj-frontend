import type { Currency } from "@/modules/reference-data/types";

export type PurchaseOrderStatus = "DRAFT" | "SENT" | "CONFIRMED" | "IN_PRODUCTION" | "SHIPPED" | "RECEIVED" | "CANCELLED";

export interface PurchaseOrder {
  id: number;
  reference: string;
  supplier: { id: number; company_name: string };
  status: PurchaseOrderStatus;
  order_date: string;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  currency: Currency;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderListFilters {
  page?: number;
  per_page?: number;
  supplier_id?: number;
  status?: PurchaseOrderStatus;
}

export interface PurchaseOrderFormValues {
  reference?: string;
  supplier_id: number;
  status?: PurchaseOrderStatus;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  currency_id: number;
  notes?: string;
}

export interface PurchaseOrderItem {
  id: number;
  product_variant: { id: number; sku: string; name: string; product_id: number };
  quantity: number;
  unit_price: number;
  notes: string | null;
}

export interface PurchaseOrderItemPayload {
  product_variant_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
}
