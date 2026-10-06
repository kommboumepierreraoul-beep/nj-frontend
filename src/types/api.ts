/**
 * Enveloppes génériques communes à (quasi) tous les endpoints de l'API
 * nj-backend. Les types métier (Client, SalesOrder, Product...) vivent dans
 * le module correspondant (src/modules/<module>/types.ts), jamais ici.
 */

/** Réponse générique {message} — beaucoup d'actions (login, logout, delete...) ne renvoient que ça. */
export interface ApiMessage {
  message: string;
}

/**
 * Métadonnées de pagination Laravel standard (voir § 4.2 de
 * Doc/design_system_maquette_complete.md) : toute liste paginée les renvoie
 * telles quelles, `per_page` par défaut 20.
 */
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/** Forme d'une réponse de liste paginée côté API. */
export interface ApiCollection<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Forme d'une réponse à une seule ressource. */
export interface ApiResource<T> {
  data: T;
}

/** Corps JSON d'une erreur API (422 avec `errors`, ou simple `{message}` pour 401/403/423/429/5xx). */
export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}
