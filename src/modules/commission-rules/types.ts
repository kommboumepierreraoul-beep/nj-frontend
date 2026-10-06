import type { Currency } from "@/modules/reference-data/types";
import type { CommissionType } from "@/modules/sales-orders/types";

/**
 * Doc/spec_pages_commandes.md § 3 « Paramètres → Commissions » — barème par
 * défaut appliqué aux nouvelles commandes, éditable sans déploiement. Les
 * exceptions de commission par client (`clients.has_custom_commission`) ne
 * se gèrent pas ici, voir [[client_management]] : elles priment toujours sur
 * ce barème.
 */
export interface CommissionRule {
  id: number;
  label: string;
  min_amount: number;
  max_amount: number | null;
  commission_type: CommissionType;
  rate_or_amount: number;
  currency: Currency | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CommissionRulePayload {
  label: string;
  min_amount: number;
  max_amount?: number;
  commission_type: CommissionType;
  rate_or_amount: number;
  currency_id?: number;
  is_active?: boolean;
  sort_order?: number;
}
