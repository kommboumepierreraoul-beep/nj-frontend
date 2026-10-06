import type { Attachment } from "@/modules/attachments/types";
import { storageUrl } from "@/lib/media";
import type { Product } from "./types";

/**
 * Sélectionne le visuel à utiliser comme vignette produit (liste Produits,
 * grille Catalogue) : la pièce jointe `PRODUCT_IMAGE` marquée `is_primary`,
 * sinon la première par `sort_order`. Remplace l'ancien champ
 * `product.primary_image_url`, qui n'a jamais existé côté API
 * (`ProductResource` ne renvoie que `attachments`, jamais d'URL précalculée).
 */
export function getPrimaryImage(product: Pick<Product, "attachments">): Attachment | undefined {
  const images = (product.attachments ?? []).filter((a) => a.media_types.includes("PRODUCT_IMAGE"));
  if (images.length === 0) return undefined;
  return images.slice().sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order)[0];
}

/** Raccourci : URL publique du visuel principal d'un produit, ou `undefined` s'il n'y en a pas. */
export function getPrimaryImageUrl(product: Pick<Product, "attachments">): string | undefined {
  return storageUrl(getPrimaryImage(product)?.file_path);
}
