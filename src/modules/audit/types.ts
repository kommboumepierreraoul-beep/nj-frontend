/**
 * Types du module Journal d'activité (Doc/spec_pages_audit.md). Remplace la
 * section 6 (obsolète) de spec_pages_utilisateurs.md — journal transversal à
 * tous les modules métier, immuable, lecture seule (`audit_logs.view`).
 */
export type AuditEntityType =
  | "User"
  | "SalesOrder"
  | "CommissionRule"
  | "ShippingRate"
  | "Invoice"
  | "ProductCategory"
  | "Product"
  | "ProductAttribute"
  | "ProductAttributeValue"
  | "ProductVariant"
  | "ProductVariantAttributeValue"
  | "ProductSupplier"
  | "ProductPriceHistory"
  | "Tag"
  | "Supplier"
  | "SupplierContact"
  | "SupplierBankAccount"
  | "SupplierDocument"
  | "SupplierEvaluation"
  | "SupplierCommunicationLog"
  | "Rfq"
  | "RfqItem"
  | "RfqSupplier"
  | "RfqSupplierQuote"
  | "PurchaseOrder"
  | "PurchaseOrderItem"
  | "ClientCategory"
  | "ClientContact"
  | "Client"
  | "ContactChannelType"
  | "Attachment";

/** § 1.1 « Table de correspondance entity_type → Module » — regroupement purement côté interface, jamais envoyé tel quel à l'API. */
export type AuditModule = "users" | "sales_orders" | "invoices" | "products" | "suppliers" | "clients" | "attachments";

export interface AuditLogActor {
  id: number;
  full_name: string;
  email: string;
}

export interface AuditLog {
  id: number;
  actor: AuditLogActor | null;
  entity_type: AuditEntityType;
  entity_id: number;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogListFilters {
  page?: number;
  per_page?: number;
  entity_type?: AuditEntityType;
  entity_id?: number;
  actor_user_id?: number;
  action?: string;
  from?: string;
  to?: string;
}
