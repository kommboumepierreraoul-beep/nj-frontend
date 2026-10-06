import type { DashboardConversionRate } from "../types";
import { formatPercent, toNumber } from "@/lib/format";

/** Circonférence du cercle `r=15.9` utilisé par la maquette pour toutes ses jauges circulaires (rayon arbitraire qui donne un périmètre proche de 100, pratique pour un `stroke-dasharray` en pourcentage direct). */
const CIRCUMFERENCE = 2 * Math.PI * 15.9;

/**
 * Carte 3 — « Taux de transformation » (§ Carte 3), calquée sur NJ Global
 * Trade Dashboard.dc.html lignes 441-466 : jauge circulaire SVG (jamais une
 * barre linéaire), chiffre au centre, détail payées/non-annulées à droite.
 */
export function ConversionRateKpiCard({ rate, periodLabel }: { rate: DashboardConversionRate; periodLabel?: string }) {
  const percentage = Math.min(100, Math.max(0, toNumber(rate.taux_pourcentage) ?? 0));
  const dash = (percentage / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <span className="text-[10px] font-bold tracking-[0.14em] text-text-tertiary uppercase">Taux de transformation</span>
        {periodLabel ? (
          <span className="inline-flex h-[24px] shrink-0 items-center whitespace-nowrap rounded-full bg-accent-bg px-[10px] text-[11px] font-semibold text-link">
            {periodLabel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 items-center gap-[18px] px-5 py-[18px]">
        <div className="relative h-[116px] w-[116px] shrink-0">
          <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="#F2F2F2" strokeWidth="5" />
            <circle
              cx="21"
              cy="21"
              r="15.9"
              fill="none"
              strokeWidth="5"
              strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              style={{ stroke: "var(--color-success)" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[20px] font-extrabold tracking-[-0.03em] text-foreground tabular-nums">
            {formatPercent(rate.taux_pourcentage, 0)}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
          <div className="flex items-baseline gap-[5px]">
            <span className="text-[17px] font-bold text-success tabular-nums">{rate.commandes_payees}</span>
            <span className="text-xs text-muted-foreground">payée{rate.commandes_payees > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-baseline gap-[5px]">
            <span className="text-[17px] font-bold text-foreground tabular-nums">{rate.commandes_non_annulees}</span>
            <span className="text-xs text-muted-foreground">
              commande{rate.commandes_non_annulees > 1 ? "s" : ""} non annulée{rate.commandes_non_annulees > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
