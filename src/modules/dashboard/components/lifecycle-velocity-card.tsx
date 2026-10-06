import { Timer } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { translate } from "@/i18n/translate";
import { SALES_ORDER_STATUS_LABELS } from "@/modules/sales-orders/badges";
import type { SalesOrderStatus } from "@/modules/sales-orders/types";
import type { DashboardLifecycleVelocity } from "../types";

/**
 * « Vélocité du cycle de vie » — NJ Global Trade Dashboard.dc.html lignes 580-614 :
 * durée moyenne réelle entre deux étapes consécutives d'une commande, calculée
 * sur l'historique de statut (tout-historique). Barre proportionnelle à l'étape
 * la plus lente ; total du brouillon à la clôture en en-tête.
 */
export function LifecycleVelocityCard({ data }: { data: DashboardLifecycleVelocity }) {
  const max = Math.max(0.5, ...data.etapes.map((stage) => stage.jours_moyen));

  return (
    <div className="flex flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10px] font-bold tracking-[0.14em] text-text-tertiary uppercase">{translate("dashboard.velocity.title")}</span>
          <span className="text-xs text-text-tertiary text-pretty">
            {data.etapes.length > 0 ? translate("dashboard.velocity.hint") : translate("dashboard.velocity.hintEmpty")}
          </span>
        </div>
        {data.etapes.length > 0 ? (
          <div className="flex shrink-0 items-baseline gap-[7px]">
            <span className="text-[20px] font-extrabold tracking-[-0.02em] text-foreground tabular-nums">
              {formatNumber(data.total_jours, 1)}
            </span>
            <span className="text-[11.5px] font-semibold text-text-quaternary">{translate("dashboard.velocity.totalUnit")}</span>
          </div>
        ) : null}
      </div>

      {data.etapes.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 px-6 py-10 text-center">
          <Timer className="h-8 w-8 text-border" />
          <p className="text-[13px] font-medium text-muted-foreground">{translate("dashboard.velocity.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-4 p-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {data.etapes.map((stage) => {
            const label = `${SALES_ORDER_STATUS_LABELS[stage.from_status as SalesOrderStatus] ?? stage.from_status} → ${
              SALES_ORDER_STATUS_LABELS[stage.to_status as SalesOrderStatus] ?? stage.to_status
            }`;
            return (
              <div key={`${stage.from_status}-${stage.to_status}`} className="flex min-w-0 flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[12.5px] font-medium text-muted-foreground">{label}</span>
                  <span className="flex shrink-0 items-baseline gap-1">
                    <span className="text-[13px] font-bold text-accent-hover tabular-nums">{formatNumber(stage.jours_moyen, 1)}</span>
                    <span className="text-[10.5px] font-semibold text-text-quaternary">{translate("dashboard.velocity.dayShort")}</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-bg">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(stage.jours_moyen / max) * 100}%` }} />
                </div>
                <span className="text-[11px] text-text-quaternary">
                  {translate("dashboard.velocity.stageNote", { count: stage.commandes_count })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
