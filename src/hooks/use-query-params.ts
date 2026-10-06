"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Filtres pilotés par l'URL (§ 5 de Doc/frontend_architecture_structure.md :
 * "les filtres eux-mêmes vivent dans l'URL, jamais dans un state React isolé
 * — un rechargement de page ou un lien partagé doit reproduire exactement la
 * même vue"). Chaque hook de liste de module lit ses filtres via ce hook au
 * lieu d'un `useState` local.
 */
export function useQueryParams<T extends object>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultsMap = defaults as Record<string, string | number | undefined>;

  const values = useMemo(() => {
    const result = { ...defaultsMap };
    for (const key of Object.keys(defaultsMap)) {
      const raw = searchParams.get(key);
      if (raw !== null && raw !== "") {
        const defaultValue = defaultsMap[key];
        result[key] = typeof defaultValue === "number" ? Number(raw) : raw;
      }
    }
    return result as T;
  }, [defaultsMap, searchParams]);

  const setParams = useCallback(
    (patch: Partial<T>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch as Record<string, string | number | undefined>)) {
        if (value === undefined || value === null || value === "" || value === defaultsMap[key]) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [defaultsMap, pathname, router, searchParams],
  );

  return [values, setParams] as const;
}
