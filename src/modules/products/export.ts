import type { ExportRow } from "@/lib/export";
import { formatDate } from "@/lib/format";
import { PRODUCT_STATUS_LABELS } from "./badges";
import type { Product } from "./types";

/**
 * Doc/design_system_maquette_complete.md § 4.7 « Export » — `products` est déjà
 * la liste filtrée côté appelant (mêmes filtres qu'à l'écran, sans pagination).
 * Colonnes alignées sur ./import.ts (un export peut resservir de base à un
 * ré-import) ; les données de variantes ne sont pas incluses ici (vue liste).
 */
export function buildProductsListRows(products: Product[]): ExportRow[] {
  const rows: ExportRow[] = [
    ["CATALOGUE PRODUITS", `généré le ${formatDate(new Date())}`],
    [],
    ["Référence", "Nom", "Catégorie", "Statut", "Sensible", "Variantes", "MOQ"],
  ];

  for (const product of products) {
    rows.push([
      product.reference,
      product.name,
      product.category?.name ?? "",
      PRODUCT_STATUS_LABELS[product.status],
      product.is_sensitive ? "Oui" : "Non",
      product.variants_count ?? 0,
      product.min_order_quantity ?? "",
    ]);
  }

  rows.push([]);
  rows.push(["TOTAL", `${products.length} référence(s)`]);
  return rows;
}
