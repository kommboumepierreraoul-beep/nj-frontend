"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RFQ_STATUS_LABELS } from "../badges";
import type { RfqListFilters } from "../types";
import { translate } from "@/i18n/translate";

const ALL = "__all__";

/** Barre de filtres (Doc/spec_pages_fournisseurs.md § 3), calquée sur NJ Global Trade Fournisseurs.dc.html lignes 409-442. */
export function RfqFilters({ filters, onChange }: { filters: RfqListFilters; onChange: (patch: Partial<RfqListFilters>) => void }) {
  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-surface p-[18px]">
      <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.filtres")}</span>
      <div className="flex items-center gap-2.5 overflow-x-auto md:flex-wrap md:overflow-visible [&>*]:shrink-0">
        <Select value={filters.status ?? ALL} onValueChange={(value) => onChange({ status: value === ALL ? undefined : (value as RfqListFilters["status"]) })}>
          <SelectTrigger className="w-[46vw] sm:w-48">
            <SelectValue placeholder={translate("ph.statut")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{translate("t.tousLesStatuts")}</SelectItem>
            {Object.entries(RFQ_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="hidden flex-1 md:block" />

        <button
          type="button"
          onClick={() => onChange({ status: undefined })}
          className="flex h-[46px] shrink-0 items-center rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 text-[13px] font-semibold text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
