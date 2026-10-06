/**
 * Référentiels transverses réutilisés par plusieurs modules (Clients,
 * Fournisseurs, Commandes, Produits) : pays, devises, étiquettes libres.
 * Pas de page de gestion dédiée pour pays/devises dans le plan du site (§ 3) —
 * uniquement des sélecteurs en lecture ; Tags a sa propre page côté module
 * Produits (`spec_pages_produits.md` § 6) mais le référentiel est partagé.
 */
export interface Country {
  id: number;
  name: string;
  iso_code: string;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  is_default: boolean;
}

/** Sélecteur "unité de mesure" (Doc/design_system_maquette_complete.md § 5.10, domaine Catalogue) — pas de page de gestion dédiée dans le plan du site, lecture seule ici. */
export interface Unit {
  id: number;
  name: string;
  code: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  products_count?: number;
}

export interface CreateTagPayload {
  name: string;
  slug?: string;
  color?: string;
}

export type UpdateTagPayload = Partial<CreateTagPayload>;
