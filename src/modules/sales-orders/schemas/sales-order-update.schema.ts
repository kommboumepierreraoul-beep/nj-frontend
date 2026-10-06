import { z } from "zod";

/** Doc/spec_pages_commandes.md § 1 « Formulaire Modifier la commande » — champs logistiques uniquement, montants/lignes gérés depuis la fiche (§2). */
export const salesOrderUpdateSchema = z.object({
  billing_mode: z.enum(["COMMISSION_VISIBLE", "PRIX_GLOBAL"]).optional(),
  transport_mode: z.enum(["AERIEN_STANDARD", "AERIEN_SENSIBLE", "MARITIME", "NON_APPLICABLE"]).optional(),
  estimated_weight_kg: z.coerce.number().optional(),
  estimated_volume_cbm: z.coerce.number().optional(),
  actual_weight_kg: z.coerce.number().optional(),
  actual_volume_cbm: z.coerce.number().optional(),
  carrier_name: z.string().max(255).optional().or(z.literal("")),
  tracking_number: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  internal_notes: z.string().optional().or(z.literal("")),
  // TVA ajustable tant que la commande vit (Doc/tva_addendum.md) — recalcule
  // tax_amount/total_amount. 0 => aucune TVA.
  tax_rate: z.coerce.number().min(0).max(100).optional(),
});

export type SalesOrderUpdateSchema = z.infer<typeof salesOrderUpdateSchema>;
