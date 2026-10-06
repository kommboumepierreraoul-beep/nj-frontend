"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_LOCALE, readStoredLocale, setActiveLocale, type Locale } from "./locale";
import { translate } from "./translate";

export { translate } from "./translate";

interface LocaleContextValue {
  locale: Locale;
  /** Change la langue et recharge : l'app repart proprement dans la nouvelle langue. */
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({ locale: DEFAULT_LOCALE, setLocale: () => {} });

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Synchronise le singleton de module (lu par lib/format.ts) avec la valeur
  // stockée, une seule fois côté client, avant le premier rendu des enfants.
  const [locale] = useState<Locale>(() => {
    if (typeof window === "undefined") return DEFAULT_LOCALE;
    const stored = readStoredLocale();
    setActiveLocale(stored);
    return stored;
  });

  const setLocale = useCallback((next: Locale) => {
    setActiveLocale(next);
    if (typeof window !== "undefined") window.location.reload();
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

/** Hook équivalent — force la dépendance au contexte pour re-render au changement de langue. */
export function useT(): typeof translate {
  useLocale();
  return translate;
}
