import { z } from "zod";

/**
 * Doc/spec_pages_commandes.md § 1 « Section Lignes » — utilisée à la fois pour
 * la création imbriquée (tableau `items` du formulaire commande, § 1) et pour
 * l'ajout d'une ligne depuis l'onglet Lignes (§2). `item_type` détermine quel
 * champ est requis (`product_variant_id` vs `label`), appliqué en `superRefine`
 * plutôt qu'un champ conditionnel côté zod natif.
 */
export const salesOrderItemSchema = z
  .object({
    item_type: z.enum(["PRODUIT", "SERVICE"]),
    product_variant_id: z.coerce.number().int().optional(),
    label: z.string().max(255).optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    quantity: z.coerce.number().min(0.01, "Doit être supérieure à 0."),
    unit_price: z.coerce.number().min(0, "Doit être positif."),
    discount_amount: z.coerce.number().min(0).optional(),
    is_proposed_option: z.boolean().optional(),
    is_selected: z.boolean().optional(),
    sourced_purchase_order_item_id: z.coerce.number().int().optional(),
    estimated_weight_kg: z.coerce.number().optional(),
    estimated_volume_cbm: z.coerce.number().optional(),
    notes: z.string().optional().or(z.literal("")),
    sort_order: z.coerce.number().int().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.item_type === "PRODUIT" && !values.product_variant_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["product_variant_id"], message: "La variante est requise pour une ligne produit." });
    }
    if (values.item_type === "SERVICE" && !values.label) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["label"], message: "Le libellé est requis pour une ligne prestation." });
    }
  });

export type SalesOrderItemSchema = z.infer<typeof salesOrderItemSchema>;
