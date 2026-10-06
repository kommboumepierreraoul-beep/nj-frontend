import { z } from "zod";

/** Doc/spec_pages_factures.md § 1.4 — mêmes champs/règles que « Enregistrer un encaissement », sans `invoice_id` (fixé automatiquement au document depuis lequel l'action est lancée). */
export const invoicePaymentSchema = z.object({
  direction: z.enum(["ENCAISSEMENT", "REMBOURSEMENT"]).optional(),
  amount: z.coerce.number().min(0.01, "Doit être supérieur à 0."),
  currency_id: z.coerce.number().int({ message: "La devise est requise." }),
  payment_method: z.enum(["ORANGE_MONEY", "VIREMENT_UBA", "WAVE", "MTN_MOMO", "ESPECES", "AUTRE"]),
  external_reference: z.string().max(255).optional().or(z.literal("")),
  paid_at: z.string().min(1, "La date de paiement est requise."),
  notes: z.string().optional().or(z.literal("")),
});

export type InvoicePaymentSchema = z.infer<typeof invoicePaymentSchema>;
