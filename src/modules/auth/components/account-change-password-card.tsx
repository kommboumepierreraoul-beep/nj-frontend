"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { changePasswordSchema, type ChangePasswordSchema } from "../schemas/change-password.schema";
import { authApi } from "../api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/http/api-error";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_utilisateurs.md § B2 « Carte Changer mon mot de passe » — reste sur place après succès (contrairement à A5, qui redirige au tableau de bord après un changement obligatoire). */
export function AccountChangePasswordCard() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordSchema>({ resolver: zodResolver(changePasswordSchema) });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordSchema) => authApi.changePassword(values),
    onSuccess: () => {
      toast.success(translate("toast.motDePasseModifieVosAutresSessionsOntEteDeconnectees"));
      reset();
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.echecModification")),
  });

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">Changer mon mot de passe</h2>
      <p className="mt-1 text-xs text-muted-foreground">{translate("t.vosAutresSessionsSerontDeconnecteesApresLaModification")}</p>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
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
          {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>}
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Enregistrement..." : translate("t.mettreAJour")}
        </Button>
      </form>
    </div>
  );
}
