"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { routes } from "@/config/routes";
import { ApiError } from "@/lib/http/api-error";
import { translate } from "@/i18n/translate";

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tokenId: number) => authApi.revokeSession(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
      toast.success(translate("toast.sessionRevoquee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.revocationImpossible")),
  });
}

/**
 * § B2 « Déconnecter tous les autres appareils » — point ouvert dans la spec
 * (« logout-all en excluant la session courante, ou révocation totale +
 * reconnexion si l'API ne distingue pas — à trancher avec le backend »).
 * En l'absence de confirmation que `POST /auth/logout-all` préserve la
 * session courante, hypothèse prudente retenue ici : révocation totale, donc
 * déconnexion locale immédiate + retour à l'écran de connexion plutôt que de
 * prétendre garder une session qui pourrait déjà être invalide côté serveur.
 */
export function useLogoutAllOtherDevices() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  return useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSuccess: () => {
      toast.success(translate("toast.tousLesAutresAppareilsOntEteDeconnectesMerciDeVousRe"));
      clearSession();
      router.replace(routes.auth.login);
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.actionImpossible")),
  });
}
