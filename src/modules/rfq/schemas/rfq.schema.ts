import { z } from "zod";

/** Doc/spec_pages_fournisseurs.md § 3 — formulaire « RFQ ». */
export const rfqSchema = z.object({
  reference: z.string().max(255).optional().or(z.literal("")),
  status: z.enum(["BROUILLON", "ENVOYE", "REPONDU", "EXPIRE", "ANNULE"]).optional(),
  request_date: z.string().min(1, "La date de demande est requise."),
  expected_response_date: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type RfqSchema = z.infer<typeof rfqSchema>;
