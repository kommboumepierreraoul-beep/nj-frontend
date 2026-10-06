import { z } from "zod";

/** Doc/spec_pages_fournisseurs.md § 4, onglet « Fournisseurs sollicités ». */
export const rfqSupplierSchema = z.object({
  supplier_id: z.coerce.number().int({ message: "Le fournisseur est requis." }),
  status: z.enum(["PENDING", "RESPONDED", "DECLINED", "EXPIRED"]).optional(),
  sent_at: z.string().optional().or(z.literal("")),
  response_date: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type RfqSupplierSchema = z.infer<typeof rfqSupplierSchema>;
