"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices.api";
import type { InvoiceListFilters } from "../types";

/**
 * Registre transverse des documents (page « Factures » autonome —
 * Doc/design_system_maquette_complete.md § 3). Les filtres vivent dans l'URL
 * côté page ; `keepPreviousData` évite le flash vide au changement de page.
 */
export function useInvoicesRegistry(filters: InvoiceListFilters) {
  return useQuery({
    queryKey: ["invoices", "registry", filters],
    queryFn: () => invoicesApi.registry(filters),
    placeholderData: keepPreviousData,
  });
}
