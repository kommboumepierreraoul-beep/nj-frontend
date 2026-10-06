import type { BadgeProps } from "@/components/ui/badge";
import type { PurchaseOrderStatus } from "./types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_fournisseurs.md § Badges de statut — workflow gris → bleu → violet → orange → cyan → vert → rouge. */
export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  get DRAFT() { return translate("badge.purchaseorders.purchaseOrderStatus.DRAFT"); },
  get SENT() { return translate("badge.purchaseorders.purchaseOrderStatus.SENT"); },
  get CONFIRMED() { return translate("badge.purchaseorders.purchaseOrderStatus.CONFIRMED"); },
  get IN_PRODUCTION() { return translate("badge.purchaseorders.purchaseOrderStatus.IN_PRODUCTION"); },
  get SHIPPED() { return translate("badge.purchaseorders.purchaseOrderStatus.SHIPPED"); },
  get RECEIVED() { return translate("badge.purchaseorders.purchaseOrderStatus.RECEIVED"); },
  get CANCELLED() { return translate("badge.purchaseorders.purchaseOrderStatus.CANCELLED"); },
};

export const PURCHASE_ORDER_STATUS_TONES: Record<PurchaseOrderStatus, NonNullable<BadgeProps["tone"]>> = {
  DRAFT: "neutral",
  SENT: "accent",
  CONFIRMED: "suppliers",
  IN_PRODUCTION: "warning",
  SHIPPED: "products",
  RECEIVED: "success",
  CANCELLED: "destructive",
};
