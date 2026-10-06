"use client";

import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordSchema } from "../schemas/reset-password.schema";
import { useResetPassword } from "../hooks/use-reset-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { translate } from "@/i18n/translate";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({ resolver: zodResolver(resetPasswordSchema) });

  if (!token || !email) {
    return <p className="text-sm text-destructive">{translate("t.lienDeReinitialisationInvalideOuIncomplet")}</p>;
  }

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => resetPassword.mutate({ ...values, token, email }))}
      noValidate
    >
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
      <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
        {resetPassword.isPending ? translate("t.reinitialisation") : translate("t.reinitialiserLeMotDePasse")}
      </Button>
    </form>
  );
}
