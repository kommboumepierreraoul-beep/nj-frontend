import type { Permission, UserRole } from "@/types/permissions";

/**
 * Reflète exactement `UserResource::toArray()` (app/Http/Resources/UserResource.php,
 * lu le 2026-08-28) — pas un type "idéal", le type réel renvoyé par l'API.
 */
export interface AuthUser {
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
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  device_name?: string;
}

/** Forme commune à la réponse de POST /auth/login et POST /auth/google/callback. */
export interface AuthSessionResponse {
  message: string;
  user: AuthUser;
  access_token: string;
  token_type: string;
}

export interface GoogleRedirectResponse {
  url: string;
  state: string;
}

export interface GoogleCallbackPayload {
  code: string;
  state: string;
  device_name?: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

/** Une entrée de GET /auth/sessions (page "Sécurité & sessions", B2). */
export interface SessionItem {
  id: number;
  name: string;
  is_current: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}
