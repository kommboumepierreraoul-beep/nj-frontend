"use client";

import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices.api";

/** Charge un document précis avec ses lignes — nécessaire pour la modale « Émettre un avoir » (§ 1.3), la liste ne les inclut pas. */
export function useInvoice(invoiceId: number | undefined) {
  return useQuery({
    queryKey: ["invoices", "detail", invoiceId],
    queryFn: () => invoicesApi.get(invoiceId as number),
    select: (data) => data.data,
    enabled: Boolean(invoiceId),
  });
}
