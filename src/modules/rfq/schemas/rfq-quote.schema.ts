import { z } from "zod";

/** Doc/spec_pages_fournisseurs.md § 4, sous-tableau « Devis ». */
export const rfqQuoteSchema = z.object({
  rfq_item_id: z.coerce.number().int({ message: "L'article est requis." }),
  quoted_unit_price: z.coerce.number().min(0, "Doit être positif."),
  currency_id: z.coerce.number().int({ message: "La devise est requise." }),
  quoted_moq: z.coerce.number().int().min(1).optional(),
  quoted_lead_time_days: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional().or(z.literal("")),
  quoted_at: z.string().min(1, "La date est requise."),
});

export type RfqQuoteSchema = z.infer<typeof rfqQuoteSchema>;
