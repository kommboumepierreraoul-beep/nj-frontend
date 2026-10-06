import { z } from "zod";

/**
 * Doc/spec_pages_produits.md § 2 — formulaire « Produit ». La règle
 * "sensitivity_reason requis si is_sensitive" (règle serveur `required_if`)
 * est appliquée en `superRefine`, comme pour les champs conditionnels du
 * module Clients.
 */
export const productSchema = z
  .object({
    category_id: z.coerce.number().int().optional(),
    reference: z.string().min(1, "La référence est requise.").max(255),
    name: z.string().min(1, "Le nom est requis.").max(255),
    slug: z.string().min(1, "Le slug est requis.").max(255),
    description: z.string().optional().or(z.literal("")),
    status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
    is_sensitive: z.boolean(),
    sensitivity_reason: z.string().optional().or(z.literal("")),
    default_unit_id: z.coerce.number().int().optional(),
    default_weight_kg: z.coerce.number().optional(),
    default_volume_cbm: z.coerce.number().optional(),
    min_order_quantity: z.coerce.number().int().min(1).optional(),
    brand: z.string().max(255).optional().or(z.literal("")),
    country_of_origin_id: z.coerce.number().int().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.is_sensitive && !values.sensitivity_reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sensitivity_reason"],
        message: "Requis lorsque le produit est marqué comme sensible.",
      });
    }
  });

export type ProductSchema = z.infer<typeof productSchema>;
