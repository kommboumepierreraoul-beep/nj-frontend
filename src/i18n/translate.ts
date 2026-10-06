import { getActiveLocale } from "./locale";
import { messages } from "./messages";

/**
 * Traduction hors composant : `translate("nav.products")`,
 * `translate("greet", { name })` → « … {name} … ». Volontairement sans hook ni
 * « use client » — utilisable depuis la config, les utilitaires et les
 * composants serveur. Le changement de langue recharge la page, donc pas
 * besoin de réactivité ici ; `useT()` (voir ./index.tsx) sert quand on veut
 * forcer un re-render lié au contexte.
 */
export function translate(key: string, vars?: Record<string, string | number>): string {
  const locale = getActiveLocale();
  let value = messages[locale]?.[key] ?? messages.fr[key] ?? key;
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replace(`{${name}}`, String(replacement));
    }
  }
  return value;
}
