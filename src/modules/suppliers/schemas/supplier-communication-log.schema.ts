import { z } from "zod";

/** Doc/spec_pages_fournisseurs.md § 2, onglet « Historique de communication ». */
export const supplierCommunicationLogSchema = z.object({
  channel: z.enum(["WECHAT", "ALIBABA", "WHATSAPP", "EMAIL", "PHONE", "IN_PERSON", "OTHER"]),
  direction: z.enum(["INCOMING", "OUTGOING"]),
  subject: z.string().max(255).optional().or(z.literal("")),
  summary: z.string().min(1, "Le résumé est requis."),
  attachment_id: z.coerce.number().int().optional(),
  occurred_at: z.string().min(1, "La date est requise."),
});

export type SupplierCommunicationLogSchema = z.infer<typeof supplierCommunicationLogSchema>;
