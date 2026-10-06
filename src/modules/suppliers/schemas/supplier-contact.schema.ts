import { z } from "zod";

/** Doc/spec_pages_fournisseurs.md § 2, onglet « Contacts ». */
export const supplierContactSchema = z.object({
  full_name: z.string().min(1, "Le nom complet est requis.").max(255),
  role_title: z.string().max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  wechat_id: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Format d'e-mail invalide.").max(255).optional().or(z.literal("")),
  is_primary: z.boolean(),
  notes: z.string().optional().or(z.literal("")),
});

export type SupplierContactSchema = z.infer<typeof supplierContactSchema>;
