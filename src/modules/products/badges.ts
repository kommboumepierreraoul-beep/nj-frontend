import type { BadgeProps } from "@/components/ui/badge";
import type { AttributeInputType, PriceSource, ProductStatus, VariantLevel } from "./types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_produits.md § Badges de statut. */
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  get ACTIVE() { return translate("badge.products.productStatus.ACTIVE"); },
  get INACTIVE() { return translate("badge.products.productStatus.INACTIVE"); },
  get ARCHIVED() { return translate("badge.products.productStatus.ARCHIVED"); },
};

export const PRODUCT_STATUS_TONES: Record<ProductStatus, NonNullable<BadgeProps["tone"]>> = {
  ACTIVE: "success",
  INACTIVE: "neutral",
  ARCHIVED: "neutral",
};

/**
 * "Dégradé qualité (or/argent/bronze/neutre)" — ramené aux tons génériques les
 * plus proches faute de teintes or/argent/bronze dédiées dans le système de
 * design (même limitation que VALUE_SEGMENT côté Clients).
 */
export const VARIANT_LEVEL_LABELS: Record<VariantLevel, string> = {
  get PREMIER_CHOIX() { return translate("badge.products.variantLevel.PREMIER_CHOIX"); },
  get DEUXIEME_CHOIX() { return translate("badge.products.variantLevel.DEUXIEME_CHOIX"); },
  get TROISIEME_CHOIX() { return translate("badge.products.variantLevel.TROISIEME_CHOIX"); },
  get STANDARD() { return translate("badge.products.variantLevel.STANDARD"); },
};

export const VARIANT_LEVEL_TONES: Record<VariantLevel, NonNullable<BadgeProps["tone"]>> = {
  PREMIER_CHOIX: "accent",
  DEUXIEME_CHOIX: "products",
  TROISIEME_CHOIX: "warning",
  STANDARD: "neutral",
};

export const ATTRIBUTE_INPUT_TYPE_LABELS: Record<AttributeInputType, string> = {
  get TEXT() { return translate("badge.products.attributeInputType.TEXT"); },
  get NUMBER() { return translate("badge.products.attributeInputType.NUMBER"); },
  get SELECT() { return translate("badge.products.attributeInputType.SELECT"); },
  get BOOLEAN() { return translate("badge.products.attributeInputType.BOOLEAN"); },
  get COLOR() { return translate("badge.products.attributeInputType.COLOR"); },
};

export const PRICE_SOURCE_LABELS: Record<PriceSource, string> = {
  get MANUAL() { return translate("badge.products.priceSource.MANUAL"); },
  get RFQ() { return translate("badge.products.priceSource.RFQ"); },
  get SUPPLIER_UPDATE() { return translate("badge.products.priceSource.SUPPLIER_UPDATE"); },
  get INVOICE() { return translate("badge.products.priceSource.INVOICE"); },
};
