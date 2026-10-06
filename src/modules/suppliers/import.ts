import type { CsvColumnSpec } from "@/lib/csv";
import { suppliersApi } from "./api/suppliers.api";
import type { SupplierFormValues } from "./types";

/**
 * Colonnes acceptées pour l'import CSV de fournisseurs (bouton « Importer » de
 * l'en-tête, cf. NJ Global Trade Template). Volontairement limité aux champs
 * scalaires simples de `supplierSchema` : la fiche complète (contacts,
 * comptes bancaires, documents, évaluations) se remplit ensuite à la main.
 * `company_name` est le seul champ obligatoire côté backend.
 */
export const SUPPLIER_IMPORT_COLUMNS: CsvColumnSpec[] = [
  { field: "company_name", label: "Raison sociale", required: true, aliases: ["nom", "fournisseur", "company"], example: "Guangzhou Hanfeng Trading Co." },
  { field: "legal_name", label: "Dénomination légale", aliases: ["legal name"] },
  { field: "contact_name", label: "Contact", aliases: ["nom contact", "contact name"] },
  { field: "phone", label: "Téléphone", aliases: ["tel", "telephone"] },
  { field: "whatsapp", label: "WhatsApp" },
  { field: "email", label: "Email", aliases: ["e-mail", "mail"] },
  { field: "website", label: "Site web", aliases: ["site", "url"] },
  { field: "province", label: "Province" },
  { field: "city", label: "Ville" },
  { field: "notes", label: "Notes" },
];

/** Une ligne CSV mappée -> payload `suppliersApi.create`. */
export async function importSupplierRow(values: Record<string, string>): Promise<void> {
  const payload: SupplierFormValues = {
    company_name: values.company_name,
    legal_name: values.legal_name || "",
    contact_name: values.contact_name || "",
    phone: values.phone || "",
    whatsapp: values.whatsapp || "",
    wechat_id: "",
    alibaba_profile_url: "",
    email: values.email || "",
    website: values.website || "",
    province: values.province || "",
    city: values.city || "",
    address_line: "",
    payment_terms: "",
    notes: values.notes || "",
    is_active: true,
  };

  await suppliersApi.create(payload);
}
