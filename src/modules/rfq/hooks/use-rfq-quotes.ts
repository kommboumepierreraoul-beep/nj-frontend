"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rfqApi } from "../api/rfq.api";
import { ApiError } from "@/lib/http/api-error";
import type { RfqSupplierQuotePayload } from "../types";
import { translate } from "@/i18n/translate";

function key(rfqSupplierId: number) {
  return ["rfqs", "quotes", rfqSupplierId] as const;
}

export function useRfqQuotes(rfqSupplierId: number) {
  return useQuery({
    queryKey: key(rfqSupplierId),
    queryFn: () => rfqApi.quotes(rfqSupplierId),
    select: (data) => data.data,
  });
}

export function useCreateRfqQuote(rfqSupplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RfqSupplierQuotePayload) => rfqApi.createQuote(rfqSupplierId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(rfqSupplierId) });
      toast.success(translate("toast.devisAjoute"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajoutImpossible")),
  });
}

export function useUpdateRfqQuote(rfqSupplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quoteId, payload }: { quoteId: number; payload: Partial<RfqSupplierQuotePayload> }) =>
      rfqApi.updateQuote(rfqSupplierId, quoteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(rfqSupplierId) });
      toast.success(translate("toast.devisMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteRfqQuote(rfqSupplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quoteId: number) => rfqApi.removeQuote(rfqSupplierId, quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(rfqSupplierId) });
      toast.success(translate("toast.devisSupprime"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}

/**
 * Un seul devis reste sélectionné par article (Doc/spec_pages_fournisseurs.md
 * § 4) : on invalide tous les groupes de devis connus du RFQ courant n'est pas
 * possible ici (portée limitée à `rfqSupplierId`) — le composant appelant
 * (RfqSuppliersTab) invalide en plus la liste des fournisseurs sollicités pour
 * rafraîchir les badges « retenu » affichés au niveau 1.
 */
export function useSelectRfqQuote(rfqSupplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quoteId: number) => rfqApi.selectQuote(rfqSupplierId, quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(rfqSupplierId) });
      toast.success(translate("toast.devisRetenu"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.actionImpossible")),
  });
}
