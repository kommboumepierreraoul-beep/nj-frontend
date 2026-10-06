import { ChevronLeft, ChevronRight } from "lucide-react";
import { translate } from "@/i18n/translate";
import type { PaginationMeta } from "@/types/api";

/**
 * Pied de tableau paginé (§ 4.2), calqué sur NJ Global Trade Clients.dc.html
 * lignes 599-612 : légende de plage à gauche, "Précédent" / puce dorée du
 * numéro de page / "Suivant" à droite — jamais un simple "Page X sur Y".
 * `current_page`/`last_page`/`total` tels que renvoyés par l'API, jamais
 * recalculés côté client.
 */
export function Pagination({ meta, onPageChange }: { meta: PaginationMeta; onPageChange: (page: number) => void }) {
  if (meta.total === 0) return null;

  const from = (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-5 border-t border-border px-[18px] py-3.5">
      <p className="text-[12.5px] text-text-tertiary">
        {translate("state.pagination.range", { from, to, total: meta.total })}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
          className="flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-[8px] border-[1.5px] border-border bg-surface pr-3 pl-2 text-[12.5px] font-semibold text-muted-foreground hover:border-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-[17px] w-[17px]" />
          {translate("state.pagination.prev")}
        </button>
        <div className="flex h-[34px] min-w-[34px] items-center justify-center rounded-[8px] bg-accent px-2 text-[12.5px] font-bold text-accent-foreground tabular-nums">
          {meta.current_page}
        </div>
        <button
          type="button"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
          className="flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-[8px] border-[1.5px] border-border bg-surface pr-2 pl-3 text-[12.5px] font-semibold text-muted-foreground hover:border-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          {translate("state.pagination.next")}
          <ChevronRight className="h-[17px] w-[17px]" />
        </button>
      </div>
    </div>
  );
}
