import { z } from "zod";

/**
 * Doc/spec_pages_factures.md § 1.3 « Émettre un avoir ». Avoir total (par
 * défaut) : `items` non envoyé, l'API copie toutes les lignes du document
 * ciblé. Avoir partiel : lignes cochées avec quantité éditable — plafonnée
 * côté serveur à la quantité d'origine (non redéfini côté client).
 */
export const creditNoteItemSchema = z.object({
  invoice_item_id: z.coerce.number().int(),
  quantity: z.coerce.number().min(0.01).optional(),
});

export const creditNoteSchema = z.object({
  mode: z.enum(["TOTAL", "PARTIEL"]),
  items: z.array(creditNoteItemSchema).optional(),
  reason: z.string().optional().or(z.literal("")),
});

export type CreditNoteSchema = z.infer<typeof creditNoteSchema>;
