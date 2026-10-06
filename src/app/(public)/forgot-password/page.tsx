import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/modules/auth/components/forgot-password-form";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

export const metadata: Metadata = { title: "Mot de passe oublié — NJ Global Trade" };

/**
 * Aucun artboard dédié dans la maquette (seul NJ Global Trade Login.dc.html
 * existe pour l'authentification) : cet écran reprend le langage visuel du
 * panneau de connexion (fond, logo, typographie, ⌘-style eyebrow doré) pour
 * rester cohérent avec le reste du parcours d'authentification, plutôt que le
 * générique « carte grise centrée » précédent.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center px-6 pb-14 pt-10" style={{ background: "linear-gradient(200deg, #FDFDFB 0%, #FCFBF9 100%)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- logo statique, hors optimisation Next nécessaire */}
      <img src="/logo.png" alt="NJ Global Trade Co. Ltd" className="h-9 w-auto flex-none" />

      <div className="flex w-full max-w-[420px] flex-1 flex-col items-start justify-center gap-[26px] py-10">
        <div className="flex flex-col gap-2.5">
          <div className="text-[10px] font-semibold tracking-[0.18em] text-accent">{translate("t.authEyebrowForgot")}</div>
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground">
            {translate("t.authForgotTitle")}
          </h1>
          <p className="m-0 text-[14px] leading-[1.5] text-muted-foreground text-pretty">
            {translate("t.authForgotIntro")}
          </p>
        </div>

        <div className="w-full">
          <ForgotPasswordForm />
        </div>

        <Link href={routes.auth.login} className="flex items-center gap-1.5 text-[13px] font-medium text-link hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          {translate("t.authBackToLogin")}
        </Link>
      </div>

      <div className="text-[10px] font-semibold tracking-[0.12em] text-text-quaternary">
        © {new Date().getFullYear()} NJ GLOBAL TRADE CO. LTD
      </div>
    </div>
  );
}
