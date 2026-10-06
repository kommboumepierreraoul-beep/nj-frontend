import type { BadgeProps } from "@/components/ui/badge";
import type { InvoiceDocumentType, InvoiceStatus } from "./types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_factures.md § Badges — la couleur porte l'information la plus utile de la ligne (type de document plutôt que statut, presque toujours EMISE). */
export const INVOICE_DOCUMENT_TYPE_LABELS: Record<InvoiceDocumentType, string> = {
  get PROFORMA() { return translate("badge.invoices.invoiceDocumentType.PROFORMA"); },
  get FACTURE() { return translate("badge.invoices.invoiceDocumentType.FACTURE"); },
  get AVOIR() { return translate("badge.invoices.invoiceDocumentType.AVOIR"); },
  get RECU() { return translate("badge.invoices.invoiceDocumentType.RECU"); },
};

export const INVOICE_DOCUMENT_TYPE_TONES: Record<InvoiceDocumentType, NonNullable<BadgeProps["tone"]>> = {
  PROFORMA: "warning",
  FACTURE: "success",
  AVOIR: "destructive",
  RECU: "success",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  get EMISE() { return translate("badge.invoices.invoiceStatus.EMISE"); },
  get ENVOYEE() { return translate("badge.invoices.invoiceStatus.ENVOYEE"); },
  get ANNULEE() { return translate("badge.invoices.invoiceStatus.ANNULEE"); },
  get REMPLACEE() { return translate("badge.invoices.invoiceStatus.REMPLACEE"); },
};

export const INVOICE_STATUS_TONES: Record<InvoiceStatus, NonNullable<BadgeProps["tone"]>> = {
  EMISE: "success",
  ENVOYEE: "success",
  ANNULEE: "destructive",
  REMPLACEE: "neutral",
};
