"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, Mail, Pencil, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/data-display/page-header";
import { TableSection } from "@/components/data-display/table-section";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/data-display/error-state";
import { InfoBanner } from "@/components/data-display/info-banner";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/modules/notifications/hooks/use-notification-preferences";
import { CATEGORY_HELP_TEXT, CATEGORY_ICON_BOX_CLASSES, CATEGORY_ICONS, CATEGORY_PREFERENCE_LABELS } from "@/modules/notifications/badges";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import type { NotificationCategory, NotificationPreference } from "@/modules/notifications/types";
import { translate } from "@/i18n/translate";

const CATEGORY_ORDER: NotificationCategory[] = ["COMMANDE", "ACHAT", "PAIEMENT", "RELANCE", "FLUX", "SECURITE"];

/**
 * Doc/spec_pages_notifications.md § 3 « Préférences de notification » —
 * ressource personnelle, un tableau à 6 lignes × case à cocher Email
 * uniquement (in-app toujours actif, pas de colonne). Un bouton
 * « Enregistrer » unique envoie les 6 lignes en une requête.
 */
export default function NotificationPreferencesPage() {
  const router = useRouter();
  const email = useAuthStore((state) => state.user?.email);
  const query = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  /**
   * Valeurs reçues de l'API, complétées à `false` pour toute catégorie
   * absente de la réponse. `overrides` ne garde que ce que l'utilisateur a
   * modifié localement depuis le chargement — fusionné par-dessus au rendu,
   * plutôt qu'une copie locale synchronisée via un effet (évite un
   * `setState` dans un effet pour une simple dérivation de données serveur).
   */
  const serverValues = useMemo(() => {
    const map: Record<NotificationCategory, boolean> = { COMMANDE: false, ACHAT: false, PAIEMENT: false, RELANCE: false, FLUX: false, SECURITE: false };
    for (const preference of query.data ?? []) {
      map[preference.category] = preference.email_enabled;
    }
    return map;
  }, [query.data]);
  const [overrides, setOverrides] = useState<Partial<Record<NotificationCategory, boolean>>>({});
  const emailEnabled = { ...serverValues, ...overrides };

  /** Catégories dont la valeur locale diffère de la dernière valeur enregistrée — pilote le badge « Modifié », le fond de ligne et l'activation des boutons Enregistrer/Annuler (NJ Global Trade Preferences Notifications.dc.html `dirtyKeys()`). */
  const dirtyCategories = CATEGORY_ORDER.filter((category) => emailEnabled[category] !== serverValues[category]);
  const isDirty = dirtyCategories.length > 0;
  const enabledCount = CATEGORY_ORDER.filter((category) => emailEnabled[category]).length;

  function handleSave() {
    const preferences: NotificationPreference[] = CATEGORY_ORDER.map((category) => ({ category, email_enabled: emailEnabled[category] }));
    updateMutation.mutate({ preferences });
  }

  function handleReset() {
    setOverrides({});
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Tableau de bord", href: routes.dashboard.home }, { label: "Mon espace" }, { label: translate("guide.p.preferencesDeNotification") }]}
        title={translate("page.notifPrefs.title")}
        badges={<Badge tone={enabledCount > 0 ? "warning" : "neutral"}>{enabledCount} / 6 par email</Badge>}
        description={translate("page.notifPrefs.desc")}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push(routes.notifications.list)}>
              <Bell className="h-4 w-4" />
              Mes notifications
            </Button>
            <Button onClick={handleSave} disabled={query.isLoading || updateMutation.isPending || !isDirty}>
              <Save className="h-4 w-4" />
              Enregistrer
            </Button>
          </>
        }
      />

      <InfoBanner>
        Vous recevrez toujours ces notifications dans l&apos;application (centre de notifications, toujours actif) — la case ci-dessous ajoute l&apos;envoi par email, elle ne le remplace pas.
      </InfoBanner>

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <TableSection
          title={translate("page.notifPrefs.section")}
          hint={translate("t.uneLigneParCategorieDeNotificationPersonnel")}
          action={
            email ? (
              <span className="flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-[11.5px] font-semibold text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {email}
              </span>
            ) : undefined
          }
        >
          <div className="grid grid-cols-[minmax(220px,1fr)_180px] gap-3.5 border-b border-border bg-surface-subtle px-[18px] py-2.5">
            <span className="text-[9px] font-bold tracking-[0.12em] text-text-quaternary uppercase">{translate("t.categorie")}</span>
            <span className="text-[9px] font-bold tracking-[0.12em] text-text-quaternary uppercase">{translate("t.email")}</span>
          </div>

          <div className="divide-y divide-[#F4F4F4]">
            {CATEGORY_ORDER.map((category) => {
              const Icon = CATEGORY_ICONS[category];
              const enabled = emailEnabled[category];
              const changed = enabled !== serverValues[category];
              return (
                <div key={category} className={cn("grid grid-cols-[minmax(220px,1fr)_180px] items-center gap-3.5 px-[18px] py-3.5", changed && "bg-accent-bg/40")}>
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={cn("flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]", CATEGORY_ICON_BOX_CLASSES[category])}>
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{CATEGORY_PREFERENCE_LABELS[category]}</span>
                        {changed ? <Badge tone="warning">{translate("t.modifie")}</Badge> : null}
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground text-pretty">{CATEGORY_HELP_TEXT[category]}</p>
                    </div>
                  </div>
                  <div
                    onClick={() => setOverrides((prev) => ({ ...prev, [category]: !enabled }))}
                    title={enabled ? translate("t.nePlusRecevoirCetteCategorieParEmail") : translate("t.recevoirAussiCetteCategorieParEmail")}
                    className={cn(
                      "flex h-11 w-full max-w-[170px] cursor-pointer items-center gap-2.5 rounded-[10px] border-[1.5px] px-3.5",
                      enabled ? "border-accent/40 bg-accent-bg/40" : "border-border bg-surface",
                    )}
                  >
                    <Switch checked={enabled} onCheckedChange={(value) => setOverrides((prev) => ({ ...prev, [category]: value }))} onClick={(event) => event.stopPropagation()} />
                    <span className={cn("text-xs font-semibold whitespace-nowrap", enabled ? "text-accent-hover" : "text-muted-foreground")}>{enabled ? translate("t.emailActive") : translate("t.emailDesactive")}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-background px-[18px] py-3.5">
            <div className="flex items-center gap-2">
              {isDirty ? <Pencil className="h-[15px] w-[15px] shrink-0 text-accent-hover" /> : <CheckCircle2 className="h-[15px] w-[15px] shrink-0 text-success" />}
              <p className={cn("text-xs font-medium", isDirty ? "text-accent-hover" : "text-success")}>
                {isDirty ? `${dirtyCategories.length} ligne${dirtyCategories.length > 1 ? "s" : ""} modifiée${dirtyCategories.length > 1 ? "s" : ""} et pas encore enregistrée(s).` : "Aucune modification en attente — l'état affiché est celui enregistré."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleReset} disabled={!isDirty}>
                <RotateCcw className="h-4 w-4" />
                Annuler les modifications
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending || !isDirty}>
                <Save className="h-4 w-4" />
                Enregistrer les 6 lignes
              </Button>
            </div>
          </div>
        </TableSection>
      )}

      <div className="flex items-start gap-2.5 px-0.5">
        <p className="text-xs leading-relaxed text-text-tertiary text-pretty">
          L&apos;enregistrement envoie toujours les six lignes ensemble ; il n&apos;existe pas de sauvegarde ligne par ligne. Les notifications déjà émises ne sont pas rejouées par email.
        </p>
      </div>
    </div>
  );
}
