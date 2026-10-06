import type { Permission, UserRole } from "@/types/permissions";

/**
 * Types du module Gestion des utilisateurs & permissions
 * (Doc/spec_pages_utilisateurs.md, C1-D2). Le backend n'expose pas de
 * `UserResource` dédié à l'admin dans le code fourni (seul `AuthUser`, reflet
 * de `GET /auth/me`, est confirmé) : `AdminUser` reprend les mêmes champs et
 * ajoute `created_by` (§ C1 colonne « Créé par », § C2 « créé par ») —
 * interprétation raisonnable documentée ici plutôt qu'un champ inventé sans
 * source, à confirmer à l'implémentation réelle de `GET /api/users`.
 */
export interface UserCreatorSummary {
  id: number;
  full_name: string;
}

export interface AdminUser {
  id: number;
  full_name: string;
  name: string;
  email: string;
  google_id: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  permissions: Permission[];
  created_by: UserCreatorSummary | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserListFilters {
  search?: string;
  role?: UserRole;
  /** Tri-état « Tous/Actif/Inactif » (§ C1) — `undefined` = Tous. */
  is_active?: boolean;
  /** Filtre « mot de passe à changer » (§ C1). */
  must_change_password?: boolean;
  page?: number;
  per_page?: number;
}

/** § C3 — `POST /api/users`, déjà existant. */
export interface InviteUserPayload {
  full_name: string;
  email: string;
  role: UserRole;
}

/** § C4 — `PATCH /api/users/{id}`. `is_active` n'en fait pas partie : action séparée (§ Actions rapides). */
export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  role?: UserRole;
}

/** § Actions rapides — `PATCH /api/users/{id}/status`, réservé SUPER_ADMIN côté backend. */
export interface UpdateUserStatusPayload {
  is_active: boolean;
}

/**
 * § C2 « Permissions » — `PUT /api/users/{id}/permissions`. Forme du corps
 * non détaillée dans la spec : ensemble complet des codes de permissions
 * individuelles (au-delà de celles héritées du rôle), même logique de
 * remplacement intégral que `PUT /notification-preferences`.
 */
export interface UpdateUserPermissionsPayload {
  permissions: string[];
}

/** § D2 — `PUT /api/roles/{role}/permissions`. */
export interface UpdateRolePermissionsPayload {
  permissions: string[];
}
