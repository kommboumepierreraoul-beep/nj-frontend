import { z } from "zod";

/** Doc/spec_pages_produits.md § 5 — formulaire « Attribut ». */
export const productAttributeSchema = z.object({
  name: z.string().min(1, "Le nom est requis.").max(255),
  code: z.string().min(1, "Le code est requis.").max(255),
  input_type: z.enum(["TEXT", "NUMBER", "SELECT", "BOOLEAN", "COLOR"]),
  unit_suffix: z.string().max(50).optional().or(z.literal("")),
  is_filterable: z.boolean(),
});

export type ProductAttributeSchema = z.infer<typeof productAttributeSchema>;

/** Doc/spec_pages_produits.md § 5 — formulaire « Valeur d'attribut ». */
export const attributeValueSchema = z.object({
  value: z.string().min(1, "La valeur est requise.").max(255),
  sort_order: z.coerce.number().int().optional(),
});

export type AttributeValueSchema = z.infer<typeof attributeValueSchema>;
