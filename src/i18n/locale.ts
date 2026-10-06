/**
 * Locale active de l'interface. Volontairement un simple singleton de module
 * (pas seulement un contexte React) : `lib/format.ts` et d'autres utilitaires
 * hors composant doivent pouvoir lire la locale sans hook. Le changement de
 * langue recharge la page (`setLocale` dans le provider) — l'app repart alors
 * proprement dans la nouvelle langue, sans état à moitié traduit.
 */
export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";
const STORAGE_KEY = "nj-locale";

let active: Locale = DEFAULT_LOCALE;

export function getActiveLocale(): Locale {
  return active;
}

export function setActiveLocale(locale: Locale): void {
  active = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // localStorage indisponible (SSR, navigation privée) — la locale reste en mémoire.
  }
}

export function readStoredLocale(): Locale {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "en" || value === "fr" ? value : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}
