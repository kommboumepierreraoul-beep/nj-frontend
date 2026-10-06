"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductsList } from "@/modules/products/hooks/use-products-list";
import { useProductVariants } from "@/modules/products/hooks/use-product-variants";
import type { ProductVariant } from "@/modules/products/types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_fournisseurs.md § 6 : "Sélecteur variante de produit
 * (recherche par SKU/nom)". Aucune route de recherche globale des variantes
 * n'est documentée dans les specs Produits/Fournisseurs (`GET /products/{id}/variants`
 * est nichée sous un produit) — interprétation retenue : recherche du produit
 * par nom/référence, puis choix de la variante dans la liste de ce produit.
 */
export function VariantPickerField({ onSelect }: { onSelect: (variant: ProductVariant & { productId: number }) => void }) {
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState<number | undefined>(undefined);
  const productsQuery = useProductsList({ search: search || undefined, per_page: 8 });
  const variantsQuery = useProductVariants(productId ?? 0);

  const products = productsQuery.data?.data ?? [];

  return (
    <div className="space-y-2">
      <Input
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setProductId(undefined);
        }}
        placeholder={translate("ph.rechercherUnProduitParNomOuReference")}
      />
      {search && !productId && products.length > 0 ? (
        <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-surface">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => setProductId(product.id)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-background"
            >
              {product.name} ({product.reference})
            </button>
          ))}
        </div>
      ) : null}
      {productId ? (
        <Select
          onValueChange={(value) => {
            const variant = (variantsQuery.data ?? []).find((item) => item.id === Number(value));
            if (variant) onSelect({ ...variant, productId });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={translate("ph.choisirUneVariante")} />
          </SelectTrigger>
          <SelectContent>
            {(variantsQuery.data ?? []).map((variant) => (
              <SelectItem key={variant.id} value={String(variant.id)}>
                {variant.sku} — {variant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
