import type { ExportRow } from "@/lib/export";
import { formatDate, formatDateTime } from "@/lib/format";
import { ROLE_LABELS, statusLabel } from "./badges";
import type { AdminUser } from "./types";

/** Doc/spec_pages_utilisateurs.md § C1 — export de la liste des comptes filtrée. */
export function buildUsersListRows(users: AdminUser[]): ExportRow[] {
  const rows: ExportRow[] = [
    ["UTILISATEURS", `généré le ${formatDate(new Date())}`],
    [],
    ["Nom complet", "Email", "Rôle", "Statut", "Mot de passe à changer", "Dernière connexion", "Créé par"],
  ];

  for (const user of users) {
    rows.push([
      user.full_name,
      user.email,
      ROLE_LABELS[user.role],
      statusLabel(user.is_active),
      user.must_change_password ? "Oui" : "Non",
      user.last_login_at ? formatDateTime(user.last_login_at) : "Jamais connecté",
      user.created_by?.full_name ?? "",
    ]);
  }

  rows.push([]);
  rows.push(["TOTAL", `${users.length} compte(s)`]);
  return rows;
}
