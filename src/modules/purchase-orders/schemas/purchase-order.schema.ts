import { z } from "zod";

/**
 * Doc/spec_pages_fournisseurs.md § 5 — formulaire « Commande fournisseur ».
 * La règle "expected_delivery_date >= order_date" est appliquée en `superRefine`.
 */
export const purchaseOrderSchema = z
  .object({
    reference: z.string().max(255).optional().or(z.literal("")),
    supplier_id: z.coerce.number().int({ message: "Le fournisseur est requis." }),
    status: z.enum(["DRAFT", "SENT", "CONFIRMED", "IN_PRODUCTION", "SHIPPED", "RECEIVED", "CANCELLED"]).optional(),
    order_date: z.string().min(1, "La date de commande est requise."),
    expected_delivery_date: z.string().optional().or(z.literal("")),
    actual_delivery_date: z.string().optional().or(z.literal("")),
    currency_id: z.coerce.number().int({ message: "La devise est requise." }),
    notes: z.string().optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.expected_delivery_date && values.expected_delivery_date < values.order_date) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["expected_delivery_date"], message: "Doit être postérieure à la date de commande." });
    }
  });

export type PurchaseOrderSchema = z.infer<typeof purchaseOrderSchema>;
