import { z } from "zod";

/** Formulaire « Identité de l'entreprise » + « Valeurs par défaut proforma » (miroir de CompanySettingsController::update). */
export const companySettingsSchema = z.object({
  legal_name: z.string().min(1, "La raison sociale est requise.").max(255),
  tagline: z.string().max(255).optional().or(z.literal("")),
  address_line: z.string().min(1, "L'adresse est requise.").max(255),
  representation_line: z.string().max(255).optional().or(z.literal("")),
  phone: z.string().max(255).optional().or(z.literal("")),
  whatsapp: z.string().max(255).optional().or(z.literal("")),
  email: z.string().email("Format d'e-mail invalide.").max(255).optional().or(z.literal("")),
  website: z.string().max(255).optional().or(z.literal("")),
  default_proforma_validity_days: z.coerce.number().int().min(1, "Au moins 1 jour.").max(365),
  // Taux de TVA proposé par défaut à la création d'une commande (Doc/tva_addendum.md) — 0 = aucune TVA.
  default_tax_rate: z.coerce.number().min(0, "Taux positif.").max(100, "100 % maximum."),
  default_proforma_conditions: z.string().max(2000).optional().or(z.literal("")),
  default_proforma_production_delay: z.string().max(2000).optional().or(z.literal("")),
  default_proforma_payment_terms: z.string().max(2000).optional().or(z.literal("")),
  default_proforma_customs: z.string().max(2000).optional().or(z.literal("")),
});
export type CompanySettingsSchema = z.infer<typeof companySettingsSchema>;

export const PAYMENT_METHOD_TYPES = ["MOBILE_MONEY", "BANK_TRANSFER", "CASH", "OTHER"] as const;

export const paymentMethodSchema = z.object({
  label: z.string().min(1, "Le libellé est requis.").max(255),
  method_type: z.enum(PAYMENT_METHOD_TYPES),
  account_number: z.string().max(255).optional().or(z.literal("")),
  account_holder: z.string().max(255).optional().or(z.literal("")),
  iban: z.string().max(255).optional().or(z.literal("")),
  swift: z.string().max(255).optional().or(z.literal("")),
  instructions: z.string().max(2000).optional().or(z.literal("")),
  is_active: z.boolean(),
  show_on_documents: z.boolean(),
  sort_order: z.coerce.number().int().optional(),
});
export type PaymentMethodSchema = z.infer<typeof paymentMethodSchema>;

export const currencySchema = z.object({
  code: z
    .string()
    .trim()
    .length(3, "Code ISO à 3 lettres.")
    .regex(/^[A-Za-z]{3}$/, "Lettres uniquement.")
    .transform((value) => value.toUpperCase()),
  name: z.string().min(1, "Le nom est requis.").max(255),
  symbol: z.string().max(10).optional().or(z.literal("")),
  is_default: z.boolean(),
  is_active: z.boolean(),
});
export type CurrencySchema = z.infer<typeof currencySchema>;

export const exchangeRateSchema = z.object({
  rate_to_xaf: z.coerce.number().gt(0, "Doit être strictement positif."),
  effective_date: z.string().min(1, "La date d'effet est requise."),
});
export type ExchangeRateSchema = z.infer<typeof exchangeRateSchema>;
