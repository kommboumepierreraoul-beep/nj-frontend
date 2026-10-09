"use client";

import { CalendarDays, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardPeriod } from "../types";
import { translate } from "@/i18n/translate";

const OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: "day", label: "Jour" },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Filtres period/date (§ 1), calqués sur NJ Global Trade Dashboard.dc.html
 * lignes 368-381 : bandeau pleine largeur sous le titre (pas dans les
 * actions d'en-tête), sélecteur segmenté à 3 valeurs, date de référence,
 * légende lisible de la période active, bouton de réinitialisation à droite.
 */
export function PeriodFilter({
  period,
  date,
  caption,
  onChange,
}: {
  period: DashboardPeriod;
  date: string;
  caption?: string;
  onChange: (next: { period?: DashboardPeriod; date?: string }) => void;
}) {
  return (
    <div className="flex items-center gap-3.5 overflow-x-auto rounded-[14px] border border-border bg-surface p-3 md:flex-wrap md:overflow-visible md:p-4 [&>*]:shrink-0">
      <CalendarDays className="h-[19px] w-[19px] shrink-0 text-text-quaternary" />

      <div className="flex shrink-0 items-center gap-[3px] rounded-[10px] bg-background p-[3px]">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange({ period: option.value })}
            className={cn(
              "h-[34px] rounded-[8px] px-[18px] text-[12.5px] transition-opacity hover:opacity-85",
              period === option.value ? "bg-accent font-bold text-accent-foreground" : "bg-transparent font-semibold text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <input
        type="date"
        value={date}
        onChange={(event) => onChange({ date: event.target.value })}
        aria-label={translate("field.dateDeReference")}
        className="h-10 shrink-0 cursor-pointer rounded-[10px] border-[1.5px] border-border bg-surface px-3 text-[12.5px] font-medium text-foreground outline-none focus:border-accent"
      />

      {caption ? <span className="min-w-0 whitespace-nowrap text-[12.5px] font-medium text-muted-foreground">{caption}</span> : null}

      <div className="hidden flex-1 md:block" />

      <button
        type="button"
        onClick={() => onChange({ period: "month", date: todayIso() })}
        className="flex h-9 shrink-0 items-center gap-[7px] whitespace-nowrap rounded-[9px] border-[1.5px] border-border bg-surface px-3.5 text-[12.5px] font-semibold text-muted-foreground hover:border-foreground hover:text-foreground"
      >
        <RotateCcw className="h-[17px] w-[17px]" />
        Période courante
      </button>
    </div>
  );
}
