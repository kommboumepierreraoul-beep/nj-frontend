import { z } from "zod";

/** Doc/spec_pages_commandes.md § « Action Changer le statut » — motif obligatoire uniquement si `status = ANNULEE` (rejeté en 422 sinon). */
export const changeStatusSchema = z
  .object({
    status: z.enum(["BROUILLON", "PROFORMA_ENVOYEE", "CONFIRMEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE", "CLOTUREE", "ANNULEE"]),
    reason: z.string().optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.status === "ANNULEE" && !values.reason) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reason"], message: "Un motif est requis pour annuler la commande." });
    }
  });

export type ChangeStatusSchema = z.infer<typeof changeStatusSchema>;
