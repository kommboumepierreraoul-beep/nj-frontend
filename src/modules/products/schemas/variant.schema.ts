import { z } from "zod";

/** Doc/spec_pages_produits.md § 3 — formulaire « Variante ». */
export const variantSchema = z.object({
  sku: z.string().min(1, "Le SKU est requis.").max(255),
  barcode: z.string().max(255).optional().or(z.literal("")),
  name: z.string().min(1, "Le nom est requis.").max(255),
  level: z.enum(["PREMIER_CHOIX", "DEUXIEME_CHOIX", "TROISIEME_CHOIX", "STANDARD"]),
  description: z.string().optional().or(z.literal("")),
  purchase_price: z.coerce.number().min(0, "Doit être positif."),
  purchase_currency_id: z.coerce.number().int({ message: "La devise d'achat est requise." }),
  sale_price: z.coerce.number().min(0).optional(),
  sale_currency_id: z.coerce.number().int().optional(),
  margin_amount: z.coerce.number().optional(),
  margin_rate: z.coerce.number().optional(),
  estimated_weight_kg: z.coerce.number().optional(),
  estimated_volume_cbm: z.coerce.number().optional(),
  moq: z.coerce.number().int().min(1).optional(),
  is_recommended: z.boolean(),
  is_default: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().optional(),
  // Arguments repris automatiquement dans la proforma comparative
  // (Doc/proforma_comparatif_addendum.md) : saisis « un par ligne » dans le
  // formulaire, convertis en tableau à l'envoi.
  proforma_strengths: z.string().optional().or(z.literal("")),
  proforma_weaknesses: z.string().optional().or(z.literal("")),
  proforma_recommendation: z.string().max(2000).optional().or(z.literal("")),
});

export type VariantSchema = z.infer<typeof variantSchema>;
