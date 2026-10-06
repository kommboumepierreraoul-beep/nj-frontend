"use client";

import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices.api";

/**
 * Valeurs par défaut de la proforma comparative (Doc/proforma_comparatif_addendum.md,
 * demande du 2026-09-03) : arguments par variante + bloc « Notes / conditions » société,
 * résolus côté serveur. Chargées à l'ouverture du dialogue d'émission comparative pour
 * pré-remplir le formulaire.
 */
export function useProformaDefaults(salesOrderId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["invoices", "proforma-defaults", salesOrderId],
    queryFn: () => invoicesApi.proformaDefaults(salesOrderId),
    select: (response) => response.data,
    enabled,
    staleTime: 60_000,
  });
}
