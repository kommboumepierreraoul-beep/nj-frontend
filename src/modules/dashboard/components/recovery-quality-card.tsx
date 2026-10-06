import { formatCurrency, formatPercent } from "@/lib/format";
import { translate } from "@/i18n/translate";
import { PAYMENT_STATUS_LABELS } from "@/modules/sales-orders/badges";
import { compactCurrency } from "../lib/compact";
import type { DashboardRecoveryQuality } from "../types";

const CIRCUMFERENCE = 2 * Math.PI * 15.9;

/** Teintes du donut alignées sur les tons de badge du statut de paiement. */
const STATUS_COLOR: Record<string, string> = {
  PAYEE: "var(--color-success)",
  PARTIELLEMENT_PAYEE: "var(--color-warning)",
  NON_PAYEE: "var(--color-destructive)",
};

/**
 * « Qualité du recouvrement » — NJ Global Trade Dashboard.dc.html lignes 547-577 :
 * anneau SVG multi-segments du chiffre d'affaires engagé réparti par statut de
 * paiement, taux recouvré au centre (= net encaissé + crédité par avoir sur CA
 * engagé), légende chiffrée, pied rappelant le montant crédité par avoir.
 */
export function RecoveryQualityCard({ data }: { data: DashboardRecoveryQuality }) {
  const segments = data.buckets
    .filter((bucket) => bucket.montant > 0)
    .reduce<{ key: string; color: string; dash: number; offset: number }[]>((acc, bucket) => {
      const consumed = acc.reduce((sum, segment) => sum + segment.dash, 0);
      const share = data.ca_engage_total > 0 ? (bucket.montant / data.ca_engage_total) * 100 : 0;
      acc.push({
        key: bucket.payment_status,
        color: STATUS_COLOR[bucket.payment_status] ?? "var(--color-neutral)",
        dash: (share / 100) * CIRCUMFERENCE,
        offset: -consumed,
      });
      return acc;
    }, []);

  return (
    <div className="flex flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex flex-col gap-0.5 border-b border-border px-5 py-4">
        <span className="text-[10px] font-bold tracking-[0.14em] text-text-tertiary uppercase">{translate("dashboard.recovery.title")}</span>
        <span className="text-xs text-text-tertiary text-pretty">{translate("dashboard.recovery.hint")}</span>
      </div>

      <div className="flex flex-1 flex-col items-center gap-[18px] p-5">
        <div className="relative h-[176px] w-[176px] shrink-0">
          <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-neutral-bg)" strokeWidth="6" />
            {segments.map((segment) => (
              <circle
                key={segment.key}
                cx="21"
                cy="21"
                r="15.9"
                fill="none"
                stroke={segment.color}
                strokeWidth="6"
                strokeDasharray={`${segment.dash} ${CIRCUMFERENCE - segment.dash}`}
                strokeDashoffset={segment.offset}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-[27px] leading-none font-extrabold tracking-[-0.03em] text-foreground tabular-nums">
              {formatPercent(data.taux_recouvre_pourcentage, 0)}
            </span>
            <span className="text-[9.5px] font-bold tracking-[0.12em] text-text-quaternary uppercase">{translate("dashboard.recovery.center")}</span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-[9px]">
          {data.buckets.map((bucket) => (
            <div key={bucket.payment_status} className="flex items-center gap-2.5">
              <span
                className="h-[9px] w-[9px] shrink-0 rounded-[3px]"
                style={{ background: STATUS_COLOR[bucket.payment_status] ?? "var(--color-neutral)" }}
              />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-muted-foreground">
                {PAYMENT_STATUS_LABELS[bucket.payment_status]} · {bucket.count} {translate("dashboard.recovery.orderShort")}
              </span>
              <span className="shrink-0 text-xs font-bold text-foreground tabular-nums">{compactCurrency(bucket.montant)}</span>
              <span className="w-[46px] shrink-0 text-right text-[11.5px] font-semibold text-text-quaternary tabular-nums">
                {formatPercent(bucket.part_pourcentage, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-muted/40 px-5 py-3 text-[11.5px] leading-[1.45] font-medium text-text-tertiary text-pretty">
        {translate("dashboard.recovery.footer", { montant: formatCurrency(data.credite_avoir_total) })}
      </div>
    </div>
  );
}
