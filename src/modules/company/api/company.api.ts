import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import type { ApiMessage } from "@/types/api";
import type {
  AdminCurrency,
  CompanyPaymentMethod,
  CompanyPaymentMethodPayload,
  CompanySettings,
  CompanySettingsPayload,
  CurrencyPayload,
  ExchangeRatePayload,
} from "../types";

/**
 * Module « Paramètres → Entreprise » — miroir des routes réelles de
 * routes/company/company.php (nj-backend, livrées le 2026-09-03).
 * Lecture derrière `company_settings.view`, écriture derrière `company_settings.manage`.
 */
export const companyApi = {
  // --- Identité de l'entreprise (singleton) ---
  settings: () => apiClient.get<{ data: CompanySettings }>(endpoints.company.settings),
  updateSettings: (payload: CompanySettingsPayload) =>
    apiClient.put<{ data: CompanySettings }>(endpoints.company.settings, payload),
  /**
   * Mise à jour avec téléversement du logo : `PUT` "spoofé" en `POST` multipart
   * (PHP ne peuple `$_FILES` que sur un POST), même mécanisme que le module
   * catégories produits.
   */
  updateSettingsWithLogo: (payload: CompanySettingsPayload, logo: File) => {
    const formData = new FormData();
    formData.set("_method", "PUT");
    formData.set("logo", logo);
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined && value !== null) formData.set(key, String(value));
    }
    return apiClient.postForm<{ data: CompanySettings }>(endpoints.company.settings, formData);
  },
  removeLogo: () => apiClient.delete<{ data: CompanySettings }>(endpoints.company.settingsLogo),

  // --- Moyens de paiement ---
  paymentMethods: () => apiClient.get<{ data: CompanyPaymentMethod[] }>(endpoints.company.paymentMethods),
  createPaymentMethod: (payload: CompanyPaymentMethodPayload) =>
    apiClient.post<{ data: CompanyPaymentMethod }>(endpoints.company.paymentMethods, payload),
  updatePaymentMethod: (id: number, payload: Partial<CompanyPaymentMethodPayload>) =>
    apiClient.put<{ data: CompanyPaymentMethod }>(endpoints.company.paymentMethodDetail(id), payload),
  deletePaymentMethod: (id: number) => apiClient.delete<ApiMessage>(endpoints.company.paymentMethodDetail(id)),

  // --- Devises (écriture ; la lecture passe par referenceData.currencies) ---
  currencies: () => apiClient.get<{ data: AdminCurrency[] }>(endpoints.company.currencies),
  createCurrency: (payload: CurrencyPayload) => apiClient.post<{ data: AdminCurrency }>(endpoints.company.currencies, payload),
  updateCurrency: (id: number, payload: Partial<CurrencyPayload>) =>
    apiClient.put<{ data: AdminCurrency }>(endpoints.company.currencyDetail(id), payload),
  deleteCurrency: (id: number) => apiClient.delete<ApiMessage>(endpoints.company.currencyDetail(id)),
  addExchangeRate: (id: number, payload: ExchangeRatePayload) =>
    apiClient.post<{ data: AdminCurrency }>(endpoints.company.currencyExchangeRates(id), payload),
};
