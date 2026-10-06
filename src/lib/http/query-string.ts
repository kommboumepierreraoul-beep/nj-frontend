/**
 * Sérialise un objet de filtres en query string, en omettant les valeurs
 * vides/`undefined` (une valeur de filtre à choix fermé absente doit rester
 * absente de l'URL, pas envoyée comme chaîne vide — § 4.2). Utilisé par tous
 * les modules pour construire leurs endpoints de liste paginée.
 */
export function toQueryString<T extends object>(params: T): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
