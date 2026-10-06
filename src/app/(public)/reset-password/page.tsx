import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form";
import { translate } from "@/i18n/translate";

export const metadata: Metadata = { title: "Réinitialisation du mot de passe — NJ Global Trade" };

/**
 * Aucun artboard dédié dans la maquette (seul NJ Global Trade Login.dc.html
 * existe pour l'authentification) : cet écran reprend le langage visuel du
 * panneau de connexion (fond, logo, typographie, eyebrow doré) pour rester
 * cohérent avec le reste du parcours d'authentification.
 */
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center px-6 pb-14 pt-10" style={{ background: "linear-gradient(200deg, #FDFDFB 0%, #FCFBF9 100%)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- logo statique, hors optimisation Next nécessaire */}
      <img src="/logo.png" alt="NJ Global Trade Co. Ltd" className="h-9 w-auto flex-none" />

      <div className="flex w-full max-w-[420px] flex-1 flex-col items-start justify-center gap-[26px] py-10">
        <div className="flex flex-col gap-2.5">
          <div className="text-[10px] font-semibold tracking-[0.18em] text-accent">{translate("t.authEyebrowReset")}</div>
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground">
            {translate("t.authResetTitle")}
          </h1>
        </div>

        <div className="w-full">
          <Suspense fallback={<p className="text-sm text-muted-foreground">{translate("state.loading")}</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>

      <div className="text-[10px] font-semibold tracking-[0.12em] text-text-quaternary">
        © {new Date().getFullYear()} NJ GLOBAL TRADE CO. LTD
      </div>
    </div>
  );
}
