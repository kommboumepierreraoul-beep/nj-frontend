"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { ApiError } from "@/lib/http/api-error";
import { translate } from "@/i18n/translate";

const STATE_STORAGE_KEY = "nj.auth.google_state";

/** Étape 1 : demande l'URL d'autorisation Google et redirige le navigateur. */
export function useGoogleRedirect() {
  return useMutation({
    mutationFn: () => authApi.googleRedirect(),
    onSuccess: ({ url, state }) => {
      window.sessionStorage.setItem(STATE_STORAGE_KEY, state);
      window.location.href = url;
    },
    onError: () => toast.error(translate("toast.connexionGoogleIndisponiblePourLeMoment")),
  });
}

/**
 * Étape 2 : appelée depuis la page /auth/google/callback avec le `code` et le
 * `state` reçus de Google en query params.
 *
 * ⚠️ Point de configuration backend requis (voir Doc/frontend_architecture_structure.md) :
 * `GOOGLE_REDIRECT_URI` (.env du backend) doit pointer vers cette page
 * frontend (`{NEXT_PUBLIC_APP_URL}/auth/google/callback`), pas vers
 * `nj-backend`. Google ne fait qu'une redirection GET avec `?code&state` en
 * query string — c'est cette page qui lit ces paramètres et les renvoie en
 * JSON à `POST /auth/google/callback`.
 *
 * Ne redirige pas elle-même : `GoogleCallbackClient` affiche un écran de
 * succès (voir Figma_design/Page de connexion google OK.png) pendant un
 * court instant avant de naviguer, plutôt qu'une redirection instantanée
 * comme le formulaire de connexion classique.
 */
export function useGoogleCallback() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string }) => {
      const expectedState = window.sessionStorage.getItem(STATE_STORAGE_KEY);
      window.sessionStorage.removeItem(STATE_STORAGE_KEY);

      // Protection CSRF du flux OAuth (voir auth_system.md) : le state renvoyé
      // par Google doit correspondre exactement à celui généré avant la redirection.
      if (!expectedState || expectedState !== state) {
        throw new ApiError({
          status: 0,
          kind: "unknown",
          message: translate("t.requeteDeConnexionGoogleInvalideOuExpireeReessayez"),
        });
      }

      return authApi.googleCallback({ code, state });
    },
    onSuccess: (data) => {
      setSession(data.user, data.access_token);
    },
  });
}
