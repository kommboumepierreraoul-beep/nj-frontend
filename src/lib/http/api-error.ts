import type { ApiErrorBody } from "@/types/api";
import { translate } from "@/i18n/translate";

export type ApiErrorKind =
  | "validation" // 422 — voir errors[field]
  | "unauthenticated" // 401 — jeton absent/invalide/expiré (AuthenticateApiToken)
  | "locked" // 423 — compte verrouillé après échecs répétés (AuthController::login)
  | "forbidden" // 403 — compte désactivé, permission/rôle insuffisant, mdp à changer
  | "not_found" // 404
  | "rate_limited" // 429 — throttle Laravel
  | "server" // 5xx
  | "network" // fetch a levé (hors-ligne, timeout, CORS...)
  | "unknown";

interface ApiErrorParams {
  status: number;
  message: string;
  kind: ApiErrorKind;
  errors?: Record<string, string[]>;
  retryAfterSeconds?: number;
}

/**
 * Erreur normalisée pour TOUT appel API : plus jamais de `catch` qui inspecte
 * `error.response.status` à la main dans un composant. Les contrats exacts
 * (401 "Jeton invalide ou expire.", 423 "Compte temporairement verrouille...",
 * 422 {message, errors}) viennent d'une lecture directe d'AuthController.php /
 * AuthenticateApiToken.php le 2026-08-28 — voir Doc/frontend_architecture_structure.md.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly errors?: Record<string, string[]>;
  readonly retryAfterSeconds?: number;

  constructor(params: ApiErrorParams) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.kind = params.kind;
    this.errors = params.errors;
    this.retryAfterSeconds = params.retryAfterSeconds;
  }

  /** Premier message de validation (422) pour un champ de formulaire donné. */
  fieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }

  static fromResponse(status: number, body: unknown, retryAfterHeader: string | null): ApiError {
    const parsed = (body ?? {}) as Partial<ApiErrorBody>;
    const message = parsed.message ?? "Une erreur inattendue est survenue.";

    const kind: ApiErrorKind =
      status === 401
        ? "unauthenticated"
        : status === 423
          ? "locked"
          : status === 403
            ? "forbidden"
            : status === 404
              ? "not_found"
              : status === 422
                ? "validation"
                : status === 429
                  ? "rate_limited"
                  : status >= 500
                    ? "server"
                    : "unknown";

    return new ApiError({
      status,
      message,
      kind,
      errors: parsed.errors,
      retryAfterSeconds: retryAfterHeader ? Number(retryAfterHeader) : undefined,
    });
  }

  static network(message = translate("t.impossibleDeContacterLeServeurVerifiezVotreConnexi")): ApiError {
    return new ApiError({ status: 0, message, kind: "network" });
  }
}
