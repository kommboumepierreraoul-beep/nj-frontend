import { z } from "zod";

/** Doc/spec_pages_fournisseurs.md § 6 — formulaire « Article de commande ». */
export const purchaseOrderItemSchema = z.object({
  product_variant_id: z.coerce.number().int({ message: "La variante est requise." }),
  quantity: z.coerce.number().int().min(1, "Doit être au moins 1."),
  unit_price: z.coerce.number().min(0, "Doit être positif."),
  notes: z.string().optional().or(z.literal("")),
});

export type PurchaseOrderItemSchema = z.infer<typeof purchaseOrderItemSchema>;
