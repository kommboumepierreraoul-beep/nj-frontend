import { z } from "zod";

/**
 * Doc/spec_pages_commandes.md § « Onglet Paiements — Enregistrer un
 * encaissement » — sert aussi à saisir un remboursement (maj 2026-08-18).
 * Le plafond du remboursement au net déjà encaissé n'est pas recalculé côté
 * client (dépend de l'historique complet des mouvements) : le message 422
 * renvoyé par l'API est affiché tel quel.
 */
export const recordPaymentSchema = z.object({
  direction: z.enum(["ENCAISSEMENT", "REMBOURSEMENT"]).optional(),
  amount: z.coerce.number().min(0.01, "Doit être supérieur à 0."),
  currency_id: z.coerce.number().int({ message: "La devise est requise." }),
  payment_method: z.enum(["ORANGE_MONEY", "VIREMENT_UBA", "WAVE", "MTN_MOMO", "ESPECES", "AUTRE"]),
  invoice_id: z.coerce.number().int().optional(),
  external_reference: z.string().max(255).optional().or(z.literal("")),
  paid_at: z.string().min(1, "La date de paiement est requise."),
  notes: z.string().optional().or(z.literal("")),
});

export type RecordPaymentSchema = z.infer<typeof recordPaymentSchema>;
