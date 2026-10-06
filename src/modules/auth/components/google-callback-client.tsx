"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import { useGoogleCallback } from "../hooks/use-google-auth";
import { routes } from "@/config/routes";
import { ApiError } from "@/lib/http/api-error";
import { translate } from "@/i18n/translate";

type Status = "validating" | "success" | "error";

const missingParamsMessage = () =>
  translate("t.parametresDeConnexionGoogleManquantsOuIncompletsRe");

/**
 * Reprend l'écran fourni dans Figma_design/Page de connexion google OK.png
 * (logo au-dessus d'une carte blanche centrée, icône + libellé) pour les 3
 * états du callback OAuth : validation en cours, succès (bref avant la
 * redirection), échec. Seul l'état de succès avait une maquette fournie ;
 * les états chargement/erreur en reprennent la structure et la palette.
 */
export function GoogleCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleCallback = useGoogleCallback();
  const hasStarted = useRef(false);
  // `code`/`state` viennent de l'URL, déjà disponibles au premier rendu : les
  // dériver ici (plutôt que dans l'effet ci-dessous) évite d'avoir à appeler
  // setState de façon synchrone dans un useEffect (react-hooks/set-state-in-effect
  // du React Compiler) pour le cas "paramètres manquants".
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const [status, setStatus] = useState<Status>(code && state ? "validating" : "error");
  const [errorMessage, setErrorMessage] = useState<string>(code && state ? "Connexion Google impossible." : missingParamsMessage());

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    if (!code || !state) return;

    googleCallback.mutate(
      { code, state },
      {
        onSuccess: (data) => {
          setStatus("success");
          const redirectTo = data.user.must_change_password ? routes.auth.changePassword : routes.dashboard.home;
          // Laisse l'écran "Connexion Réussie" visible un court instant avant de naviguer.
          window.setTimeout(() => router.replace(redirectTo), 900);
        },
        onError: (error) => {
          setErrorMessage(error instanceof ApiError ? error.message : "Connexion Google impossible.");
          setStatus("error");
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-10 px-4" style={{ background: "#FCFCFA" }}>
      <img src="/logo.png" alt="NJ Global Trade Co. Ltd" className="h-16 w-auto" />

      <div className="flex w-full max-w-[420px] flex-col items-center gap-5 rounded-[20px] bg-surface px-10 py-14 text-center shadow-[0_8px_32px_rgba(17,17,17,0.08)]">
        {status === "validating" && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-accent" strokeWidth={1.5} />
            <div className="flex flex-col gap-1.5">
              <div className="text-[22px] font-bold text-foreground">Connexion en cours</div>
              <p className="text-[13px] text-muted-foreground">
                Vérification de votre compte Google, un instant…
              </p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <CircleCheck className="h-16 w-16 text-accent" strokeWidth={1.5} />
            <div className="text-[22px] font-bold text-accent">{translate("t.connexionReussie")}</div>
          </>
        )}

        {status === "error" && (
          <>
            <CircleX className="h-16 w-16 text-destructive" strokeWidth={1.5} />
            <div className="flex flex-col gap-1.5">
              <div className="text-[22px] font-bold text-destructive">Connexion impossible</div>
              <p className="text-[13px] text-muted-foreground text-pretty">{errorMessage}</p>
            </div>
            <Link
              href={routes.auth.login}
              className="mt-2 flex h-11 items-center justify-center rounded-[10px] bg-accent px-6 text-[13.5px] font-bold text-accent-foreground hover:bg-accent-hover"
            >
              Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
