import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiCollection } from "@/types/api";
import type { SalesOrderPayment } from "@/modules/sales-orders/types";
import type { CreditNotePayload, Invoice, InvoiceListFilters, InvoicePaymentPayload, ProformaComparativeProposalPayload } from "../types";

export const invoicesApi = {
  listForSalesOrder: (salesOrderId: number) => apiClient.get<{ data: Invoice[] }>(endpoints.salesOrders.invoices(salesOrderId)),
  /** Registre transverse — tous les documents, toutes commandes confondues. */
  registry: (filters: InvoiceListFilters) => apiClient.get<ApiCollection<Invoice>>(`${endpoints.invoices.registry}${toQueryString(filters)}`),
  get: (invoiceId: number) => apiClient.get<{ data: Invoice }>(endpoints.invoices.detail(invoiceId)),
  /** Gabarit plat (MULTI_PRODUITS/PRESTATION_SERVICE) : aucun corps de requête. Gabarit comparatif (PRODUIT_UNIQUE_MULTI_CHOIX) : `proposal_details`. */
  emitProforma: (salesOrderId: number, payload?: { proposal_details?: ProformaComparativeProposalPayload; language?: "FR" | "EN" }) =>
    apiClient.post<{ data: Invoice }>(endpoints.salesOrders.emitProforma(salesOrderId), payload),
  /**
   * Valeurs par défaut de la proforma comparative, résolues côté serveur depuis les
   * fiches variantes (points forts / attention / recommandation par niveau) et les
   * Paramètres → Entreprise (bloc « Notes / conditions »). Sert à pré-remplir le
   * dialogue d'émission — l'émetteur ajuste puis émet.
   */
  proformaDefaults: (salesOrderId: number) =>
    apiClient.get<{ data: ProformaComparativeProposalPayload }>(endpoints.salesOrders.proformaDefaults(salesOrderId)),
  emitCreditNote: (invoiceId: number, payload: CreditNotePayload) => apiClient.post<{ data: Invoice }>(endpoints.invoices.creditNotes(invoiceId), payload),
  recordPayment: (invoiceId: number, payload: InvoicePaymentPayload) => apiClient.post<{ data: SalesOrderPayment }>(endpoints.invoices.payments(invoiceId), payload),
  payments: (invoiceId: number) => apiClient.get<{ data: SalesOrderPayment[] }>(endpoints.invoices.payments(invoiceId)),
  /**
   * Doc/communication_whatsapp_manuelle.md § 6 — envoi manuel, jamais planifié
   * (§0.1 du même document réaffirme le cahier des charges § 2.4 : aucune
   * relance automatique). Refusé en 422 (AVOIR, document ANNULEE/REMPLACEE,
   * template Meta non configuré, contact WhatsApp manquant) ou 502 (échec
   * Brevo) — messages remontés tels quels par `ApiError`.
   */
  sendWhatsapp: (invoiceId: number) => apiClient.post<{ data: Invoice }>(endpoints.invoices.sendWhatsapp(invoiceId)),
  relanceWhatsapp: (invoiceId: number) => apiClient.post<{ message: string }>(endpoints.invoices.relanceWhatsapp(invoiceId)),
};
