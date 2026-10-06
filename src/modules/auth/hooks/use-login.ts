"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { routes } from "@/config/routes";
import { ApiError } from "@/lib/http/api-error";
import type { LoginPayload } from "../types";
import { translate } from "@/i18n/translate";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setSession(data.user, data.access_token);

      if (data.user.must_change_password) {
        router.replace(routes.auth.changePassword);
        return;
      }

      const returnTo = searchParams.get("returnTo");
      router.replace(returnTo && returnTo.startsWith("/") ? returnTo : routes.dashboard.home);
    },
    onError: (error) => {
      // Les erreurs de champ (422) sont lues via `login.error` dans LoginForm ;
      // ce toast couvre les cas globaux (401 identifiants invalides, 423 verrouillé, 403 désactivé, réseau).
      toast.error(error instanceof ApiError ? error.message : translate("toast.connexionImpossible"));
    },
  });
}
