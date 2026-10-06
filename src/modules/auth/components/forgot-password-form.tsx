"use client";

import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "../schemas/forgot-password.schema";
import { useForgotPassword } from "../hooks/use-forgot-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { translate } from "@/i18n/translate";

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({ resolver: zodResolver(forgotPasswordSchema) });

  if (forgotPassword.isSuccess) {
    return (
      <p className="text-sm text-muted-foreground">
        Si cet email correspond à un compte, un lien de réinitialisation vient d&apos;être envoyé.
      </p>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit((values) => forgotPassword.mutate(values.email))} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">{translate("t.email")}</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      {forgotPassword.isError && (
        <p role="alert" className="text-sm text-destructive">
          Échec de l&apos;envoi. Réessayez.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
        {forgotPassword.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi...
          </>
        ) : (
          "Envoyer le lien"
        )}
      </Button>
    </form>
  );
}
