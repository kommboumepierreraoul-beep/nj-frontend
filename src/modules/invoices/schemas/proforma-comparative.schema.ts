import { z } from "zod";

/**
 * Doc/proforma_comparatif_addendum.md § 1 + `ProformaController::
 * buildComparatifOptions()` + `resources/views/pdf/invoice_proforma_comparatif.
 * blade.php` — forme réelle de `proposal_details` : 3 niveaux (Premier/
 * Deuxième/Troisième choix), chacun avec « Points forts »/« Points d'attention »
 * (une entrée par ligne saisie, transformée en tableau par le dialogue —
 * `Invoice.php` caste `proposal_details` en `array`, le gabarit itère avec
 * `@foreach ... as $point`) et une recommandation en texte libre, plus un bloc
 * « Notes / conditions » à 4 champs fixes repris tels quels par le gabarit
 * (`notes.conditions_commerciales`/`delai_production`/`paiement`/
 * `douane_livraison`). Tout est facultatif : la commande peut n'avoir que 1 ou
 * 2 lignes proposées, et le formulaire peut rester vide (réémission possible
 * plus tard avec le contenu complété).
 */
export const proformaComparativeSchema = z.object({
  premier_choix_points_forts: z.string().optional().or(z.literal("")),
  premier_choix_points_attention: z.string().optional().or(z.literal("")),
  premier_choix_recommandation: z.string().optional().or(z.literal("")),
  deuxieme_choix_points_forts: z.string().optional().or(z.literal("")),
  deuxieme_choix_points_attention: z.string().optional().or(z.literal("")),
  deuxieme_choix_recommandation: z.string().optional().or(z.literal("")),
  troisieme_choix_points_forts: z.string().optional().or(z.literal("")),
  troisieme_choix_points_attention: z.string().optional().or(z.literal("")),
  troisieme_choix_recommandation: z.string().optional().or(z.literal("")),
  conditions_commerciales: z.string().optional().or(z.literal("")),
  delai_production: z.string().optional().or(z.literal("")),
  paiement: z.string().optional().or(z.literal("")),
  douane_livraison: z.string().optional().or(z.literal("")),
});

export type ProformaComparativeSchema = z.infer<typeof proformaComparativeSchema>;
