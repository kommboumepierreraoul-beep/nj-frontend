import type { BadgeProps } from "@/components/ui/badge";
import type { BillingMode, ClientLanguage, ClientStatus, ClientType, ValueSegment } from "./types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_clients.md § Badges de statut. */
export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  get PARTICULIER() { return translate("badge.clients.clientType.PARTICULIER"); },
  get ENTREPRISE() { return translate("badge.clients.clientType.ENTREPRISE"); },
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  get ACTIF() { return translate("badge.clients.clientStatus.ACTIF"); },
  get INACTIF() { return translate("badge.clients.clientStatus.INACTIF"); },
  get VIP() { return translate("badge.clients.clientStatus.VIP"); },
  get BLOQUE() { return translate("badge.clients.clientStatus.BLOQUE"); },
};

export const CLIENT_STATUS_TONES: Record<ClientStatus, NonNullable<BadgeProps["tone"]>> = {
  ACTIF: "success",
  INACTIF: "neutral",
  VIP: "accent",
  BLOQUE: "destructive",
};

/**
 * "Dégradé de valeur (bronze/argent/platine/violet ou doré pour VIP)" — le
 * système de design ne définit pas de teintes bronze/argent dédiées ; ramené
 * aux tons génériques les plus proches (neutre → module Clients violet → doré).
 */
export const VALUE_SEGMENT_LABELS: Record<ValueSegment, string> = {
  get BRONZE() { return translate("badge.clients.valueSegment.BRONZE"); },
  get ARGENT() { return translate("badge.clients.valueSegment.ARGENT"); },
  get PLATINE() { return translate("badge.clients.valueSegment.PLATINE"); },
  get VIP() { return translate("badge.clients.valueSegment.VIP"); },
};

export const VALUE_SEGMENT_TONES: Record<ValueSegment, NonNullable<BadgeProps["tone"]>> = {
  BRONZE: "neutral",
  ARGENT: "neutral",
  PLATINE: "clients",
  VIP: "accent",
};

export const BILLING_MODE_LABELS: Record<BillingMode, string> = {
  get COMMISSION_VISIBLE() { return translate("badge.clients.billingMode.COMMISSION_VISIBLE"); },
  get PRIX_GLOBAL() { return translate("badge.clients.billingMode.PRIX_GLOBAL"); },
};

export const CLIENT_LANGUAGE_LABELS: Record<ClientLanguage, string> = {
  get FR() { return translate("badge.clients.clientLanguage.FR"); },
  get EN() { return translate("badge.clients.clientLanguage.EN"); },
};
