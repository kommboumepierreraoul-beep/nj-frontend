import type { CsvColumnSpec } from "@/lib/csv";
import { clientsApi } from "./api/clients.api";
import type { ClientCategory, ClientFormValues } from "./types";

/**
 * Colonnes acceptées pour l'import CSV de clients (bouton « Importer » de
 * l'en-tête, cf. NJ Global Trade Template). Limité aux champs scalaires du
 * `clientSchema` ; les canaux de contact et étiquettes se renseignent ensuite
 * sur la fiche. `Nom complet` est requis. Les champs à choix fermé prennent
 * une valeur par défaut sûre s'ils sont absents (voir plus bas). La
 * `Catégorie` (optionnelle) est résolue par libellé exact.
 */
export const CLIENT_IMPORT_COLUMNS: CsvColumnSpec[] = [
  { field: "full_name", label: "Nom complet", required: true, aliases: ["nom", "client", "name"], example: "Boutique Élégance Douala" },
  { field: "legal_name", label: "Dénomination légale", aliases: ["raison sociale", "legal name"] },
  { field: "client_type", label: "Type", aliases: ["type"], example: "ENTREPRISE" },
  { field: "category", label: "Catégorie", aliases: ["categorie", "provenance"], example: "Direct" },
  { field: "city", label: "Ville" },
  { field: "region", label: "Région", aliases: ["region"] },
  { field: "preferred_language", label: "Langue", aliases: ["langue"], example: "FR" },
  { field: "internal_notes", label: "Notes internes", aliases: ["notes"] },
];

function resolveType(raw: string | undefined): ClientFormValues["client_type"] {
  return raw?.trim().toUpperCase() === "ENTREPRISE" || raw?.trim().toLowerCase() === "entreprise" ? "ENTREPRISE" : "PARTICULIER";
}

function resolveLanguage(raw: string | undefined): ClientFormValues["preferred_language"] {
  return raw?.trim().toUpperCase() === "EN" ? "EN" : "FR";
}

/**
 * Fabrique un `createOne` fermé sur la liste des catégories déjà chargée par
 * la page (pas d'appel réseau par ligne pour résoudre `category_id`).
 */
export function makeImportClientRow(categories: ClientCategory[]) {
  const byLabel = new Map(categories.map((category) => [category.label.trim().toLowerCase(), category.id]));

  return async function importClientRow(values: Record<string, string>): Promise<void> {
    const categoryId = values.category ? byLabel.get(values.category.trim().toLowerCase()) : undefined;
    if (values.category && categoryId === undefined) {
      throw new Error(`Catégorie « ${values.category} » introuvable.`);
    }

    const payload: ClientFormValues = {
      client_type: resolveType(values.client_type),
      full_name: values.full_name,
      legal_name: values.legal_name || "",
      category_id: categoryId,
      city: values.city || "",
      region: values.region || "",
      preferred_language: resolveLanguage(values.preferred_language),
      billing_mode: "COMMISSION_VISIBLE",
      has_custom_commission: false,
      status: "ACTIF",
      internal_notes: values.internal_notes || "",
    };

    await clientsApi.create(payload);
  };
}
