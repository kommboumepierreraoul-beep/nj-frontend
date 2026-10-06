"use client";

import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "../badges";
import type { NotificationCategory, NotificationListFilters, NotificationPriority } from "../types";
import { translate } from "@/i18n/translate";

const CATEGORIES: NotificationCategory[] = ["COMMANDE", "ACHAT", "PAIEMENT", "RELANCE", "FLUX", "SECURITE"];
const PRIORITIES: NotificationPriority[] = ["INFO", "IMPORTANT", "CRITIQUE"];

/**
 * Barre de filtres (Doc/spec_pages_notifications.md § 2), calquée sur NJ
 * Global Trade Notifications.dc.html lignes 358-380 : carte « FILTRES » avec
 * un select par filtre (valeurs hors énumération désactivées côté sélecteur
 * plutôt que saisissables — même règle que `period` Dashboard/Analyse des
 * flux), bouton « Réinitialiser » aligné à droite, note d'aide sous un filet
 * fin (même structure que AuditLogFilters/ProductFilters).
 */
export function NotificationFilters({ filters, onChange }: { filters: NotificationListFilters; onChange: (patch: Partial<NotificationListFilters>) => void }) {
  const hasActiveFilters = Boolean(filters.category || filters.priority || filters.read);

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-surface p-[18px]">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.filtres")}</p>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label>{translate("t.categorie")}</Label>
          <Select value={filters.category ?? "ALL"} onValueChange={(value) => onChange({ category: value === "ALL" ? undefined : (value as NotificationCategory) })}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder={translate("ph.toutesLesCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{translate("t.toutesLesCategories")}</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{translate("t.priorite")}</Label>
          <Select value={filters.priority ?? "ALL"} onValueChange={(value) => onChange({ priority: value === "ALL" ? undefined : (value as NotificationPriority) })}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={translate("ph.toutesLesPriorites")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{translate("t.toutesLesPriorites")}</SelectItem>
              {PRIORITIES.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Statut de lecture</Label>
          <Select value={filters.read || "ALL"} onValueChange={(value) => onChange({ read: value === "ALL" ? undefined : (value as "true" | "false") })}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder={translate("ph.toutes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{translate("t.toutes")}</SelectItem>
              <SelectItem value="false">{translate("t.nonLues")}</SelectItem>
              <SelectItem value="true">{translate("t.lues")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => onChange({ category: undefined, priority: undefined, read: undefined })}
          disabled={!hasActiveFilters}
          className="flex h-[46px] shrink-0 items-center rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 text-[13px] font-semibold text-muted-foreground hover:border-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Réinitialiser
        </button>
      </div>

      <div className="flex items-start gap-2.5 border-t border-border pt-3">
        <Info className="mt-px h-[15px] w-[15px] shrink-0 text-accent-hover" />
        <p className="text-xs leading-relaxed text-text-tertiary text-pretty">
          Les trois filtres sont des listes fermées : les valeurs hors énumération sont refusées par l&apos;API, elles ne sont donc pas proposées. Ils se combinent entre eux et remettent la
          pagination en première page.
        </p>
      </div>
    </div>
  );
}
