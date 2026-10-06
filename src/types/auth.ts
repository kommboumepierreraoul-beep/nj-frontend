/**
 * @deprecated Les types d'authentification vivent désormais dans le module
 * correspondant (`src/modules/auth/types.ts`), pas dans `src/types/` (réservé
 * au cross-cutting). Ce fichier ne fait que ré-exporter pour ne rien casser
 * si quelque chose l'importe encore ; à faire disparaître avec le temps.
 */
export type {
  AuthUser,
  AuthSessionResponse,
  ChangePasswordPayload,
  GoogleCallbackPayload,
  GoogleRedirectResponse,
  LoginPayload,
  ResetPasswordPayload,
  SessionItem,
} from "@/modules/auth/types";
export type { UserRole } from "@/types/permissions";
