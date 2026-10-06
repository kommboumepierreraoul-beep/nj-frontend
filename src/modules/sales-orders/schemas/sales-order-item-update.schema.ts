import { z } from "zod";

/** Doc/spec_pages_commandes.md § 2 « Modifier une ligne » — `item_type`/`product_variant_id` non modifiables après création. */
export const salesOrderItemUpdateSchema = z.object({
  quantity: z.coerce.number().min(0.01, "Doit être supérieure à 0.").optional(),
  unit_price: z.coerce.number().min(0, "Doit être positif.").optional(),
  discount_amount: z.coerce.number().min(0).optional(),
  is_selected: z.boolean().optional(),
  notes: z.string().optional().or(z.literal("")),
  sort_order: z.coerce.number().int().optional(),
});

export type SalesOrderItemUpdateSchema = z.infer<typeof salesOrderItemUpdateSchema>;
