import { z } from "zod";
import { salesOrderItemSchema } from "./sales-order-item.schema";

/**
 * Doc/spec_pages_commandes.md § 1 « Formulaire Nouvelle commande » — la
 * commande et ses lignes se créent en une seule fois (création imbriquée).
 * Le `type` pilote uniquement l'affichage/le verrouillage de la section
 * Lignes côté composant (`item_type` verrouillé selon `type`, voir la note
 * « item_type » de la spec) ; la validation zod reste la même pour les 3
 * types, au moins une ligne étant toujours requise.
 */
export const salesOrderSchema = z.object({
  client_id: z.coerce.number().int({ message: "Le client est requis." }),
  type: z.enum(["PRODUIT_UNIQUE_MULTI_CHOIX", "MULTI_PRODUITS", "PRESTATION_SERVICE"]),
  currency_id: z.coerce.number().int({ message: "La devise est requise." }),
  billing_mode: z.enum(["COMMISSION_VISIBLE", "PRIX_GLOBAL"]).optional(),
  discount_amount: z.coerce.number().min(0).optional(),
  // TVA (Doc/tva_addendum.md) — taux unique. Le champ du formulaire est pré-rempli avec
  // la valeur par défaut société ; 0 => aucune TVA.
  tax_rate: z.coerce.number().min(0).max(100).optional(),
  transport_mode: z.enum(["AERIEN_STANDARD", "AERIEN_SENSIBLE", "MARITIME", "NON_APPLICABLE"]).optional(),
  carrier_name: z.string().max(255).optional().or(z.literal("")),
  tracking_number: z.string().max(255).optional().or(z.literal("")),
  order_date: z.string().min(1, "La date de commande est requise."),
  validity_days: z.coerce.number().int().min(1).optional(),
  notes: z.string().optional().or(z.literal("")),
  internal_notes: z.string().optional().or(z.literal("")),
  items: z.array(salesOrderItemSchema).min(1, "Au moins une ligne est requise."),
});

export type SalesOrderSchema = z.infer<typeof salesOrderSchema>;
