import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth.store";
import { ApiError } from "./api-error";
import { translate } from "@/i18n/translate";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Routes publiques (login, forgot-password, reset-password, google/*) : n'ajoute pas l'en-tête Authorization. */
  skipAuth?: boolean;
  timeoutMs?: number;
  /** Corps déjà prêt à l'emploi (FormData) : ne pas sérialiser en JSON ni forcer Content-Type (le navigateur pose la boundary multipart lui-même). Utilisé par l'upload de pièces jointes. */
  raw?: boolean;
}

const DEFAULT_TIMEOUT_MS = 15_000;
/** Les téléversements (pièces jointes, max 20 Mo — § 4.3) ont besoin de plus de marge que les appels JSON classiques. */
const UPLOAD_TIMEOUT_MS = 60_000;

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth = false, timeoutMs = DEFAULT_TIMEOUT_MS, headers, raw = false, ...rest } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  if (body !== undefined && !raw) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = useAuthStore.getState().token;
    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : raw ? (body as BodyInit) : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw ApiError.network(translate("t.leServeurMetTropDeTempsARepondre"));
    }
    throw ApiError.network();
  }
  clearTimeout(timeoutId);

  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const apiError = ApiError.fromResponse(response.status, payload, response.headers.get("Retry-After"));

    // Jeton invalide/expiré/compte désactivé détecté en cours de session : on
    // nettoie la session locale immédiatement. La redirection vers /login est
    // décidée par AuthGuard (qui observe isAuthenticated), pas ici, pour ne
    // pas coupler ce client HTTP générique à la navigation.
    if (apiError.kind === "unauthenticated" && !skipAuth) {
      useAuthStore.getState().clearSession();
    }

    throw apiError;
  }

  return payload as T;
}

/**
 * Client HTTP unique pour toute l'application : base URL, en-têtes, injection
 * du token et normalisation des erreurs vivent ici et nulle part ailleurs.
 * Chaque module ajoute ses propres fonctions dans `modules/<module>/api/*.ts`
 * en appelant `apiClient.get/post/put/patch/delete`, jamais `fetch` directement.
 */
export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
  /** POST multipart/form-data (téléversement de fichier — voir modules/attachments). */
  postForm: <T>(path: string, formData: FormData, options?: Omit<RequestOptions, "body" | "raw">) =>
    request<T>(path, { ...options, method: "POST", body: formData, raw: true, timeoutMs: options?.timeoutMs ?? UPLOAD_TIMEOUT_MS }),
};
