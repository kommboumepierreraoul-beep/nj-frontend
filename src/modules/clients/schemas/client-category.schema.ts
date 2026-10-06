import { z } from "zod";

/**
 * Le logo n'est plus une chaîne saisie ici (§ demande frontend : téléversement
 * réel de fichier, pas d'URL) — il est géré hors de ce schéma, en state local
 * (`File | null`) dans `ClientCategoryFormDialog`, et transmis à l'API via
 * `CreateClientCategoryPayload.badge_image`/`UpdateClientCategoryPayload.badge_image`.
 * La couleur est choisie via un `<input type="color">` (§ demande frontend :
 * plus de code couleur saisi manuellement) — toujours un hexadécimal 6
 * chiffres valide, d'où une valeur requise plutôt qu'optionnelle.
 */
export const clientCategorySchema = z.object({
  code: z.string().min(1, "Le code est requis.").max(255),
  label: z.string().min(1, "Le libellé est requis.").max(255),
  badge_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format hexadécimal attendu, ex. #F5C518."),
  description: z.string().optional().or(z.literal("")),
  sort_order: z.coerce.number().int().optional(),
  is_active: z.boolean(),
});

export type ClientCategorySchema = z.infer<typeof clientCategorySchema>;
