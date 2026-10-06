import { z } from "zod";

/** Doc/spec_pages_produits.md § 4, onglet « Attributs personnalisés ». */
export const assignAttributeSchema = z.object({
  product_attribute_id: z.coerce.number().int({ message: "L'attribut est requis." }),
  product_attribute_value_id: z.coerce.number().int().optional(),
  custom_value: z.string().max(255).optional().or(z.literal("")),
});

export type AssignAttributeSchema = z.infer<typeof assignAttributeSchema>;
