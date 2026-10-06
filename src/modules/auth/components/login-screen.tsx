"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ChevronDown, Globe, Moon } from "lucide-react";
import { LoginForm } from "./login-form";
import { LoginBrandPanel } from "./login-brand-panel";
import { useLocale, useT } from "@/i18n";
import { translate } from "@/i18n/translate";

/**
 * Colonne droite de la page de connexion, rendue côté client pour que le
 * sélecteur de langue soit fonctionnel (bascule FR/EN + rechargement, même
 * mécanisme que l'en-tête applicatif). Le panneau de marque (colonne gauche)
 * reste un composant serveur — son texte est du contenu de maquette, hors
 * périmètre de traduction pour l'instant. La bascule de thème reste inerte
 * (aucune palette sombre définie).
 */
export function LoginScreen() {
  const t = useT();
  const { locale, setLocale } = useLocale();

  return (
    <div
      className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
      style={{ background: "#FCFCFA" }}
    >
      <LoginBrandPanel />

      <section
        className="relative isolate flex flex-col px-6 pb-14 pt-7 sm:px-16"
        style={{ background: "linear-gradient(200deg, #FDFDFB 0%, #FCFBF9 100%)" }}
      >
        <div className="flex flex-none items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-[9px] border-[1.5px] border-border px-3 hover:border-foreground"
          >
            <Globe className="h-[17px] w-[17px] text-muted-foreground" />
            <span className="text-[12.5px] font-semibold text-foreground">
              {locale === "fr" ? translate("badge.clients.clientLanguage.FR") : "English"}
            </span>
            <ChevronDown className="h-4 w-4 text-text-tertiary" />
          </button>
          <button
            type="button"
            title={t("login.toDark")}
            className="flex h-9 w-9 items-center justify-center rounded-[9px] border-[1.5px] border-border text-foreground transition-all duration-200 hover:rotate-[18deg] hover:border-accent hover:text-accent"
          >
            <Moon className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col items-start justify-center gap-[30px] py-8">
          <div className="flex flex-col gap-2.5" style={{ animation: "njRise 700ms cubic-bezier(.2,.7,.2,1) 120ms both" }}>
            <div className="text-[10px] font-semibold tracking-[0.18em] text-accent">{t("login.eyebrow")}</div>
            <h2 className="m-0 text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-[32px]">
              {t("login.heading")}
            </h2>
            <p className="m-0 text-[14px] leading-[1.5] text-muted-foreground text-pretty">
              {t("login.lead")}
            </p>
          </div>

          <div className="w-full" style={{ animation: "njRise 700ms cubic-bezier(.2,.7,.2,1) 220ms both" }}>
            <Suspense fallback={<p className="text-sm text-muted-foreground">{t("login.loading")}</p>}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="text-[12.5px] text-text-tertiary">
            {t("login.noAccount")} <span className="text-link">{t("login.contactAdmin")}</span>
          </p>
        </div>

        <div className="flex flex-none flex-wrap items-center justify-between gap-4 text-[10px] font-semibold tracking-[0.12em] text-text-quaternary">
          <div>© {new Date().getFullYear()} NJ GLOBAL TRADE CO. LTD</div>
          <div className="flex gap-5">
            <Link href="/politique-confidentialite" className="hover:text-foreground">{t("login.footerPrivacy")}</Link>
            <span>{t("login.footerSupport")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
