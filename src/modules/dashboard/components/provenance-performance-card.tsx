import { Globe2 } from "lucide-react";
import { formatCurrency, formatPercent, toNumber } from "@/lib/format";
import type { DashboardProvenancePerformance } from "../types";
import { translate } from "@/i18n/translate";

const BAR_COLORS = ["#E5A817", "#2E6B4F", "#6B4FBF", "#1F5FA9", "#16707E"];

/**
 * Carte 4 — « Performance par provenance » (§ Carte 4), calquée sur NJ Global
 * Trade Dashboard.dc.html lignes 468-496 : seules les provenances ayant au
 * moins une commande sur la période apparaissent — une liste courte n'est
 * pas une erreur, ne pas forcer l'affichage des 3 provenances du cahier des
 * charges §2.5 si l'une d'elles est absente.
 */
export function ProvenancePerformanceCard({
  items,
  periodLabel,
}: {
  items: DashboardProvenancePerformance[];
  periodLabel?: string;
}) {
  const total = items.reduce((sum, item) => sum + (toNumber(item.ca_total) ?? 0), 0);

  return (
    <div className="flex flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <span className="text-[10px] font-bold tracking-[0.14em] text-text-tertiary uppercase">{translate("t.performanceParProvenance")}</span>
        {periodLabel ? (
          <span className="inline-flex h-[24px] shrink-0 items-center whitespace-nowrap rounded-full bg-accent-bg px-[10px] text-[11px] font-semibold text-link">
            {periodLabel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-[13px] px-5 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-6 text-center">
            <Globe2 className="h-[30px] w-[30px] text-border" />
            <p className="text-[12.5px] text-muted-foreground text-pretty">
              Aucune commande sur la période choisie — une provenance sans commande n&apos;apparaît pas dans la liste.
            </p>
          </div>
        ) : (
          items.map((item, index) => {
            const share = total > 0 ? ((toNumber(item.ca_total) ?? 0) / total) * 100 : 0;
            return (
              <div key={item.category_code ?? "sans-categorie"} className="flex flex-col gap-[5px]">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[12.5px] font-semibold text-foreground">
                    {item.category_label || translate("t.sansCategorie")}
                  </span>
                  <span className="flex shrink-0 items-baseline gap-2">
                    <span className="text-[12.5px] font-bold text-foreground tabular-nums">{formatCurrency(item.ca_total)}</span>
                    <span className="text-[11.5px] font-semibold text-text-quaternary tabular-nums">{formatPercent(share, 0)}</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-bg">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${share}%`, backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                  />
                </div>
                <p className="text-[11px] text-text-quaternary">
                  {item.commandes_count} commande{item.commandes_count > 1 ? "s" : ""}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
