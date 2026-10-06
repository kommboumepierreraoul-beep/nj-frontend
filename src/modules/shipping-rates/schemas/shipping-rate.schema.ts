import { z } from "zod";

/** Doc/spec_pages_factures.md § 2 « Formulaire Palier de tarif de transport » — `max_quantity > min_quantity` validé à la création (spec précise "création uniquement", non redemandé à l'édition côté API — vérifié ici dans les deux cas par simplicité, sans effet bloquant côté serveur en édition). */
export const shippingRateSchema = z
  .object({
    mode: z.enum(["AERIEN", "MARITIME"]),
    min_quantity: z.coerce.number().min(0, "Doit être positif ou nul."),
    max_quantity: z.coerce.number().optional(),
    rate: z.coerce.number().min(0, "Doit être positif ou nul."),
    unit: z.string().min(1, "L'unité est requise.").max(20),
    lead_time_label: z.string().min(1, "Le délai indicatif est requis.").max(255),
    is_active: z.boolean().optional(),
    sort_order: z.coerce.number().int().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.max_quantity !== undefined && !Number.isNaN(values.max_quantity) && values.max_quantity <= values.min_quantity) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["max_quantity"], message: "Doit être strictement supérieur à la quantité minimum." });
    }
  });

export type ShippingRateSchema = z.infer<typeof shippingRateSchema>;
