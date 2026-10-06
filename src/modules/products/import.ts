import type { CsvColumnSpec } from "@/lib/csv";
import { productsApi } from "./api/products.api";
import type { ProductCategory, ProductFormValues } from "./types";

/**
 * Colonnes acceptées pour l'import CSV de produits (bouton « Importer » de
 * l'en-tête, cf. NJ Global Trade Template). Limité aux champs scalaires du
 * `productSchema` : variantes, attributs et fournisseurs se renseignent
 * ensuite sur la fiche. `Référence` et `Nom` sont requis ; la `Catégorie`
 * (optionnelle) est résolue par nom exact contre `GET /product-categories`.
 */
export const PRODUCT_IMPORT_COLUMNS: CsvColumnSpec[] = [
  { field: "reference", label: "Référence", required: true, aliases: ["ref", "sku"], example: "NJ-ELE-0139" },
  { field: "name", label: "Nom", required: true, aliases: ["produit", "libelle"], example: "Chargeur USB-C 30W" },
  { field: "category", label: "Catégorie", aliases: ["categorie"], example: "Électronique" },
  { field: "brand", label: "Marque", aliases: ["brand"] },
  { field: "status", label: "Statut", aliases: ["statut"], example: "ACTIVE" },
  { field: "min_order_quantity", label: "MOQ", aliases: ["moq", "quantite minimale"] },
  { field: "description", label: "Description" },
];

const STATUS_MAP: Record<string, ProductFormValues["status"]> = {
  active: "ACTIVE",
  actif: "ACTIVE",
  publie: "ACTIVE",
  inactive: "INACTIVE",
  inactif: "INACTIVE",
  archived: "ARCHIVED",
  archive: "ARCHIVED",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 255);
}

/**
 * Fabrique un `createOne` fermé sur la liste des catégories déjà chargée par
 * la page (évite un appel réseau par ligne pour résoudre `category_id`).
 */
export function makeImportProductRow(categories: ProductCategory[]) {
  const byName = new Map(categories.map((category) => [category.name.trim().toLowerCase(), category.id]));

  return async function importProductRow(values: Record<string, string>): Promise<void> {
    const statusKey = values.status?.trim().toLowerCase();
    const moq = values.min_order_quantity ? Number.parseInt(values.min_order_quantity, 10) : undefined;
    const categoryId = values.category ? byName.get(values.category.trim().toLowerCase()) : undefined;

    if (values.category && categoryId === undefined) {
      throw new Error(`Catégorie « ${values.category} » introuvable.`);
    }

    const payload: ProductFormValues = {
      reference: values.reference,
      name: values.name,
      slug: slugify(values.name || values.reference),
      status: (statusKey && STATUS_MAP[statusKey]) || "ACTIVE",
      is_sensitive: false,
      category_id: categoryId,
      brand: values.brand || undefined,
      description: values.description || undefined,
      min_order_quantity: moq && !Number.isNaN(moq) ? moq : undefined,
    };

    await productsApi.create(payload);
  };
}
