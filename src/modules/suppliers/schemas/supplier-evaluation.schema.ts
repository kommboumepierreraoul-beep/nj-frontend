import { z } from "zod";

/** Doc/spec_pages_fournisseurs.md § 2, onglet « Évaluations ». */
export const supplierEvaluationSchema = z.object({
  purchase_order_id: z.coerce.number().int().optional(),
  quality_score: z.coerce.number().int().min(1).max(5),
  communication_score: z.coerce.number().int().min(1).max(5),
  delay_respect_score: z.coerce.number().int().min(1).max(5),
  price_competitiveness_score: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional().or(z.literal("")),
  evaluated_at: z.string().min(1, "La date est requise."),
});

export type SupplierEvaluationSchema = z.infer<typeof supplierEvaluationSchema>;
