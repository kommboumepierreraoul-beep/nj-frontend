import type { Metadata } from "next";
import { ChangePasswordForm } from "@/modules/auth/components/change-password-form";
import { translate } from "@/i18n/translate";

export const metadata: Metadata = { title: "Changement de mot de passe — NJ Global Trade" };

/**
 * Page A5 : forcée par AuthGuard tant que `must_change_password` est vrai
 * (compte invité ou réinitialisé). Réutilise la coquille AppShell par défaut
 * pour l'instant — un layout minimal sans sidebar serait plus juste
 * (l'utilisateur ne devrait pas naviguer ailleurs avant d'avoir changé son
 * mot de passe) : à raffiner quand cette page sera reprise en détail.
 */
export default function ChangePasswordPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{translate("t.changementDeMotDePasseRequis")}</h1>
        <p className="text-sm text-muted-foreground">
          Votre mot de passe temporaire doit être remplacé avant de continuer.
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
