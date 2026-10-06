"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi } from "../api/users.api";
import { ApiError } from "@/lib/http/api-error";
import type { InviteUserPayload, UpdateUserPayload, UpdateUserStatusPayload } from "../types";
import { translate } from "@/i18n/translate";

function invalidateList(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["users", "list"] });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteUserPayload) => usersApi.invite(payload),
    onSuccess: () => {
      invalidateList(queryClient);
      toast.success(translate("toast.invitationEnvoyee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.invitationImpossible")),
  });
}

export function useUpdateUser(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.update(id, payload),
    onSuccess: () => {
      invalidateList(queryClient);
      queryClient.invalidateQueries({ queryKey: ["users", "detail", id] });
      toast.success(translate("toast.utilisateurMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

/** § Actions rapides — réservé SUPER_ADMIN côté backend (décision §10.2). */
export function useUpdateUserStatus(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserStatusPayload) => usersApi.updateStatus(id, payload),
    onSuccess: (_data, payload) => {
      invalidateList(queryClient);
      queryClient.invalidateQueries({ queryKey: ["users", "detail", id] });
      toast.success(payload.is_active ? translate("toast.utilisateurReactive") : translate("toast.utilisateurDesactive"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.actionImpossible")),
  });
}

/** § Actions rapides — suppression définitive, réservée SUPER_ADMIN côté backend (décision §10.2). */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: () => {
      invalidateList(queryClient);
      toast.success(translate("toast.utilisateurSupprimeDefinitivement"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}

export function useResendInvitation() {
  return useMutation({
    mutationFn: (email: string) => usersApi.resendInvitation(email),
    onSuccess: () => toast.success(translate("toast.invitationRenvoyee")),
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.envoiImpossible")),
  });
}

/** § Actions rapides « Forcer la déconnexion » — révoque tous les tokens de l'utilisateur ciblé, accessible ADMIN et SUPER_ADMIN. */
export function useRevokeUserSessions() {
  return useMutation({
    mutationFn: (id: number) => usersApi.revokeSessions(id),
    onSuccess: () => toast.success(translate("toast.sessionsRevoqueesLUtilisateurDevraSeReconnecter")),
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.actionImpossible")),
  });
}
