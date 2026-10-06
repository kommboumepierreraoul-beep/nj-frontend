import { z } from "zod";

/** Doc/spec_pages_produits.md § 4, onglet « Historique des prix ». */
export const recordPriceSchema = z.object({
  supplier_id: z.coerce.number().int().optional(),
  price: z.coerce.number().min(0, "Doit être positif."),
  currency_id: z.coerce.number().int({ message: "La devise est requise." }),
  source: z.enum(["MANUAL", "RFQ", "SUPPLIER_UPDATE", "INVOICE"]),
  effective_date: z.string().min(1, "La date est requise."),
});

export type RecordPriceSchema = z.infer<typeof recordPriceSchema>;
