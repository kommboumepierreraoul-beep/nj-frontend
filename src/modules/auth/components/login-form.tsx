"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "../schemas/login.schema";
import { useLogin } from "../hooks/use-login";
import { useGoogleRedirect } from "../hooks/use-google-auth";
import { translate } from "@/i18n/translate";
import { ApiError } from "@/lib/http/api-error";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

/**
 * Formulaire calqué sur NJ Global Trade Login.dc.html (lignes 138-187) :
 * labels majuscules, champs 48px avec anneau doré au focus, bouton principal
 * doré avec flèche, case "se souvenir de moi" et bouton Google avec le SVG
 * réel du logo. Deux écarts assumés par rapport au template :
 *
 * - la case « Se souvenir de moi » reste purement visuelle (le jeton est
 *   toujours en localStorage, voir Doc/frontend_architecture_structure.md —
 *   pas de bascule localStorage/sessionStorage pour ne pas ajouter de portée
 *   non demandée à cette passe de mise en conformité visuelle) ;
 * - les erreurs de validation/API s'affichent sous chaque champ plutôt que
 *   nulle part dans le template (qui ne modélise pas les erreurs).
 */
export function LoginForm() {
  const login = useLogin();
  const googleRedirect = useGoogleRedirect();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

  const serverError = login.error instanceof ApiError ? login.error : null;

  return (
    <div className="flex w-full flex-col gap-[18px]">
      <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit((values) => login.mutate(values))} noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[11px] font-semibold tracking-[0.1em]" style={{ color: "#666666" }}>
            {translate("login.email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="manager@njglobaltrade.cm"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
            className={cn(
              "h-12 w-full rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 text-[14px] text-foreground outline-none",
              "transition-[border-color,box-shadow] duration-200 placeholder:text-text-quaternary",
              "focus:border-accent focus:shadow-[0_0_0_4px_rgba(229,168,23,0.16)]",
              "aria-[invalid=true]:border-destructive",
            )}
          />
          {errors.email && <p className="text-[12.5px] text-destructive">{errors.email.message}</p>}
          {serverError?.fieldError("email") && (
            <p className="text-[12.5px] text-destructive">{serverError.fieldError("email")}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-[11px] font-semibold tracking-[0.1em]" style={{ color: "#666666" }}>
              {translate("login.password")}
            </label>
            <Link href={routes.auth.forgotPassword} className="text-[12.5px] text-link hover:text-foreground">
              {translate("login.forgot")}
            </Link>
          </div>
          <div className="relative flex items-center">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
              className={cn(
                "h-12 w-full rounded-[10px] border-[1.5px] border-border bg-surface py-0 pl-3.5 pr-[46px] text-[14px] text-foreground outline-none",
                "transition-[border-color,box-shadow] duration-200 placeholder:text-text-quaternary",
                "focus:border-accent focus:shadow-[0_0_0_4px_rgba(229,168,23,0.16)]",
                "aria-[invalid=true]:border-destructive",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              title={showPassword ? translate("login.hidePassword") : translate("login.showPassword")}
              className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-hover hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-[19px] w-[19px]" /> : <Eye className="h-[19px] w-[19px]" />}
            </button>
          </div>
          {errors.password && <p className="text-[12.5px] text-destructive">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[10px] bg-accent text-[14px] font-bold tracking-[0.02em] text-accent-foreground shadow-[0_6px_18px_rgba(229,168,23,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_12px_28px_rgba(229,168,23,0.42)] disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {login.isPending ? translate("login.submitting") : translate("login.submit")}
          {!login.isPending && <ArrowRight className="h-[19px] w-[19px]" />}
        </button>

        <div
          onClick={() => setRemember((v) => !v)}
          className="flex cursor-pointer items-center gap-2.5 select-none"
        >
          <span
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px]"
            style={{ borderColor: remember ? "#E5A817" : "#D6D6D6", background: remember ? "#E5A817" : "transparent" }}
          >
            <Check className="h-[14px] w-[14px] text-accent-foreground" style={{ opacity: remember ? 1 : 0 }} />
          </span>
          <span className="text-[13px] font-medium" style={{ color: "#444444" }}>
            {translate("login.remember")}
          </span>
        </div>
      </form>

      <div className="flex flex-col gap-[18px] pt-1">
        <div className="flex items-center gap-3.5">
          <div className="h-px flex-1 bg-border" />
          <div className="whitespace-nowrap text-[10px] font-semibold tracking-[0.14em] text-text-tertiary">
            {translate("login.divider")}
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={() => googleRedirect.mutate()}
          disabled={googleRedirect.isPending}
          className="flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[10px] border-[1.5px] text-[14px] font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground hover:shadow-[0_10px_24px_rgba(17,17,17,0.08)] disabled:opacity-60"
          style={{ borderColor: "#E0E0E0" }}
        >
          <svg viewBox="0 0 48 48" className="h-[19px] w-[19px]" aria-hidden>
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
            <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
            <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
          </svg>
          {translate("login.google")}
        </button>
      </div>
    </div>
  );
}
