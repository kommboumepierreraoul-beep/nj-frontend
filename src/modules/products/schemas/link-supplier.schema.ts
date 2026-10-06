import { z } from "zod";

/** Doc/spec_pages_produits.md § 4, onglet « Fournisseurs liés ». */
export const linkSupplierSchema = z.object({
  supplier_id: z.coerce.number().int({ message: "Le fournisseur est requis." }),
  supplier_sku: z.string().max(255).optional().or(z.literal("")),
  unit_price: z.coerce.number().min(0, "Doit être positif."),
  currency_id: z.coerce.number().int({ message: "La devise est requise." }),
  moq: z.coerce.number().int().min(1).optional(),
  lead_time_days: z.coerce.number().int().min(0).optional(),
  is_preferred: z.boolean(),
  last_quoted_at: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type LinkSupplierSchema = z.infer<typeof linkSupplierSchema>;
