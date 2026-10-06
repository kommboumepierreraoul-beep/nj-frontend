import { getActiveLocale } from "@/i18n/locale";
import { toNumber } from "@/lib/format";

/**
 * Nombre compact « K / M » façon NJ Global Trade Dashboard.dc.html
 * (`compact()` / `compactUnit()`, lignes 820-826) — pour les axes de graphique
 * et les tuiles de synthèse où le montant complet nuirait à la lecture. NaN-safe
 * comme le reste de `@/lib/format`.
 */
function intlLocale(): string {
  return getActiveLocale() === "en" ? "en-US" : "fr-FR";
}

export function compactNumber(value: number | string | null | undefined): string {
  const v = toNumber(value);
  if (v === null) return "—";
  const abs = Math.abs(v);
  if (abs >= 1e6) return new Intl.NumberFormat(intlLocale(), { maximumFractionDigits: 1 }).format(v / 1e6);
  if (abs >= 1e3) return new Intl.NumberFormat(intlLocale(), { maximumFractionDigits: 0 }).format(v / 1e3);
  return new Intl.NumberFormat(intlLocale()).format(v);
}

export function compactUnit(value: number | string | null | undefined, base = "FCFA"): string {
  const abs = Math.abs(toNumber(value) ?? 0);
  if (abs >= 1e6) return `M ${base}`;
  if (abs >= 1e3) return `K ${base}`;
  return base;
}

/** `1 234 567` → « 1,2 M FCFA ». */
export function compactCurrency(value: number | string | null | undefined, base = "FCFA"): string {
  const v = toNumber(value);
  if (v === null) return "—";
  return `${compactNumber(v)} ${compactUnit(v, base)}`;
}
