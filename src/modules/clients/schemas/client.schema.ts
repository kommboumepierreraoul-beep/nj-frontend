import { z } from "zod";

/**
 * Reprend le formulaire « Client » (Doc/spec_pages_clients.md § 3). La règle
 * "custom_commission_rate obligatoire si has_custom_commission" est appliquée
 * en `superRefine` plutôt qu'un champ conditionnel côté zod natif.
 */
export const clientSchema = z
  .object({
    client_type: z.enum(["PARTICULIER", "ENTREPRISE"]),
    full_name: z.string().min(1, "Le nom complet est requis.").max(255),
    legal_name: z.string().max(255).optional().or(z.literal("")),
    category_id: z.coerce.number().int().optional(),
    country_id: z.coerce.number().int().optional(),
    city: z.string().max(255).optional().or(z.literal("")),
    region: z.string().max(255).optional().or(z.literal("")),
    address_line: z.string().optional().or(z.literal("")),
    preferred_currency_id: z.coerce.number().int().optional(),
    preferred_language: z.enum(["FR", "EN"]),
    referred_by_client_id: z.coerce.number().int().optional(),
    billing_mode: z.enum(["COMMISSION_VISIBLE", "PRIX_GLOBAL"]),
    has_custom_commission: z.boolean(),
    custom_commission_rate: z.coerce.number().optional(),
    proforma_validity_days: z.coerce.number().int().min(1).optional(),
    status: z.enum(["ACTIF", "INACTIF", "VIP", "BLOQUE"]),
    internal_notes: z.string().optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.has_custom_commission && (values.custom_commission_rate === undefined || Number.isNaN(values.custom_commission_rate))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["custom_commission_rate"],
        message: "Requis lorsque la commission dérogatoire est activée.",
      });
    }
  });

export type ClientSchema = z.infer<typeof clientSchema>;
