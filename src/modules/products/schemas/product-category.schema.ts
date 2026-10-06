import { z } from "zod";

/**
 * Doc/spec_pages_produits.md § 1 — formulaire « Catégorie ».
 *
 * Le logo n'est plus une chaîne saisie ici (§ demande frontend : téléversement
 * réel de fichier, pas d'URL) — il est géré hors de ce schéma, en state local
 * (`File | null`) dans `ProductCategoryFormDialog`, et transmis à l'API via
 * `CreateProductCategoryPayload.image`/`UpdateProductCategoryPayload.image`.
 */
export const productCategorySchema = z.object({
  parent_id: z.coerce.number().int().optional(),
  name: z.string().min(1, "Le nom est requis.").max(255),
  slug: z.string().min(1, "Le slug est requis.").max(255),
  description: z.string().optional().or(z.literal("")),
  sort_order: z.coerce.number().int().optional(),
  is_active: z.boolean(),
});

export type ProductCategorySchema = z.infer<typeof productCategorySchema>;
