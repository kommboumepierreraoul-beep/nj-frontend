import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiCollection, ApiMessage } from "@/types/api";
import type {
  AssignVariantAttributePayload,
  CreateProductAttributePayload,
  CreateProductCategoryPayload,
  LinkVariantSupplierPayload,
  Product,
  ProductAttribute,
  ProductAttributeValue,
  ProductCategory,
  ProductFormValues,
  ProductListFilters,
  ProductVariant,
  RecordVariantPricePayload,
  UpdateProductAttributePayload,
  UpdateProductCategoryPayload,
  VariantAttributeValue,
  VariantFormValues,
  VariantPriceHistoryEntry,
  VariantSupplierLink,
} from "../types";

/**
 * Le logo est un fichier téléversé, pas une chaîne (§ demande frontend :
 * plus de saisie manuelle d'URL) — la création et la mise à jour d'une
 * catégorie passent donc toujours en `multipart/form-data`, même sans
 * fichier, pour rester cohérentes avec `ProductCategoryController::store/update`
 * (nj-backend), qui valide `image` comme un fichier optionnel.
 */
function categoryFormData(payload: CreateProductCategoryPayload | UpdateProductCategoryPayload): FormData {
  const formData = new FormData();
  if (payload.parent_id !== undefined) formData.set("parent_id", String(payload.parent_id));
  if (payload.name !== undefined) formData.set("name", payload.name);
  if (payload.slug !== undefined) formData.set("slug", payload.slug);
  if (payload.description !== undefined) formData.set("description", payload.description);
  if (payload.sort_order !== undefined) formData.set("sort_order", String(payload.sort_order));
  if (payload.is_active !== undefined) formData.set("is_active", payload.is_active ? "1" : "0");
  if (payload.image) formData.set("image", payload.image);
  if ((payload as UpdateProductCategoryPayload).remove_image) formData.set("remove_image", "1");
  return formData;
}

export const productCategoriesApi = {
  list: () => apiClient.get<{ data: ProductCategory[] }>(endpoints.products.categories),
  create: (payload: CreateProductCategoryPayload) =>
    apiClient.postForm<{ data: ProductCategory }>(endpoints.products.categories, categoryFormData(payload)),
  update: (id: number, payload: UpdateProductCategoryPayload) => {
    // PHP ne peuple $_FILES que pour une requête POST multipart : on "spoof"
    // donc un PUT via `_method` (mécanisme natif Laravel) plutôt que
    // `apiClient.put`, qui enverrait un vrai PUT dont le corps multipart ne
    // serait pas parsé côté serveur (route réelle : `Route::put(...)`, voir
    // routes/product/product.php).
    const formData = categoryFormData(payload);
    formData.set("_method", "PUT");
    return apiClient.postForm<{ data: ProductCategory }>(endpoints.products.categoryDetail(id), formData);
  },
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.products.categoryDetail(id)),
};

export const productsApi = {
  list: (filters: ProductListFilters) => apiClient.get<ApiCollection<Product>>(`${endpoints.products.base}${toQueryString(filters)}`),
  get: (id: number) => apiClient.get<{ data: Product }>(endpoints.products.detail(id)),
  create: (payload: ProductFormValues) => apiClient.post<{ data: Product }>(endpoints.products.base, payload),
  update: (id: number, payload: Partial<ProductFormValues>) => apiClient.put<{ data: Product }>(endpoints.products.detail(id), payload),
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.products.detail(id)),
  syncTags: (id: number, tagIds: number[]) => apiClient.put<{ data: Product }>(endpoints.products.tags(id), { tag_ids: tagIds }),

  variants: (productId: number) => apiClient.get<{ data: ProductVariant[] }>(endpoints.products.variants(productId)),
  createVariant: (productId: number, payload: VariantFormValues) =>
    apiClient.post<{ data: ProductVariant }>(endpoints.products.variants(productId), payload),
  variant: (productId: number, variantId: number) =>
    apiClient.get<{
      data: ProductVariant & { attribute_values: VariantAttributeValue[]; supplier_links: VariantSupplierLink[] };
    }>(endpoints.products.variantDetail(productId, variantId)),
  updateVariant: (productId: number, variantId: number, payload: Partial<VariantFormValues>) =>
    apiClient.put<{ data: ProductVariant }>(endpoints.products.variantDetail(productId, variantId), payload),
  removeVariant: (productId: number, variantId: number) =>
    apiClient.delete<ApiMessage>(endpoints.products.variantDetail(productId, variantId)),

  assignAttribute: (productId: number, variantId: number, payload: AssignVariantAttributePayload) =>
    apiClient.post<{ data: VariantAttributeValue }>(endpoints.products.variantAttributes(productId, variantId), payload),
  updateAttributeValue: (productId: number, variantId: number, valueId: number, payload: Partial<AssignVariantAttributePayload>) =>
    apiClient.put<{ data: VariantAttributeValue }>(endpoints.products.variantAttributeDetail(productId, variantId, valueId), payload),
  removeAttributeValue: (productId: number, variantId: number, valueId: number) =>
    apiClient.delete<ApiMessage>(endpoints.products.variantAttributeDetail(productId, variantId, valueId)),

  linkSupplier: (productId: number, variantId: number, payload: LinkVariantSupplierPayload) =>
    apiClient.post<{ data: VariantSupplierLink }>(endpoints.products.variantSuppliers(productId, variantId), payload),
  updateSupplierLink: (productId: number, variantId: number, linkId: number, payload: Partial<LinkVariantSupplierPayload>) =>
    apiClient.put<{ data: VariantSupplierLink }>(endpoints.products.variantSupplierDetail(productId, variantId, linkId), payload),
  removeSupplierLink: (productId: number, variantId: number, linkId: number) =>
    apiClient.delete<ApiMessage>(endpoints.products.variantSupplierDetail(productId, variantId, linkId)),

  priceHistory: (productId: number, variantId: number) =>
    apiClient.get<{ data: VariantPriceHistoryEntry[] }>(endpoints.products.variantPriceHistory(productId, variantId)),
  recordPrice: (productId: number, variantId: number, payload: RecordVariantPricePayload) =>
    apiClient.post<{ data: VariantPriceHistoryEntry }>(endpoints.products.variantPriceHistory(productId, variantId), payload),
};

export const productAttributesApi = {
  list: () => apiClient.get<{ data: ProductAttribute[] }>(endpoints.products.attributes),
  create: (payload: CreateProductAttributePayload) => apiClient.post<{ data: ProductAttribute }>(endpoints.products.attributes, payload),
  update: (id: number, payload: UpdateProductAttributePayload) =>
    apiClient.put<{ data: ProductAttribute }>(endpoints.products.attributeDetail(id), payload),
  remove: (id: number) => apiClient.delete<ApiMessage>(endpoints.products.attributeDetail(id)),

  createValue: (attributeId: number, payload: { value: string; sort_order?: number }) =>
    apiClient.post<{ data: ProductAttributeValue }>(endpoints.products.attributeValues(attributeId), payload),
  updateValue: (attributeId: number, valueId: number, payload: { value?: string; sort_order?: number }) =>
    apiClient.put<{ data: ProductAttributeValue }>(endpoints.products.attributeValueDetail(attributeId, valueId), payload),
  removeValue: (attributeId: number, valueId: number) =>
    apiClient.delete<ApiMessage>(endpoints.products.attributeValueDetail(attributeId, valueId)),
};
