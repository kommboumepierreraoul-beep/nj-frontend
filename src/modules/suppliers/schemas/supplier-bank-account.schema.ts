import { z } from "zod";

/** Doc/spec_pages_fournisseurs.md § 2, onglet « Comptes bancaires ». */
export const supplierBankAccountSchema = z.object({
  method: z.enum(["ALIPAY", "WECHAT_PAY", "BANK_TRANSFER_CNY", "WESTERN_UNION", "CASH_CHINA", "OTHER"]),
  account_name: z.string().min(1, "Le nom du titulaire est requis.").max(255),
  account_number: z.string().min(1, "Le numéro est requis.").max(255),
  bank_name: z.string().max(255).optional().or(z.literal("")),
  swift_code: z.string().max(50).optional().or(z.literal("")),
  currency_id: z.coerce.number().int({ message: "La devise est requise." }),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export type SupplierBankAccountSchema = z.infer<typeof supplierBankAccountSchema>;
