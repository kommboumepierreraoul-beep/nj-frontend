"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { companyApi } from "../api/company.api";
import { ApiError } from "@/lib/http/api-error";
import type { CompanyPaymentMethodPayload, CompanySettingsPayload, CurrencyPayload, ExchangeRatePayload } from "../types";
import { translate } from "@/i18n/translate";

const SETTINGS_KEY = ["company", "settings"] as const;
const METHODS_KEY = ["company", "payment-methods"] as const;
const CURRENCIES_KEY = ["company", "currencies"] as const;

function onErr(fallback: string) {
  return (error: unknown) => toast.error(error instanceof ApiError ? error.message : fallback);
}

// --- Identité de l'entreprise ---

export function useCompanySettings() {
  return useQuery({ queryKey: SETTINGS_KEY, queryFn: () => companyApi.settings(), select: (d) => d.data });
}

export function useUpdateCompanySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, logo }: { payload: CompanySettingsPayload; logo?: File | null }) =>
      logo ? companyApi.updateSettingsWithLogo(payload, logo) : companyApi.updateSettings(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEY });
      toast.success(translate("toast.parametresSocieteMisAJour"));
    },
    onError: onErr(translate("toast.miseAJourImpossible")),
  });
}

export function useRemoveCompanyLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => companyApi.removeLogo(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEY });
      toast.success(translate("toast.logoSupprime"));
    },
    onError: onErr(translate("toast.suppressionImpossible")),
  });
}

// --- Moyens de paiement ---

export function useCompanyPaymentMethods() {
  return useQuery({ queryKey: METHODS_KEY, queryFn: () => companyApi.paymentMethods(), select: (d) => d.data });
}

export function useCompanyPaymentMethodMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: METHODS_KEY });

  return {
    create: useMutation({
      mutationFn: (payload: CompanyPaymentMethodPayload) => companyApi.createPaymentMethod(payload),
      onSuccess: () => {
        invalidate();
        toast.success(translate("toast.moyenDePaiementCree"));
      },
      onError: onErr(translate("toast.creationImpossible")),
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Partial<CompanyPaymentMethodPayload> }) =>
        companyApi.updatePaymentMethod(id, payload),
      onSuccess: () => {
        invalidate();
        toast.success(translate("toast.moyenDePaiementMisAJour"));
      },
      onError: onErr(translate("toast.miseAJourImpossible")),
    }),
    remove: useMutation({
      mutationFn: (id: number) => companyApi.deletePaymentMethod(id),
      onSuccess: () => {
        invalidate();
        toast.success(translate("toast.moyenDePaiementSupprime"));
      },
      onError: onErr(translate("toast.suppressionImpossible")),
    }),
  };
}

// --- Devises ---

export function useAdminCurrencies() {
  return useQuery({ queryKey: CURRENCIES_KEY, queryFn: () => companyApi.currencies(), select: (d) => d.data });
}

export function useCurrencyMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: CURRENCIES_KEY });
    qc.invalidateQueries({ queryKey: ["reference-data", "currencies"] });
  };

  return {
    create: useMutation({
      mutationFn: (payload: CurrencyPayload) => companyApi.createCurrency(payload),
      onSuccess: () => {
        invalidate();
        toast.success(translate("toast.deviseCreee"));
      },
      onError: onErr(translate("toast.creationImpossible")),
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Partial<CurrencyPayload> }) => companyApi.updateCurrency(id, payload),
      onSuccess: () => {
        invalidate();
        toast.success(translate("toast.deviseMiseAJour"));
      },
      onError: onErr(translate("toast.miseAJourImpossible")),
    }),
    remove: useMutation({
      mutationFn: (id: number) => companyApi.deleteCurrency(id),
      onSuccess: () => {
        invalidate();
        toast.success(translate("toast.deviseSupprimee"));
      },
      onError: (error: unknown) =>
        toast.error(
          error instanceof ApiError && (error.status === 409 || error.status === 422)
            ? error.message
            : error instanceof ApiError
              ? error.message
              : translate("toast.suppressionImpossible"),
        ),
    }),
    addRate: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: ExchangeRatePayload }) => companyApi.addExchangeRate(id, payload),
      onSuccess: () => {
        invalidate();
        toast.success(translate("toast.tauxDeChangeEnregistre"));
      },
      onError: onErr(translate("toast.enregistrementImpossible")),
    }),
  };
}
