import { z } from "zod";

/**
 * Doc/spec_pages_analyse_flux.md § 2 « Formulaire de création » —
 * `flow_type`/`stage_code` obligatoires et non modifiables après création
 * (verrouillés côté formulaire d'édition, pas ici : ce schéma sert aux deux
 * formulaires, la page décide quels champs afficher en lecture seule).
 */
export const flowStageThresholdSchema = z.object({
  flow_type: z.enum(["ACHAT", "VENTE", "ACTIVITE"]),
  stage_code: z.string().min(1, "L'étape est obligatoire."),
  label: z.string().min(1, "Le libellé est obligatoire."),
  threshold_type: z.enum(["DUREE_JOURS", "COMPTEUR"]),
  threshold_value: z.coerce.number().min(0, "La valeur doit être positive ou nulle."),
  is_active: z.boolean().optional(),
  sort_order: z.coerce.number().optional(),
});

export type FlowStageThresholdSchema = z.infer<typeof flowStageThresholdSchema>;
