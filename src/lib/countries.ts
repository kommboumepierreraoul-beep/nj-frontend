import countriesLib from "i18n-iso-countries";
import frLocale from "i18n-iso-countries/langs/fr.json";
import type { Country } from "@/modules/reference-data/types";

/**
 * `i18n-iso-countries` : table de référence ISO 3166-1 (codes + noms
 * localisés), utilisée ici pour deux choses seulement — valider un code
 * `iso_code` reçu du backend (`isValidCountryCode`) et, en dernier recours,
 * fournir un nom français si le backend n'en renvoie pas (`countryNameFr`).
 * Le nom affiché reste par défaut celui fourni par l'API (`Country.name`,
 * source de vérité, voir `modules/reference-data/types.ts`) — cette
 * bibliothèque ne le remplace jamais, elle ne fait que le sécuriser.
 */
countriesLib.registerLocale(frLocale);

export function isValidCountryCode(isoCode?: string | null): boolean {
  return isoCode ? countriesLib.isValid(isoCode) : false;
}

export function countryNameFr(isoCode?: string | null): string | undefined {
  if (!isoCode) return undefined;
  return countriesLib.getName(isoCode, "fr");
}

/**
 * Emoji drapeau à partir d'un code ISO 3166-1 alpha-2 (ex. "FR" → 🇫🇷) :
 * conversion Unicode standard (chaque lettre devient un "regional indicator
 * symbol"), la même technique que tout rendu de drapeau en emoji — ne
 * dépend d'aucune image ni police spécifique, juste de la police emoji du
 * système. `i18n-iso-countries` ne fournit pas de drapeaux ; c'est le
 * complément nécessaire pour un rendu "pays + drapeau" complet.
 */
export function countryFlagEmoji(isoCode?: string | null): string {
  if (!isoCode || !isValidCountryCode(isoCode)) return "🏳️";
  const codePoints = isoCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/** Rendu texte standard "drapeau + nom" utilisé partout où un pays est affiché en lecture seule (fiches, colonnes de tableau). */
export function formatCountryLabel(country?: Country | null): string {
  if (!country) return "—";
  return `${countryFlagEmoji(country.iso_code)} ${country.name}`;
}
