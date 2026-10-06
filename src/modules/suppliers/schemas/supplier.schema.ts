import { z } from "zod";

/** Doc/spec_pages_fournisseurs.md § 1 — formulaire « Fournisseur ». */
export const supplierSchema = z.object({
  company_name: z.string().min(1, "La raison sociale est requise.").max(255),
  legal_name: z.string().max(255).optional().or(z.literal("")),
  contact_name: z.string().max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  whatsapp: z.string().max(50).optional().or(z.literal("")),
  wechat_id: z.string().max(100).optional().or(z.literal("")),
  alibaba_profile_url: z.string().max(255).optional().or(z.literal("")),
  email: z.string().email("Format d'e-mail invalide.").max(255).optional().or(z.literal("")),
  website: z.string().max(255).optional().or(z.literal("")),
  province: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(255).optional().or(z.literal("")),
  address_line: z.string().optional().or(z.literal("")),
  country_id: z.coerce.number().int().optional(),
  reliability: z.enum(["INCONNU", "FAIBLE", "MOYEN", "BON", "EXCELLENT"]).optional(),
  payment_terms: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  is_active: z.boolean(),
});

export type SupplierSchema = z.infer<typeof supplierSchema>;

/** Doc/spec_pages_fournisseurs.md § 1 — action « Vérifier le fournisseur ». */
export const verifySupplierSchema = z.object({
  verification_method: z.enum(["FACTORY_VISIT", "VIDEO_CALL", "THIRD_PARTY_AUDIT", "DOCUMENTS_ONLY"]),
});

export type VerifySupplierSchema = z.infer<typeof verifySupplierSchema>;

/** Doc/spec_pages_fournisseurs.md § 1 — action « Liste noire ». `blacklist_reason` requis en `superRefine` si activé. */
export const blacklistSupplierSchema = z
  .object({
    is_blacklisted: z.boolean(),
    blacklist_reason: z.string().optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.is_blacklisted && !values.blacklist_reason) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["blacklist_reason"], message: "Requis lorsque la liste noire est activée." });
    }
  });

export type BlacklistSupplierSchema = z.infer<typeof blacklistSupplierSchema>;
