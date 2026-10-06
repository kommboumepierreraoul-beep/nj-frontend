/**
 * Deux rôles réels côté backend (enum `UserRole`, voir auth_system.md) : rien
 * d'autre n'est assignable depuis l'API à ce jour. SUPER_ADMIN outrepasse
 * systématiquement toute permission individuelle.
 */
export type UserRole = "SUPER_ADMIN" | "ADMIN";

/**
 * Le catalogue des permissions est entièrement piloté par le backend
 * (`GET /admin/permissions`, page D1) — volontairement PAS un union type figé
 * ici, qui se périmerait à chaque permission ajoutée côté API (ex.
 * `flow_analytics.view` ajouté le 2026-08-26). Le code est toujours au format
 * `module.action` (ex. `clients.view`, `sales_orders.manage_payments`).
 */
export interface Permission {
  code: string;
  label: string;
  description: string | null;
}
