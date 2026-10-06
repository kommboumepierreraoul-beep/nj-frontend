"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/data-display/error-state";
import { KpiCard } from "@/components/data-display/kpi-card";
import { InfoBanner } from "@/components/data-display/info-banner";
import { useFinancialFlow } from "../hooks/use-flow-reports";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { FlowAnalyticsFilters } from "../types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_analyse_flux.md § Onglet D « Flux financier ». */
export function FinancialFlowTab({ filters }: { filters: FlowAnalyticsFilters }) {
  const query = useFinancialFlow(filters, true);

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  if (query.isLoading || !query.data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  const report = query.data;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{translate("t.tresorerie")}</h3>
        <InfoBanner>
          Inclut les mouvements liés à des commandes annulées (un remboursement reste un mouvement de trésorerie réel) — à ne pas confondre avec le KPI « CA encaissé » du Tableau de bord, qui les exclut.
        </InfoBanner>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label={translate("field.encaisse")} value={formatCurrency(report.tresorerie.encaisse)} tone="success" />
          <KpiCard label={translate("field.rembourse")} value={formatCurrency(report.tresorerie.rembourse)} tone="destructive" />
          <KpiCard label={translate("field.net")} value={formatCurrency(report.tresorerie.net)} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{translate("t.exposition")}</h3>
        <p className="text-xs text-muted-foreground">{translate("t.instantaneIndependantDeLaPeriodeSelectionnee")}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label={translate("field.commandesEnAttente")} value={report.exposition.commandes_en_attente} />
          <KpiCard label={translate("field.montantEnAttente")} value={formatCurrency(report.exposition.montant_en_attente)} tone="warning" />
          <KpiCard label={translate("field.ancienneteMoyenne")} value={report.exposition.age_moyen_jours !== null ? `${report.exposition.age_moyen_jours} j` : "—"} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{translate("t.commission")}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <KpiCard label={translate("field.realisee")} value={formatCurrency(report.commission.realisee)} subtext="Commandes soldées sur la période." tone="success" />
          <KpiCard
            label={translate("field.theoriqueSurCommandesCreees")}
            value={formatCurrency(report.commission.theorique_sur_commandes_creees)}
            subtext={`Écart avec la commission réalisée = ${formatCurrency(Math.max(0, report.commission.theorique_sur_commandes_creees - report.commission.realisee))} restant à convertir.`}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{translate("t.avoirs")}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <KpiCard label={translate("field.avoirsEmis")} value={report.avoirs.count} />
          <KpiCard label={translate("field.montantTotal")} value={formatCurrency(report.avoirs.montant_total)} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{translate("t.margeEstimee")}</h3>
        <InfoBanner>{report.marge_estimee.methode}</InfoBanner>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label={translate("field.caProduitsEstime")} value={formatCurrency(report.marge_estimee.ca_produits_estime)} />
          <KpiCard label={translate("field.coutDAchatEstime")} value={formatCurrency(report.marge_estimee.cout_achat_estime)} />
          <KpiCard
            label={translate("field.margeEstimee")}
            value={formatCurrency(report.marge_estimee.marge_estimee)}
            subtext={`${formatPercent(report.marge_estimee.taux_marge_pourcentage, 1)} · ${report.marge_estimee.commandes_analysees} commande(s) analysée(s)`}
            tone={report.marge_estimee.marge_estimee >= 0 ? "success" : "destructive"}
          />
        </div>
        {report.marge_estimee.lignes_sans_cout_estime > 0 ? (
          <p className="text-xs text-muted-foreground">
            {report.marge_estimee.lignes_sans_cout_estime} ligne(s) sans prix fournisseur connu ont été exclues du coût estimé.
          </p>
        ) : null}
      </section>
    </div>
  );
}
