import { Activity, ShoppingCart, Truck, type LucideIcon } from "lucide-react";
import type { BadgeProps } from "@/components/ui/badge";
import type { FlowType, ThresholdType } from "./types";
import { translate } from "@/i18n/translate";

export const FLOW_TYPE_LABELS: Record<FlowType, string> = {
  get ACHAT() { return translate("badge.flowanalytics.flowType.ACHAT"); },
  get VENTE() { return translate("badge.flowanalytics.flowType.VENTE"); },
  get ACTIVITE() { return translate("badge.flowanalytics.flowType.ACTIVITE"); },
};

export const FLOW_TYPE_TONES: Record<FlowType, NonNullable<BadgeProps["tone"]>> = {
  ACHAT: "suppliers",
  VENTE: "clients",
  ACTIVITE: "accent",
};

/** Icône de badge « Flux » (NJ Global Trade Flux.dc.html, badges des lignes de goulots) — reprend les icônes déjà associées au module Fournisseurs/Commandes/Audit plutôt que d'en inventer de nouvelles. */
export const FLOW_TYPE_ICONS: Record<FlowType, LucideIcon> = {
  ACHAT: Truck,
  VENTE: ShoppingCart,
  ACTIVITE: Activity,
};

export const THRESHOLD_TYPE_LABELS: Record<ThresholdType, string> = {
  get DUREE_JOURS() { return translate("badge.flowanalytics.thresholdType.DUREE_JOURS"); },
  get COMPTEUR() { return translate("badge.flowanalytics.thresholdType.COMPTEUR"); },
};

export function formatByUnit(value: number, unit: "jours" | "occurrences"): string {
  return `${value} ${unit}`;
}

export function formatByThresholdType(value: number, type: ThresholdType): string {
  return `${value} ${type === "DUREE_JOURS" ? translate("unit.days") : translate("unit.occurrences")}`;
}
