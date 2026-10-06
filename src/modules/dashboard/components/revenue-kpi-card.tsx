import { Percent } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { DashboardRevenue } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Carte 1 — « CA et commission » (§ Carte 1), calquée sur NJ Global Trade
 * Dashboard.dc.html lignes 385-418 : chiffre principal en vert (encaissé,
 * jamais confondu avec la valeur d'activité), encart violet dédié à la
 * commission, puis un pied de carte séparé par un trait pointillé pour les
 * commandes de la période (tous statuts de paiement). `ca_encaisse` et
 * `commandes_actives.montant_total` sont DEUX lectures différentes, jamais
 * additionnées — voir le point d'attention majeur de la spec.
 */
export function RevenueKpiCard({ revenue, periodLabel }: { revenue: DashboardRevenue; periodLabel?: string }) {
  const ca = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(revenue.ca_encaisse);

  return (
    <div className="flex flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <span className="text-[10px] font-bold tracking-[0.14em] text-text-tertiary uppercase">CA et commission</span>
        {periodLabel ? (
          <span className="inline-flex h-[24px] shrink-0 items-center whitespace-nowrap rounded-full bg-accent-bg px-[10px] text-[11px] font-semibold text-link">
            {periodLabel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3.5 px-5 py-[18px]">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-[7px]">
            <span className="text-[30px] leading-none font-extrabold tracking-[-0.03em] text-success tabular-nums">{ca}</span>
            <span className="text-xs font-semibold text-text-quaternary">{translate("t.fcfaEncaissesNet")}</span>
          </div>
          <p className="text-[12.5px] text-muted-foreground">
            sur {revenue.nombre_encaissements} encaissement{revenue.nombre_encaissements > 1 ? "s" : ""}
            {revenue.nombre_remboursements > 0 ? ` · ${revenue.nombre_remboursements} remboursement(s) déjà déduit(s)` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-[11px] bg-module-clients-bg px-3.5 py-3">
          <Percent className="h-[19px] w-[19px] shrink-0 text-module-clients" />
          <span className="min-w-0 flex-1 text-xs font-semibold text-module-clients">{translate("t.commissionRealisee")}</span>
          <span className="shrink-0 text-[15px] font-extrabold text-module-clients tabular-nums">
            {formatCurrency(revenue.commission_realisee)}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-dashed border-border pt-[13px]">
          <p className="text-[10px] font-bold tracking-[0.1em] text-text-quaternary text-pretty">
            COMMANDES DE LA PÉRIODE (TOUS STATUTS DE PAIEMENT)
          </p>
          <div className="flex flex-wrap items-baseline gap-4">
            <div className="flex items-baseline gap-[5px]">
              <span className="text-[17px] font-bold text-foreground tabular-nums">{revenue.commandes_actives.count}</span>
              <span className="text-[11.5px] text-text-tertiary">commande(s)</span>
            </div>
            <div className="flex items-baseline gap-[5px]">
              <span className="text-[17px] font-bold text-foreground tabular-nums">
                {formatCurrency(revenue.commandes_actives.montant_total)}
              </span>
              <span className="text-[11.5px] text-text-tertiary">de valeur totale</span>
            </div>
          </div>
          <p className="text-[11.5px] leading-[1.45] text-text-tertiary text-pretty">
            commission portée {formatCurrency(revenue.commandes_actives.commission_totale)}. Valeur d&apos;activité, à ne
            jamais additionner au CA encaissé.
          </p>
        </div>
      </div>
    </div>
  );
}
