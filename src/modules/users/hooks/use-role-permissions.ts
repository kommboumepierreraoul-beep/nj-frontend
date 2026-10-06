"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rolePermissionsApi } from "../api/permissions.api";
import { ApiError } from "@/lib/http/api-error";
import type { UserRole } from "@/types/permissions";
import type { UpdateRolePermissionsPayload } from "../types";
import { translate } from "@/i18n/translate";

/** § D2 — seul `ADMIN` s'interroge réellement ; `SUPER_ADMIN` est toujours coché côté interface, jamais requêté (contournement systématique côté backend). */
export function useRolePermissions(role: UserRole) {
  return useQuery({
    queryKey: ["roles", role, "permissions"],
    queryFn: () => rolePermissionsApi.get(role),
    select: (data) => data.data,
  });
}

export function useUpdateRolePermissions(role: UserRole) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRolePermissionsPayload) => rolePermissionsApi.update(role, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", role, "permissions"] });
      toast.success(translate("toast.permissionsDuRoleEnregistrees"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.enregistrementImpossible")),
  });
}
