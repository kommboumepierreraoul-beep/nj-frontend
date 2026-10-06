import { z } from "zod";

/** Doc/spec_pages_fournisseurs.md § 4, onglet « Articles ». `custom_description` requis si `product_id` absent (superRefine). */
export const rfqItemSchema = z
  .object({
    product_id: z.coerce.number().int().optional(),
    custom_description: z.string().optional().or(z.literal("")),
    target_quantity: z.coerce.number().int().min(1, "Doit être au moins 1."),
    target_unit_id: z.coerce.number().int().optional(),
    target_price: z.coerce.number().min(0).optional(),
    notes: z.string().optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (!values.product_id && !values.custom_description) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["custom_description"], message: "Requis si aucun produit du catalogue n'est choisi." });
    }
  });

export type RfqItemSchema = z.infer<typeof rfqItemSchema>;
