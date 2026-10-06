import type { Country, Currency, Tag, Unit } from "@/modules/reference-data/types";
import type { Attachment } from "@/modules/attachments/types";

export interface ProductCategory {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  /** Chemin relatif au disque `public` — jamais une URL absolue. Résoudre avec `storageUrl()` (`@/lib/media`). */
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
  /** Présents lorsque la relation a été chargée côté backend (voir `ProductCategoryController::show`) — utilisés par l'arbre déplié du sélecteur de catégorie. */
  parent?: ProductCategory | null;
  children?: ProductCategory[];
  children_count?: number;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductCategoryPayload {
  parent_id?: number;
  name: string;
  slug: string;
  description?: string;
  /** Fichier téléversé (§ demande frontend : plus de saisie manuelle d'URL) — `image_path` est calculé côté backend à partir de ce fichier, jamais saisi par l'utilisateur. */
  image?: File;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateProductCategoryPayload extends Partial<Omit<CreateProductCategoryPayload, "name" | "slug">> {
  name?: string;
  slug?: string;
  /** Retire le logo existant sans en reteleverser un autre. */
  remove_image?: boolean;
}

export type ProductStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type VariantLevel = "PREMIER_CHOIX" | "DEUXIEME_CHOIX" | "TROISIEME_CHOIX" | "STANDARD";
export type AttributeInputType = "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN" | "COLOR";
export type PriceSource = "MANUAL" | "RFQ" | "SUPPLIER_UPDATE" | "INVOICE";

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  barcode: string | null;
  name: string;
  level: VariantLevel;
  description: string | null;
  /** Arguments repris automatiquement dans la proforma comparative (Doc/proforma_comparatif_addendum.md). */
  proforma_strengths: string[];
  proforma_weaknesses: string[];
  proforma_recommendation: string | null;
  purchase_price: number;
  purchase_currency: Currency;
  sale_price: number | null;
  sale_currency: Currency | null;
  margin_amount: number | null;
  margin_rate: number | null;
  estimated_weight_kg: number | null;
  estimated_volume_cbm: number | null;
  moq: number | null;
  is_recommended: boolean;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  category: ProductCategory | null;
  reference: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
  is_sensitive: boolean;
  sensitivity_reason: string | null;
  default_unit: Unit | null;
  default_weight_kg: number | null;
  default_volume_cbm: number | null;
  min_order_quantity: number | null;
  brand: string | null;
  country_of_origin: Country | null;
  variants_count?: number;
  /**
   * Présent seulement lorsque la relation a été chargée côté backend
   * (`ProductController::index`/`show` chargent tous deux `attachments` —
   * voir commentaire dans le contrôleur). Dériver le visuel principal avec
   * `getPrimaryImage()` (`@/modules/products/utils`) plutôt qu'un champ
   * précalculé `primary_image_url`, qui n'existe pas côté API.
   */
  attachments?: Attachment[];
  tags?: Tag[];
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface ProductListFilters {
  page?: number;
  per_page?: number;
  category_id?: number;
  status?: ProductStatus;
  is_sensitive?: boolean;
  search?: string;
}

export interface ProductFormValues {
  category_id?: number;
  reference: string;
  name: string;
  slug: string;
  description?: string;
  status: ProductStatus;
  is_sensitive: boolean;
  sensitivity_reason?: string;
  default_unit_id?: number;
  default_weight_kg?: number;
  default_volume_cbm?: number;
  min_order_quantity?: number;
  brand?: string;
  country_of_origin_id?: number;
}

export interface VariantFormValues {
  sku: string;
  barcode?: string;
  name: string;
  level: VariantLevel;
  description?: string;
  proforma_strengths?: string[];
  proforma_weaknesses?: string[];
  proforma_recommendation?: string;
  purchase_price: number;
  purchase_currency_id: number;
  sale_price?: number;
  sale_currency_id?: number;
  margin_amount?: number;
  margin_rate?: number;
  estimated_weight_kg?: number;
  estimated_volume_cbm?: number;
  moq?: number;
  is_recommended: boolean;
  is_default: boolean;
  is_active: boolean;
  sort_order?: number;
}

export interface ProductAttributeValue {
  id: number;
  value: string;
  sort_order: number;
}

export interface ProductAttribute {
  id: number;
  name: string;
  code: string;
  input_type: AttributeInputType;
  unit_suffix: string | null;
  is_filterable: boolean;
  values?: ProductAttributeValue[];
}

export interface CreateProductAttributePayload {
  name: string;
  code: string;
  input_type: AttributeInputType;
  unit_suffix?: string;
  is_filterable?: boolean;
}

export type UpdateProductAttributePayload = Partial<CreateProductAttributePayload>;

export interface VariantAttributeValue {
  id: number;
  product_attribute: ProductAttribute;
  product_attribute_value: ProductAttributeValue | null;
  custom_value: string | null;
}

export interface AssignVariantAttributePayload {
  product_attribute_id: number;
  product_attribute_value_id?: number;
  custom_value?: string;
}

export interface VariantSupplierLink {
  id: number;
  supplier: { id: number; name: string };
  supplier_sku: string | null;
  unit_price: number;
  currency: Currency;
  moq: number | null;
  lead_time_days: number | null;
  is_preferred: boolean;
  last_quoted_at: string | null;
  notes: string | null;
}

export interface LinkVariantSupplierPayload {
  supplier_id: number;
  supplier_sku?: string;
  unit_price: number;
  currency_id: number;
  moq?: number;
  lead_time_days?: number;
  is_preferred?: boolean;
  last_quoted_at?: string;
  notes?: string;
}

export interface VariantPriceHistoryEntry {
  id: number;
  supplier: { id: number; name: string } | null;
  price: number;
  currency: Currency;
  source: PriceSource;
  effective_date: string;
  created_at: string;
}

export interface RecordVariantPricePayload {
  supplier_id?: number;
  price: number;
  currency_id: number;
  source: PriceSource;
  effective_date: string;
}
