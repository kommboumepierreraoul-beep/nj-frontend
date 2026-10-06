import type { BadgeProps } from "@/components/ui/badge";
import type {
  CommunicationChannel,
  CommunicationDirection,
  SupplierDocumentType,
  SupplierPaymentMethod,
  SupplierReliability,
  SupplierVerificationMethod,
} from "./types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_fournisseurs.md § Badges de statut. */
export const SUPPLIER_RELIABILITY_LABELS: Record<SupplierReliability, string> = {
  get INCONNU() { return translate("badge.suppliers.supplierReliability.INCONNU"); },
  get FAIBLE() { return translate("badge.suppliers.supplierReliability.FAIBLE"); },
  get MOYEN() { return translate("badge.suppliers.supplierReliability.MOYEN"); },
  get BON() { return translate("badge.suppliers.supplierReliability.BON"); },
  get EXCELLENT() { return translate("badge.suppliers.supplierReliability.EXCELLENT"); },
};

export const SUPPLIER_RELIABILITY_TONES: Record<SupplierReliability, NonNullable<BadgeProps["tone"]>> = {
  INCONNU: "neutral",
  FAIBLE: "destructive",
  MOYEN: "warning",
  BON: "suppliers",
  EXCELLENT: "success",
};

/**
 * Couleur de remplissage de la barre de score de fiabilité (NJ Global Trade
 * Fournisseurs.dc.html ligne 383/519, `summary.scoreColor`/`cell.color`) —
 * dérivée du même niveau que le badge ci-dessus, jamais une couleur ad hoc.
 */
export const SUPPLIER_RELIABILITY_BAR_CLASSES: Record<SupplierReliability, string> = {
  INCONNU: "bg-neutral",
  FAIBLE: "bg-destructive",
  MOYEN: "bg-warning",
  BON: "bg-module-suppliers",
  EXCELLENT: "bg-success",
};

export const VERIFICATION_METHOD_LABELS: Record<SupplierVerificationMethod, string> = {
  get FACTORY_VISIT() { return translate("badge.suppliers.verificationMethod.FACTORY_VISIT"); },
  get VIDEO_CALL() { return translate("badge.suppliers.verificationMethod.VIDEO_CALL"); },
  get THIRD_PARTY_AUDIT() { return translate("badge.suppliers.verificationMethod.THIRD_PARTY_AUDIT"); },
  get DOCUMENTS_ONLY() { return translate("badge.suppliers.verificationMethod.DOCUMENTS_ONLY"); },
};

export const PAYMENT_METHOD_LABELS: Record<SupplierPaymentMethod, string> = {
  get ALIPAY() { return translate("badge.suppliers.paymentMethod.ALIPAY"); },
  get WECHAT_PAY() { return translate("badge.suppliers.paymentMethod.WECHAT_PAY"); },
  get BANK_TRANSFER_CNY() { return translate("badge.suppliers.paymentMethod.BANK_TRANSFER_CNY"); },
  get WESTERN_UNION() { return translate("badge.suppliers.paymentMethod.WESTERN_UNION"); },
  get CASH_CHINA() { return translate("badge.suppliers.paymentMethod.CASH_CHINA"); },
  get OTHER() { return translate("badge.suppliers.paymentMethod.OTHER"); },
};

export const DOCUMENT_TYPE_LABELS: Record<SupplierDocumentType, string> = {
  get BUSINESS_LICENSE() { return translate("badge.suppliers.documentType.BUSINESS_LICENSE"); },
  get CERTIFICATE_ISO() { return translate("badge.suppliers.documentType.CERTIFICATE_ISO"); },
  get CERTIFICATE_BSCI() { return translate("badge.suppliers.documentType.CERTIFICATE_BSCI"); },
  get FACTORY_AUDIT_REPORT() { return translate("badge.suppliers.documentType.FACTORY_AUDIT_REPORT"); },
  get OTHER() { return translate("badge.suppliers.documentType.OTHER"); },
};

export const COMMUNICATION_CHANNEL_LABELS: Record<CommunicationChannel, string> = {
  get WECHAT() { return translate("badge.suppliers.communicationChannel.WECHAT"); },
  get ALIBABA() { return translate("badge.suppliers.communicationChannel.ALIBABA"); },
  get WHATSAPP() { return translate("badge.suppliers.communicationChannel.WHATSAPP"); },
  get EMAIL() { return translate("badge.suppliers.communicationChannel.EMAIL"); },
  get PHONE() { return translate("badge.suppliers.communicationChannel.PHONE"); },
  get IN_PERSON() { return translate("badge.suppliers.communicationChannel.IN_PERSON"); },
  get OTHER() { return translate("badge.suppliers.communicationChannel.OTHER"); },
};

export const COMMUNICATION_DIRECTION_LABELS: Record<CommunicationDirection, string> = {
  get INCOMING() { return translate("badge.suppliers.communicationDirection.INCOMING"); },
  get OUTGOING() { return translate("badge.suppliers.communicationDirection.OUTGOING"); },
};
