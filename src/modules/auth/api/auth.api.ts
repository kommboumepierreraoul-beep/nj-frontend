import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import type { ApiMessage } from "@/types/api";
import type {
  AuthSessionResponse,
  AuthUser,
  ChangePasswordPayload,
  GoogleCallbackPayload,
  GoogleRedirectResponse,
  LoginPayload,
  ResetPasswordPayload,
  SessionItem,
} from "../types";

/**
 * Un appel = une fonction, chacune un miroir direct d'une méthode
 * d'AuthController/GoogleAuthController/PasswordResetController (lus le
 * 2026-08-28). Les hooks (../hooks/*) ne connaissent que ces fonctions,
 * jamais `apiClient`/`fetch` directement.
 */
export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthSessionResponse>(endpoints.auth.login, payload, {
      skipAuth: true,
    }),

  googleRedirect: () =>
    apiClient.get<GoogleRedirectResponse>(endpoints.auth.googleRedirect, {
      skipAuth: true,
    }),

  googleCallback: (payload: GoogleCallbackPayload) =>
    apiClient.post<AuthSessionResponse>(
      endpoints.auth.googleCallback,
      payload,
      { skipAuth: true },
    ),

  forgotPassword: (email: string) =>
    apiClient.post<ApiMessage>(
      endpoints.auth.forgotPassword,
      { email },
      { skipAuth: true },
    ),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<ApiMessage>(endpoints.auth.resetPassword, payload, {
      skipAuth: true,
    }),

  me: () => apiClient.get<{ user: AuthUser }>(endpoints.auth.me),

  logout: () => apiClient.post<ApiMessage>(endpoints.auth.logout),

  logoutAll: () => apiClient.post<ApiMessage>(endpoints.auth.logoutAll),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.post<ApiMessage>(endpoints.auth.changePassword, payload),

  sessions: () =>
    apiClient.get<{ data: SessionItem[] }>(endpoints.auth.sessions),

  revokeSession: (tokenId: number | string) =>
    apiClient.delete<ApiMessage>(endpoints.auth.revokeSession(tokenId)),
};
