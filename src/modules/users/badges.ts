import type { BadgeProps } from "@/components/ui/badge";
import type { UserRole } from "@/types/permissions";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_utilisateurs.md § 7 « Composants transverses ». */
export const ROLE_LABELS: Record<UserRole, string> = {
  get SUPER_ADMIN() { return translate("badge.users.role.SUPER_ADMIN"); },
  get ADMIN() { return translate("badge.users.role.ADMIN"); },
};

/** « SUPER_ADMIN (couleur distincte, ex. violet/or) vs ADMIN (couleur neutre) » — repris avec les tons disponibles du système de badges. */
export const ROLE_TONES: Record<UserRole, NonNullable<BadgeProps["tone"]>> = {
  SUPER_ADMIN: "accent",
  ADMIN: "neutral",
};

export function statusLabel(isActive: boolean): string {
  return isActive ? translate("value.active") : translate("value.inactive");
}

export function statusTone(isActive: boolean): NonNullable<BadgeProps["tone"]> {
  return isActive ? "success" : "destructive";
}

/** § 7 « Badge « Mot de passe à changer » » — point orange discret plutôt qu'un badge pleine largeur, réservé aux comptes jamais connectés. */
export const PASSWORD_PENDING_LABEL = translate("tooltip.pwChangePending");
