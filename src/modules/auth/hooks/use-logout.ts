"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { routes } from "@/config/routes";

export function useLogout() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // La session locale est effacée même si l'appel réseau échoue (jeton déjà
      // expiré côté serveur, par exemple) : l'utilisateur doit toujours pouvoir
      // se déconnecter localement.
      clearSession();
      router.replace(routes.auth.login);
    },
  });
}
