import { z } from "zod";

/**
 * Doc/spec_pages_fournisseurs.md § 2, onglet « Documents ». La règle
 * "expiry_date >= issue_date" est appliquée en `superRefine` plutôt qu'une
 * comparaison native zod entre deux champs.
 */
export const supplierDocumentSchema = z
  .object({
    type: z.enum(["BUSINESS_LICENSE", "CERTIFICATE_ISO", "CERTIFICATE_BSCI", "FACTORY_AUDIT_REPORT", "OTHER"]),
    attachment_id: z.coerce.number().int({ message: "Le fichier est requis." }),
    issue_date: z.string().optional().or(z.literal("")),
    expiry_date: z.string().optional().or(z.literal("")),
    is_verified: z.boolean(),
    notes: z.string().optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.issue_date && values.expiry_date && values.expiry_date < values.issue_date) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["expiry_date"], message: "Doit être postérieure à la date d'émission." });
    }
  });

export type SupplierDocumentSchema = z.infer<typeof supplierDocumentSchema>;
