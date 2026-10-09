"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";
import { useLocale, useT } from "@/i18n";
import { useLogout } from "@/modules/auth/hooks/use-logout";
import { useHasUnseenWhatsNew } from "@/components/onboarding/whats-new-modal";
import { NotificationBell } from "@/modules/notifications/components/notification-bell";
import { Avatar } from "@/components/data-display/avatar";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/config/routes";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { translate } from "@/i18n/translate";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super administrateur",
  ADMIN: "Administrateur",
};

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  return parts.length > 1 && first && last ? `${first.charAt(0)}. ${last}` : name;
}

interface AppHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenGuide: () => void;
  onOpenWhatsNew: () => void;
}

/**
 * En-tête calqué sur NJ Global Trade Dashboard.dc.html (lignes 44-77 pour le
 * markup, 126-180 pour la modale de profil). Recherche globale (⌘K) et Guide
 * (⌘/) sont de vrais composants (voir global-search-dialog.tsx,
 * guide-panel.tsx), montés par AppShell — au même titre que les
 * notifications (icône cloche, vrai composant du module Notifications,
 * Doc/spec_pages_notifications.md § 1). La bascule de thème clair/sombre est
 * active (Doc/theme_sombre_addendum.md) : `useUiStore.toggleTheme()` pose la
 * classe `dark` sur <html> et persiste le choix. Le sélecteur de langue FR/EN
 * s'appuie sur la couche i18n maison (`src/i18n/`).
 * La modale de profil ne garde que les champs réels de `UserResource` (le
 * template en propose d'autres — fonction, téléphone, préférences de
 * notification — qui n'existent pas côté API, voir
 * Doc/frontend_architecture_structure.md) et renvoie vers les pages « Mon
 * compte » (/account/profile, /account/security) pour toute modification.
 * Icônes lucide-react (sur demande explicite) ; bouton de menu mobile ajouté
 * pour la version responsive (absent du template, mockup desktop fixe).
 */
