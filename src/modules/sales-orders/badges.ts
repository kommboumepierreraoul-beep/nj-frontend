import type { BadgeProps } from "@/components/ui/badge";
import type {
  CommissionType,
  PaymentDirection,
  SalesOrderItemType,
  SalesOrderPaymentMethod,
  SalesOrderPaymentStatus,
  SalesOrderStatus,
  SalesOrderType,
  TransportMode,
} from "./types";
import { translate } from "@/i18n/translate";

/** Couleurs de badge (Doc/spec_pages_commandes.md § Badges) — un seul endroit pour tout le système (Dashboard, Commandes, Factures, Paiements). */
export const PAYMENT_STATUS_LABELS: Record<SalesOrderPaymentStatus, string> = {
  get NON_PAYEE() { return translate("badge.salesorders.paymentStatus.NON_PAYEE"); },
  get PARTIELLEMENT_PAYEE() { return translate("badge.salesorders.paymentStatus.PARTIELLEMENT_PAYEE"); },
  get PAYEE() { return translate("badge.salesorders.paymentStatus.PAYEE"); },
};

export const PAYMENT_STATUS_TONES: Record<SalesOrderPaymentStatus, NonNullable<BadgeProps["tone"]>> = {
  NON_PAYEE: "destructive",
  PARTIELLEMENT_PAYEE: "warning",
  PAYEE: "success",
};

export const SALES_ORDER_STATUS_LABELS: Record<SalesOrderStatus, string> = {
  get BROUILLON() { return translate("badge.salesorders.salesOrderStatus.BROUILLON"); },
  get PROFORMA_ENVOYEE() { return translate("badge.salesorders.salesOrderStatus.PROFORMA_ENVOYEE"); },
  get CONFIRMEE() { return translate("badge.salesorders.salesOrderStatus.CONFIRMEE"); },
  get EN_PREPARATION() { return translate("badge.salesorders.salesOrderStatus.EN_PREPARATION"); },
  get EXPEDIEE() { return translate("badge.salesorders.salesOrderStatus.EXPEDIEE"); },
  get LIVREE() { return translate("badge.salesorders.salesOrderStatus.LIVREE"); },
  get CLOTUREE() { return translate("badge.salesorders.salesOrderStatus.CLOTUREE"); },
  get ANNULEE() { return translate("badge.salesorders.salesOrderStatus.ANNULEE"); },
};

/**
 * Dégradé "gris → bleu → bleu foncé → orange → violet → violet foncé → vert /
 * rouge pour ANNULEE" de la spec, ramené aux tons génériques disponibles côté
 * badge (pas de teinte bleu/violet dédiée définie dans globals.css à ce jour
 * pour ce module — point à revoir si NJ Global Trade souhaite une distinction
 * plus fine que neutre/attention/succès/destructif).
 */
export const SALES_ORDER_STATUS_TONES: Record<SalesOrderStatus, NonNullable<BadgeProps["tone"]>> = {
  BROUILLON: "neutral",
  PROFORMA_ENVOYEE: "neutral",
  CONFIRMEE: "warning",
  EN_PREPARATION: "warning",
  EXPEDIEE: "warning",
  LIVREE: "success",
  CLOTUREE: "success",
  ANNULEE: "destructive",
};

export const PAYMENT_DIRECTION_LABELS: Record<PaymentDirection, string> = {
  get ENCAISSEMENT() { return translate("badge.salesorders.paymentDirection.ENCAISSEMENT"); },
  get REMBOURSEMENT() { return translate("badge.salesorders.paymentDirection.REMBOURSEMENT"); },
};

export const PAYMENT_DIRECTION_TONES: Record<PaymentDirection, NonNullable<BadgeProps["tone"]>> = {
  ENCAISSEMENT: "success",
  REMBOURSEMENT: "warning",
};

export const SALES_ORDER_TYPE_LABELS: Record<SalesOrderType, string> = {
  get PRODUIT_UNIQUE_MULTI_CHOIX() { return translate("badge.salesorders.salesOrderType.PRODUIT_UNIQUE_MULTI_CHOIX"); },
  get MULTI_PRODUITS() { return translate("badge.salesorders.salesOrderType.MULTI_PRODUITS"); },
  get PRESTATION_SERVICE() { return translate("badge.salesorders.salesOrderType.PRESTATION_SERVICE"); },
};

export const TRANSPORT_MODE_LABELS: Record<TransportMode, string> = {
  get AERIEN_STANDARD() { return translate("badge.salesorders.transportMode.AERIEN_STANDARD"); },
  get AERIEN_SENSIBLE() { return translate("badge.salesorders.transportMode.AERIEN_SENSIBLE"); },
  get MARITIME() { return translate("badge.salesorders.transportMode.MARITIME"); },
  get NON_APPLICABLE() { return translate("badge.salesorders.transportMode.NON_APPLICABLE"); },
};

export const PAYMENT_METHOD_LABELS: Record<SalesOrderPaymentMethod, string> = {
  get ORANGE_MONEY() { return translate("badge.salesorders.paymentMethod.ORANGE_MONEY"); },
  get VIREMENT_UBA() { return translate("badge.salesorders.paymentMethod.VIREMENT_UBA"); },
  get WAVE() { return translate("badge.salesorders.paymentMethod.WAVE"); },
  get MTN_MOMO() { return translate("badge.salesorders.paymentMethod.MTN_MOMO"); },
  get ESPECES() { return translate("badge.salesorders.paymentMethod.ESPECES"); },
  get AUTRE() { return translate("badge.salesorders.paymentMethod.AUTRE"); },
};

export const SALES_ORDER_ITEM_TYPE_LABELS: Record<SalesOrderItemType, string> = {
  get PRODUIT() { return translate("badge.salesorders.salesOrderItemType.PRODUIT"); },
  get SERVICE() { return translate("badge.salesorders.salesOrderItemType.SERVICE"); },
};

export const COMMISSION_TYPE_LABELS: Record<CommissionType, string> = {
  get POURCENTAGE() { return translate("badge.salesorders.commissionType.POURCENTAGE"); },
  get FORFAIT() { return translate("badge.salesorders.commissionType.FORFAIT"); },
};
