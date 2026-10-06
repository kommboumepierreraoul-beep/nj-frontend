"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi } from "../api/users.api";
import { ApiError } from "@/lib/http/api-error";
import type { UpdateUserPermissionsPayload } from "../types";
import { translate } from "@/i18n/translate";

/** § C2 « Permissions » — remplacement intégral de l'ensemble des permissions individuelles de l'utilisateur ciblé. */
export function useUpdateUserPermissions(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPermissionsPayload) => usersApi.updatePermissions(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "detail", id] });
      toast.success(translate("toast.permissionsMisesAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}
