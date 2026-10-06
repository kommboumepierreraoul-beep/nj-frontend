"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { routes } from "@/config/routes";
import { ApiError } from "@/lib/http/api-error";
import type { ResetPasswordPayload } from "../types";
import { translate } from "@/i18n/translate";

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
    onSuccess: () => {
      toast.success(translate("toast.motDePasseReinitialiseVousPouvezVousConnecter"));
      router.replace(routes.auth.login);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : translate("toast.echecReinitialisation"));
    },
  });
}
