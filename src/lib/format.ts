/**
 * Formatage partagé par tous les modules. Devise par défaut = XOF (Franc CFA),
 * cohérent avec le marché de NJ Global Trade — à ajuster ici si un module a
 * besoin d'une autre devise, jamais en dupliquant `Intl.NumberFormat` ailleurs.
 *
 * Toutes les fonctions tolèrent `null` / `undefined` / valeur invalide et
 * renvoient un tiret cadratin plutôt qu'un « NaN » ou « Invalid Date » à
 * l'écran : les montants de l'API arrivent souvent sous forme de chaîne
 * (`decimal:2` d'Eloquent) ou absents (relation non chargée).
 */

import { getActiveLocale } from "@/i18n/locale";
import { translate } from "@/i18n/translate";

const DASH = "—";

/** Coerce une valeur numérique potentiellement chaîne/nulle en `number` fini, sinon `null`. */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function intlLocale(): string {
  return getActiveLocale() === "en" ? "en-US" : "fr-FR";
}

export function formatCurrency(amount: number | string | null | undefined, currency = "XOF"): string {
  const value = toNumber(amount);
  if (value === null) return DASH;
  try {
    return new Intl.NumberFormat(intlLocale(), { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    // Code devise inconnu d'Intl → repli sans style monétaire.
    return `${new Intl.NumberFormat(intlLocale()).format(value)} ${currency}`;
  }
}

/** Nombre localisé (séparateurs de milliers). `digits` = décimales fixes. */
export function formatNumber(value: number | string | null | undefined, digits = 0): string {
  const parsed = toNumber(value);
  if (parsed === null) return DASH;
  return new Intl.NumberFormat(intlLocale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(parsed);
}

/** Pourcentage : `formatPercent(33.333, 1)` → « 33,3 % ». */
export function formatPercent(value: number | string | null | undefined, digits = 0): string {
  const parsed = toNumber(value);
  if (parsed === null) return DASH;
  return `${parsed.toFixed(digits)} %`;
}

function toValidDate(value: string | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  const date = toValidDate(value);
  if (date === null) return DASH;
  return new Intl.DateTimeFormat(intlLocale(), options ?? { dateStyle: "medium" }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Horodatage relatif court — utilisé par le module Notifications (cloche +
 * liste). Au-delà de 6 jours bascule sur `formatDateTime`.
 */
export function formatRelativeTime(value: string | Date | null | undefined): string {
  const date = toValidDate(value);
  if (date === null) return DASH;

  const en = getActiveLocale() === "en";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return en ? "just now" : translate("t.aLInstant");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return en ? `${minutes} min ago` : `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return en ? `${hours} h ago` : `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return en ? `${days} d ago` : `il y a ${days} j`;
  return formatDateTime(date);
}
