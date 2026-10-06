import type { ExportRow } from "@/lib/export";
import { formatDate } from "@/lib/format";
import { formatCountryLabel } from "@/lib/countries";
import { CLIENT_STATUS_LABELS, CLIENT_TYPE_LABELS, VALUE_SEGMENT_LABELS } from "./badges";
import type { Client } from "./types";

/**
 * Doc/design_system_maquette_complete.md § 4.7 « Export » — `clients` est déjà
 * la liste filtrée côté appelant (mêmes filtres qu'à l'écran, sans pagination).
 * Colonnes alignées sur ./import.ts pour qu'un export puisse resservir de base
 * à un ré-import.
 */
export function buildClientsListRows(clients: Client[]): ExportRow[] {
  const rows: ExportRow[] = [
    ["PORTEFEUILLE CLIENTS", `généré le ${formatDate(new Date())}`],
    [],
    ["Nom complet", "Dénomination légale", "Type", "Catégorie", "Pays", "Ville", "Statut", "Segment de valeur"],
  ];

  for (const client of clients) {
    rows.push([
      client.full_name,
      client.legal_name ?? "",
      CLIENT_TYPE_LABELS[client.client_type],
      client.category?.label ?? "",
      formatCountryLabel(client.country),
      client.city ?? "",
      CLIENT_STATUS_LABELS[client.status],
      VALUE_SEGMENT_LABELS[client.value_segment],
    ]);
  }

  rows.push([]);
  rows.push(["TOTAL", `${clients.length} client(s)`]);
  return rows;
}
