"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/data-display/error-state";
import { KpiCard } from "@/components/data-display/kpi-card";
import { TableSection } from "@/components/data-display/table-section";
import { BarList, ConversionFunnel, type BarRow } from "./dynamic-status-table";
import { useSalesFlow } from "../hooks/use-flow-reports";
import { SALES_ORDER_STATUS_LABELS } from "@/modules/sales-orders/badges";
import type { SalesOrderStatus } from "@/modules/sales-orders/types";
import type { FlowAnalyticsFilters, SalesFlowReport } from "../types";
import { translate } from "@/i18n/translate";

const SALES_ORDER_STATUS_ORDER: SalesOrderStatus[] = [
  "BROUILLON",
  "PROFORMA_ENVOYEE",
  "CONFIRMEE",
  "EN_PREPARATION",
  "EXPEDIEE",
  "LIVREE",
  "CLOTUREE",
  "ANNULEE",
];
const FUNNEL_STATUS_ORDER = SALES_ORDER_STATUS_ORDER.filter((status) => status !== "ANNULEE");
const ABANDON_STATUS_ORDER = SALES_ORDER_STATUS_ORDER.filter((status) => status !== "ANNULEE" && status !== "CLOTUREE");

/** § Bloc 1 « Pipeline actuel » — instantané indépendant du filtre de période. */
function pipelineRows(pipeline: SalesFlowReport["pipeline_actuel"]): BarRow[] {
  const values = SALES_ORDER_STATUS_ORDER.map((status) => pipeline[status] ?? 0);
  const max = Math.max(...values, 1);
  return SALES_ORDER_STATUS_ORDER.map((status) => {
    const value = pipeline[status] ?? 0;
    return {
      key: status,
      label: SALES_ORDER_STATUS_LABELS[status],
      code: status,
      pct: (value / max) * 100,
      inBarText: value ? String(value) : "",
      meta: value ? `${value} commande(s)` : "aucune",
      barClassName: status === "ANNULEE" ? "bg-destructive/30" : status === "CLOTUREE" ? "bg-success" : value ? "bg-accent" : "bg-neutral-bg",
      muted: value === 0,
    };
  });
}

/** § Bloc 2 « Temps moyen par étape » — clés dynamiques, exploitable dès maintenant (historique du module Commandes depuis le 16/08). */
function stageRows(times: SalesFlowReport["temps_moyen_par_statut_jours"]): BarRow[] {
  const values = SALES_ORDER_STATUS_ORDER.map((status) => times[status] ?? 0);
  const max = Math.max(...values, 1);
  return SALES_ORDER_STATUS_ORDER.map((status) => {
    const value = times[status];
    const has = value !== undefined;
    return {
      key: status,
      label: SALES_ORDER_STATUS_LABELS[status],
      code: status,
      pct: has ? (value / max) * 100 : 0,
      inBarText: has ? `${value} j` : translate("t.pasDeDonneeSurLaPeriode"),
      meta: has ? "moyenne" : "—",
      barClassName: "bg-accent",
      muted: !has,
    };
  });
}

/** § Bloc 3 « Abandons par étape » — l'étape « Clôturée » et « Annulée » ne peuvent pas être un point d'abandon, exclues de la ventilation (même logique que le gabarit). */
function abandonRows(abandons: SalesFlowReport["abandons_par_etape"]): BarRow[] {
  const values = ABANDON_STATUS_ORDER.map((status) => abandons[status] ?? 0);
  const max = Math.max(...values, 1);
  return ABANDON_STATUS_ORDER.map((status) => {
    const value = abandons[status] ?? 0;
    return {
      key: status,
      label: SALES_ORDER_STATUS_LABELS[status],
      code: status,
      pct: (value / max) * 100,
      inBarText: value ? `${value} abandon(s)` : "",
      meta: value ? String(value) : "—",
      barClassName: value ? "bg-destructive" : "bg-neutral-bg",
      muted: value === 0,
    };
  });
}

/** Doc/spec_pages_analyse_flux.md § Onglet C « Flux vente » — historique disponible depuis l'origine du module Commandes (16/08), immédiatement exploitable contrairement à son équivalent achat. */
export function SalesFlowTab({ filters }: { filters: FlowAnalyticsFilters }) {
  const query = useSalesFlow(filters, true);

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
  const totalAbandons = ABANDON_STATUS_ORDER.reduce((sum, status) => sum + (report.abandons_par_etape[status] ?? 0), 0);

  return (
    <div className="space-y-6">
      <TableSection
        title="TAUX DE TRANSFORMATION"
        hint={translate("t.parmiLesCommandesCreeesSurLaPeriode")}
      >
        <div className="px-[18px] py-5">
          <ConversionFunnel
            rows={FUNNEL_STATUS_ORDER.map((status) => ({ key: status, label: SALES_ORDER_STATUS_LABELS[status] }))}
            data={report.atteintes_par_etape}
            total={report.commandes_creees}
          />
          <p className="mt-4 border-t border-border pt-3 text-[11.5px] leading-relaxed text-muted-foreground text-pretty">
            L&apos;étape « Annulée » est volontairement absente de l&apos;entonnoir : les abandons se lisent dans le bloc dédié ci-dessous, ventilés par l&apos;étape depuis laquelle la commande a été abandonnée.
          </p>
        </div>
      </TableSection>

      <TableSection title={translate("t.tempsMoyenParEtape")} hint={translate("t.dureeMoyennePasseeDansChaqueStatutAvantDeBasculerVersL")}>
        <div className="px-[18px] py-5">
          <BarList
            rows={stageRows(report.temps_moyen_par_statut_jours)}
            note={translate("t.ceBlocEstExploitableDesMaintenantLHistoriqueDesSta")}
            noteTone="success"
          />
        </div>
      </TableSection>

      <TableSection
        title={translate("t.abandonsParEtape")}
        hint={
          totalAbandons > 0
            ? `${totalAbandons} abandon(s) sur la période — à comparer au pipeline actuel pour repérer l'étape qui fuit le plus.`
            : translate("t.aucuneCommandeAnnuleeSurLaPeriode")
        }
      >
        <div className="px-[18px] py-5">
          <BarList rows={abandonRows(report.abandons_par_etape)} />
        </div>
      </TableSection>

      <TableSection title="PIPELINE ACTUEL" hint={translate("t.commandesClientsParStatutACetInstant")}>
        <div className="px-[18px] py-5">
          <BarList rows={pipelineRows(report.pipeline_actuel)} note={translate("t.ceBlocIgnoreLeFiltreDePeriodeIlMontreLEtatReelDuPo")} />
        </div>
      </TableSection>

      <KpiCard
        label={translate("field.delaiMoyenDePaiement")}
        value={report.delai_moyen_paiement_jours !== null ? `${report.delai_moyen_paiement_jours} j` : "—"}
        subtext={translate("t.entreEmissionDeLaPremiereProformaEtSoldeIntegralDe")}
        className="max-w-sm"
      />
    </div>
  );
}