export function AppHeader({ onOpenMobileMenu, onOpenSearch, onOpenGuide, onOpenWhatsNew }: AppHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const router = useRouter();
  const t = useT();
  const { locale, setLocale } = useLocale();
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const hasUnseenWhatsNew = useHasUnseenWhatsNew();
  const [profileOpen, setProfileOpen] = useState(false);

  const fullName = user?.full_name || user?.name || "Utilisateur";
  const roleLabel = user ? ROLE_LABEL[user.role] ?? user.role : "";

  return (
    <>
      <header className="sticky top-0 z-20 flex h-[68px] min-w-0 shrink-0 items-center gap-3 overflow-hidden border-b border-border bg-surface pl-4 pr-3 md:gap-6 md:pl-9 md:pr-6">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          title={t("header.openMenu")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-foreground hover:bg-background md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative flex min-w-0 flex-1 items-center md:max-w-[460px]">
          <Search className="pointer-events-none absolute left-3 h-[18px] w-[18px] text-text-quaternary" />
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex h-[42px] w-full items-center justify-between gap-3 rounded-[10px] border-[1.5px] border-border bg-surface pl-9 pr-3.5 text-left text-[13.5px] text-text-quaternary hover:border-accent"
          >
            <span className="min-w-0 truncate">
              <span className="hidden sm:inline">Rechercher dans NJ Global Trade…</span>
              <span className="sm:hidden">Rechercher…</span>
            </span>
            <span className="hidden h-[22px] shrink-0 items-center rounded-[6px] border border-border bg-background px-[7px] text-[10.5px] font-semibold text-text-tertiary sm:flex">
              ⌘K
            </span>
          </button>
        </div>

        <div className="ml-auto flex min-w-0 flex-none items-center gap-2 md:gap-2.5">
          <div className="hidden h-10 shrink-0 items-center gap-1 rounded-full bg-[#111111] p-1 sm:flex dark:bg-[#26282d]">
            <NotificationBell />
            <button
              type="button"
              onClick={onOpenWhatsNew}
              title={t("whatsNew.badge")}
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-[#262626] dark:hover:bg-white/10"
            >
              <Sparkles className="h-[18px] w-[18px]" />
              {hasUnseenWhatsNew ? (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent ring-2 ring-[#111111] dark:ring-[#26282d]" />
              ) : null}
            </button>
            <button
              type="button"
              onClick={onOpenGuide}
              title={t("header.guide")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-[#262626] dark:hover:bg-white/10"
            >
              <HelpCircle className="h-[19px] w-[19px]" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              title={t("header.theme")}
              aria-pressed={theme === "dark"}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-[#262626] dark:hover:bg-white/10"
            >
              {theme === "dark" ? <Sun className="h-[19px] w-[19px]" /> : <Moon className="h-[19px] w-[19px]" />}
            </button>
            <button
              type="button"
              onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
              title={t("header.language")}
              className="hidden h-8 items-center rounded-full bg-[#262626] px-3 text-[11.5px] font-semibold tracking-[0.04em] text-white hover:bg-[#333333] sm:flex dark:bg-white/10 dark:hover:bg-white/[0.16]"
            >
              {locale.toUpperCase()}
            </button>
          </div>

          {/* Voyant de notifications toujours visible : la pastille de contrôles
              ci-dessus est masquée sous `sm`, donc la cloche y est reprise en
              autonome pour rester accessible sur mobile. */}
          <NotificationBell tone="plain" className="sm:hidden" />

          <button
            type="button"
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
            title={t("header.language")}
            aria-label={t("header.language")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-bold tracking-[0.04em] text-foreground hover:bg-background sm:hidden"
          >
            {locale.toUpperCase()}
          </button>

          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            title={t("header.profile")}
            className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full py-0 pl-0.5 pr-1.5 hover:bg-background sm:gap-2.5 sm:pr-2.5"
          >
            <Avatar name={fullName} src={user?.avatar_url} size={36} />
            <span className="hidden min-w-0 max-w-[130px] flex-col gap-[1px] overflow-hidden text-left sm:flex">
              <span className="truncate text-[12.5px] font-semibold leading-[1.2] text-foreground">
                {shortName(fullName)}
              </span>
              <span className="truncate text-[10px] font-semibold tracking-[0.1em] text-text-tertiary uppercase">
                {roleLabel}
              </span>
            </span>
            <ChevronDown className="hidden h-[18px] w-[18px] shrink-0 text-text-quaternary sm:block" />
          </button>
        </div>
      </header>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        {/* Modale « Gérer mon profil » calquée sur NJ Global Trade Dashboard.dc.html
            lignes 126-180 : panneau 660px, en-tête avatar/nom/rôle, corps en grille
            2 colonnes, carte de bascule de thème, pied avec « Se déconnecter » à gauche. */}
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.3)] sm:max-w-[660px]">
          <DialogTitle className="sr-only">Mon profil</DialogTitle>
          <DialogDescription className="sr-only">
            Coordonnées de votre compte, thème de l&apos;interface et déconnexion.
          </DialogDescription>

          <div className="flex flex-wrap items-center gap-[15px] border-b border-border px-5 py-[22px] sm:px-[26px]">
            <Avatar name={fullName} src={user?.avatar_url} size={54} />
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <div className="truncate text-[18px] font-bold tracking-[-0.015em] text-foreground">{fullName}</div>
              <div className="truncate text-[12.5px] text-text-tertiary">{user?.email}</div>
            </div>
            <span className="flex h-[26px] shrink-0 items-center rounded-full bg-accent-bg px-[11px] text-[11.5px] font-semibold text-link">
              {roleLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 px-5 py-[22px] sm:grid-cols-2 sm:px-[26px]">
            <ProfileField label="Nom complet" value={fullName} />
            <ProfileField label="Adresse e-mail" value={user?.email ?? "—"} />
            <ProfileField label="Rôle" value={roleLabel} />
            <ProfileField label="Statut" value={user?.is_active ? "Actif" : "Inactif"} />
            <ProfileField label={translate("t.methodeDeConnexion")} value={user?.google_id ? "Google + mot de passe" : "Mot de passe"} />
            <ProfileField
              label={translate("t.derniereConnexion")}
              value={user?.last_login_at ? formatDateTime(user.last_login_at) : "—"}
            />

            <button
              type="button"
              onClick={toggleTheme}
              className="col-span-1 flex items-center gap-3 rounded-[11px] border border-border bg-surface-subtle px-4 py-[14px] text-left hover:border-foreground sm:col-span-2"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 shrink-0 text-muted-foreground" /> : <Moon className="h-5 w-5 shrink-0 text-muted-foreground" />}
              <span className="min-w-0 flex-1 text-[12.5px] font-medium text-foreground">
                Thème de l&apos;interface — {theme === "dark" ? "Sombre" : "Clair"}
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-link">Basculer</span>
            </button>

            <p className="col-span-1 text-[11.5px] leading-[1.5] text-text-tertiary sm:col-span-2">
              Le nom et l&apos;e-mail ne sont modifiables que par un administrateur depuis la fiche utilisateur.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border px-5 pb-[22px] pt-4 sm:px-[26px]">
            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="flex h-[42px] items-center gap-2 rounded-[10px] border-[1.5px] border-destructive/30 bg-surface pl-3 pr-4 text-[13px] font-semibold text-destructive hover:bg-destructive-bg disabled:opacity-50"
            >
              <LogOut className="h-[19px] w-[19px]" />{t("header.logout")}</button>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  router.push(routes.account.security);
                }}
                className="flex h-[42px] items-center gap-1.5 rounded-[10px] border-[1.5px] border-border bg-surface px-4 text-[13px] font-semibold text-muted-foreground hover:border-foreground hover:text-foreground"
              >
                <ShieldCheck className="h-[15px] w-[15px]" />
                Sécurité & sessions
              </button>
              <Button type="button" variant="outline" onClick={() => setProfileOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9.5px] font-semibold tracking-[0.12em] text-text-tertiary uppercase">{label}</span>
      <div className="flex h-11 items-center truncate rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 text-[13.5px] font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}
