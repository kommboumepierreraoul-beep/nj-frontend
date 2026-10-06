import type { ExportRow } from "@/lib/export";
import { formatDate, toNumber } from "@/lib/format";
import { formatCountryLabel } from "@/lib/countries";
import { SUPPLIER_RELIABILITY_LABELS } from "./badges";
import type { Supplier } from "./types";

/**
 * Doc/design_system_maquette_complete.md § 4.7 « Export » — `suppliers` est
 * déjà la liste filtrée côté appelant (mêmes filtres qu'à l'écran, sans
 * pagination). Colonnes alignées sur celles importables (voir ./import.ts)
 * pour qu'un export puisse servir de base à un ré-import.
 */
export function buildSuppliersListRows(suppliers: Supplier[]): ExportRow[] {
  const rows: ExportRow[] = [
    ["LISTE DES FOURNISSEURS", `généré le ${formatDate(new Date())}`],
    [],
    ["Raison sociale", "Contact", "Téléphone", "Email", "Pays", "Ville", "Fiabilité", "Score", "Statut"],
  ];

  for (const supplier of suppliers) {
    rows.push([
      supplier.company_name,
      supplier.contact_name ?? "",
      supplier.phone ?? "",
      supplier.email ?? "",
      formatCountryLabel(supplier.country),
      supplier.city ?? "",
      SUPPLIER_RELIABILITY_LABELS[supplier.reliability],
      toNumber(supplier.reliability_score)?.toFixed(1) ?? "",
      supplier.is_active ? "Actif" : "Inactif",
    ]);
  }

  rows.push([]);
  rows.push(["TOTAL", `${suppliers.length} fournisseur(s)`]);
  return rows;
}
