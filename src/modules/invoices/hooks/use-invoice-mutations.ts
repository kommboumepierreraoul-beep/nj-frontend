"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invoicesApi } from "../api/invoices.api";
import { ApiError } from "@/lib/http/api-error";
import type { CreditNotePayload, InvoicePaymentPayload, ProformaComparativeProposalPayload } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Émission de PROFORMA/AVOIR et règlement par document (Doc/spec_pages_factures.md
 * § 1) invalident systématiquement, en plus de l'historique des documents, la
 * fiche commande et ses paiements — une émission peut faire évoluer `payment_status`
 * (avoir soldant la commande sans encaissement) et un paiement par document
 * alimente la même table que l'onglet Paiements générique.
 */
function invalidateSalesOrderRelated(queryClient: ReturnType<typeof useQueryClient>, salesOrderId: number) {
  queryClient.invalidateQueries({ queryKey: ["sales-orders", "invoices", salesOrderId] });
  queryClient.invalidateQueries({ queryKey: ["sales-orders", "detail", salesOrderId] });
  queryClient.invalidateQueries({ queryKey: ["sales-orders", "payments", salesOrderId] });
  queryClient.invalidateQueries({ queryKey: ["sales-orders", "list"] });
}

export function useEmitProforma(salesOrderId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { proposal_details?: ProformaComparativeProposalPayload; language?: "FR" | "EN" }) => invoicesApi.emitProforma(salesOrderId, payload),
    onSuccess: () => {
      invalidateSalesOrderRelated(queryClient, salesOrderId);
      toast.success(translate("toast.proformaEmise"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.emissionImpossible")),
  });
}

export function useEmitCreditNote(salesOrderId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, payload }: { invoiceId: number; payload: CreditNotePayload }) => invoicesApi.emitCreditNote(invoiceId, payload),
    onSuccess: () => {
      invalidateSalesOrderRelated(queryClient, salesOrderId);
      toast.success(translate("toast.avoirEmis"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.emissionAvoirImpossible")),
  });
}

export function useRecordInvoicePayment(salesOrderId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, payload }: { invoiceId: number; payload: InvoicePaymentPayload }) => invoicesApi.recordPayment(invoiceId, payload),
    onSuccess: (data) => {
      invalidateSalesOrderRelated(queryClient, salesOrderId);
      toast.success(data.data.direction === "REMBOURSEMENT" ? translate("t.remboursementEnregistre") : translate("t.paiementEnregistre"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.enregistrementImpossible")),
  });
}

/**
 * Doc/communication_whatsapp_manuelle.md § 6 — marque le document `ENVOYEE`
 * et pose `sent_at` en cas de succès (§5, `InvoiceController::sendWhatsapp()`)
 * : seule l'invalidation de l'historique des documents est nécessaire (le
 * statut/`payment_status` de la commande, les paiements, ne sont jamais
 * affectés par un envoi WhatsApp).
 */
export function useSendInvoiceWhatsapp(salesOrderId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: number) => invoicesApi.sendWhatsapp(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "invoices", salesOrderId] });
      toast.success(translate("toast.documentEnvoyeAuClientParWhatsapp"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.envoiImpossible")),
  });
}

/** Doc/communication_whatsapp_manuelle.md § 5 — réservée aux PROFORMA, ne modifie aucun champ de l'invoice (pas de nouvel état à invalider). */
export function useRelanceInvoiceWhatsapp() {
  return useMutation({
    mutationFn: (invoiceId: number) => invoicesApi.relanceWhatsapp(invoiceId),
    onSuccess: () => toast.success(translate("toast.relanceEnvoyeeAuClientParWhatsapp")),
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.relanceImpossible")),
  });
}
