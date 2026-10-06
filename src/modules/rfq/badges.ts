import type { BadgeProps } from "@/components/ui/badge";
import type { RfqStatus, RfqSupplierStatus } from "./types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_fournisseurs.md § Badges de statut. */
export const RFQ_STATUS_LABELS: Record<RfqStatus, string> = {
  get BROUILLON() { return translate("badge.rfq.rfqStatus.BROUILLON"); },
  get ENVOYE() { return translate("badge.rfq.rfqStatus.ENVOYE"); },
  get REPONDU() { return translate("badge.rfq.rfqStatus.REPONDU"); },
  get EXPIRE() { return translate("badge.rfq.rfqStatus.EXPIRE"); },
  get ANNULE() { return translate("badge.rfq.rfqStatus.ANNULE"); },
};

export const RFQ_STATUS_TONES: Record<RfqStatus, NonNullable<BadgeProps["tone"]>> = {
  BROUILLON: "neutral",
  ENVOYE: "accent",
  REPONDU: "success",
  EXPIRE: "warning",
  ANNULE: "destructive",
};

export const RFQ_SUPPLIER_STATUS_LABELS: Record<RfqSupplierStatus, string> = {
  get PENDING() { return translate("badge.rfq.rfqSupplierStatus.PENDING"); },
  get RESPONDED() { return translate("badge.rfq.rfqSupplierStatus.RESPONDED"); },
  get DECLINED() { return translate("badge.rfq.rfqSupplierStatus.DECLINED"); },
  get EXPIRED() { return translate("badge.rfq.rfqSupplierStatus.EXPIRED"); },
};

export const RFQ_SUPPLIER_STATUS_TONES: Record<RfqSupplierStatus, NonNullable<BadgeProps["tone"]>> = {
  PENDING: "warning",
  RESPONDED: "success",
  DECLINED: "destructive",
  EXPIRED: "neutral",
};
