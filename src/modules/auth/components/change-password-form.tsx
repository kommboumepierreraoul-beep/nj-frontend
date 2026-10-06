"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { changePasswordSchema, type ChangePasswordSchema } from "../schemas/change-password.schema";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/http/api-error";
import { translate } from "@/i18n/translate";

export function ChangePasswordForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordSchema>({ resolver: zodResolver(changePasswordSchema) });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordSchema) => authApi.changePassword(values),
    onSuccess: () => {
      // L'API révoque déjà les autres jetons (voir AuthController::changePassword) ;
      // ici on met juste à jour le flag localement pour lever le blocage d'AuthGuard sans re-fetch.
      if (user) setUser({ ...user, must_change_password: false });
      toast.success(translate("toast.motDePasseModifie"));
      router.replace(routes.dashboard.home);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : translate("toast.echecModification"));
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="current_password">Mot de passe actuel</Label>
        <Input id="current_password" type="password" autoComplete="current-password" {...register("current_password")} />
        {errors.current_password && <p className="text-sm text-destructive">{errors.current_password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password_confirmation">{translate("t.confirmation")}</Label>
        <Input id="password_confirmation" type="password" autoComplete="new-password" {...register("password_confirmation")} />
        {errors.password_confirmation && (
          <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Enregistrement..." : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
