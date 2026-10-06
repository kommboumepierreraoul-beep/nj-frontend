import { AlertCircle, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import type { DashboardPendingInvoicesSummary } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Carte 2 — « Factures en attente » (§ Carte 2), calquée sur NJ Global Trade
 * Dashboard.dc.html lignes 420-439 : instantané, indépendant du filtre
 * period/date (d'où l'absence de pastille de période, remplacée par l'icône
 * "ouvrir"), cliquable vers la liste complète.
 */
export function PendingInvoicesKpiCard({ summary }: { summary: DashboardPendingInvoicesSummary }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(routes.dashboard.pendingInvoices)}
      className="flex cursor-pointer flex-col overflow-hidden rounded-[14px] border border-border bg-surface text-left transition-[border-color,box-shadow] hover:border-accent hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <span className="text-[10px] font-bold tracking-[0.14em] text-text-tertiary uppercase">Factures en attente</span>
        <ArrowUpRight className="h-[18px] w-[18px] shrink-0 text-text-quaternary" />
      </div>

      <div className="flex flex-1 flex-col gap-3.5 px-5 py-[18px]">
        <div className="flex items-baseline gap-2">
          <span className="text-[30px] leading-none font-extrabold tracking-[-0.03em] text-foreground tabular-nums">
            {summary.count}
          </span>
          <span className="text-xs font-semibold text-text-quaternary">{translate("t.commandeSNonSoldeeS")}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {summary.en_retard > 0 ? (
            <span className="inline-flex h-[28px] items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-destructive-bg px-3 text-xs font-semibold text-destructive">
              <AlertCircle className="h-4 w-4" />
              {summary.en_retard} en retard
            </span>
          ) : null}
          {summary.proche_echeance > 0 ? (
            <span className="inline-flex h-[28px] items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-warning-bg px-3 text-xs font-semibold text-warning">
              <Clock className="h-4 w-4" />
              {summary.proche_echeance} proche échéance
            </span>
          ) : null}
          {summary.en_retard === 0 && summary.proche_echeance === 0 ? (
            <span className="inline-flex h-[28px] items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-success-bg px-3 text-xs font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" />
              Aucune échéance critique
            </span>
          ) : null}
        </div>

        <p className="mt-auto text-[11.5px] leading-[1.45] text-text-tertiary text-pretty">
          Instantané à ce jour, indépendant de la période choisie. Aucune relance n&apos;est envoyée automatiquement —
          ouvrez la liste pour savoir qui contacter.
        </p>
      </div>
    </button>
  );
}
