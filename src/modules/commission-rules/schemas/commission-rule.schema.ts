import { z } from "zod";

/** Doc/spec_pages_commandes.md § 3 « Formulaire Palier de commission » — `max_amount`, si renseigné, doit être strictement supérieur à `min_amount` (rejeté en 422 sinon, à la création). */
export const commissionRuleSchema = z
  .object({
    label: z.string().min(1, "Le libellé est requis.").max(255),
    min_amount: z.coerce.number().min(0, "Doit être positif ou nul."),
    max_amount: z.coerce.number().optional(),
    commission_type: z.enum(["POURCENTAGE", "FORFAIT"]),
    rate_or_amount: z.coerce.number().min(0, "Doit être positif ou nul."),
    currency_id: z.coerce.number().int().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.coerce.number().int().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.max_amount !== undefined && !Number.isNaN(values.max_amount) && values.max_amount <= values.min_amount) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["max_amount"], message: "Doit être strictement supérieur au montant minimum." });
    }
  });

export type CommissionRuleSchema = z.infer<typeof commissionRuleSchema>;
