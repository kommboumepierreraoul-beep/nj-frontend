"use client";

import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices.api";

/** Doc/spec_pages_factures.md § 1 — historique unifié PROFORMA/FACTURE/AVOIR, remplace l'usage exclusif de `GET /sales-orders/{id}/proformas`. */
export function useSalesOrderInvoices(salesOrderId: number) {
  return useQuery({
    queryKey: ["sales-orders", "invoices", salesOrderId],
    queryFn: () => invoicesApi.listForSalesOrder(salesOrderId),
    select: (data) => data.data,
    enabled: Number.isInteger(salesOrderId) && salesOrderId > 0,
  });
}
