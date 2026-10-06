"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/data-display/error-state";
import { KpiCard } from "@/components/data-display/kpi-card";
import { InfoBanner } from "@/components/data-display/info-banner";
import { TableSection } from "@/components/data-display/table-section";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { BarList, type BarRow } from "./dynamic-status-table";
import { usePurchaseFlow } from "../hooks/use-flow-reports";
import { PURCHASE_ORDER_STATUS_LABELS } from "@/modules/purchase-orders/badges";
import { routes } from "@/config/routes";
import type { PurchaseOrderStatus } from "@/modules/purchase-orders/types";
import { formatPercent } from "@/lib/format";
import type { FlowAnalyticsFilters, PurchaseFlowReport } from "../types";
import { translate } from "@/i18n/translate";

const PURCHASE_ORDER_STATUS_ORDER: PurchaseOrderStatus[] = ["DRAFT", "SENT", "CONFIRMED", "IN_PRODUCTION", "SHIPPED", "RECEIVED", "CANCELLED"];

/** § Bloc 1 « Pipeline actuel » — instantané indépendant du filtre de période ; un vrai zéro (pas une donnée manquante) reste affiché plutôt que masqué. */
function pipelineRows(pipeline: PurchaseFlowReport["pipeline_actuel"]): BarRow[] {
  const values = PURCHASE_ORDER_STATUS_ORDER.map((status) => pipeline[status] ?? 0);
  const max = Math.max(...values, 1);
  return PURCHASE_ORDER_STATUS_ORDER.map((status) => {
    const value = pipeline[status] ?? 0;
    return {
      key: status,
      label: PURCHASE_ORDER_STATUS_LABELS[status],
      code: status,
      pct: (value / max) * 100,
      inBarText: value ? String(value) : "",
      meta: value ? `${value} commande(s)` : "aucune",
      barClassName: status === "CANCELLED" ? "bg-destructive/30" : value ? "bg-module-suppliers" : "bg-neutral-bg",
      muted: value === 0,
    };
  });
}

/** § Bloc 7 « Temps moyen par étape » — clés dynamiques : une étape sans transition sur la période n'apparaît pas du tout dans la réponse. */
function stageRows(times: PurchaseFlowReport["temps_moyen_par_statut_jours"]): BarRow[] {
  const values = PURCHASE_ORDER_STATUS_ORDER.map((status) => times[status] ?? 0);
  const max = Math.max(...values, 1);
  return PURCHASE_ORDER_STATUS_ORDER.map((status) => {
    const value = times[status];
    const has = value !== undefined;
    return {
      key: status,
      label: PURCHASE_ORDER_STATUS_LABELS[status],
      code: status,
      pct: has ? (value / max) * 100 : 0,
      inBarText: has ? `${value} j` : translate("t.pasDeDonneeSurLaPeriode"),
      meta: has ? "moyenne" : "—",
      barClassName: "bg-module-suppliers",
      muted: !has,
    };
  });
}

/** Doc/spec_pages_analyse_flux.md § Onglet B « Flux achat ». */
export function PurchaseFlowTab({ filters }: { filters: FlowAnalyticsFilters }) {
  const query = usePurchaseFlow(filters, true);

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

  const supplierColumns: DataTableColumn<PurchaseFlowReport["performance_par_fournisseur"][number]>[] = [
    {
      key: "supplier",
      header: "Fournisseur",
      width: "minmax(220px,1.5fr)",
      render: (row) => (
        <Link href={routes.suppliers.detail(row.supplier_id)} className="font-medium text-foreground hover:underline">
          {row.company_name}
        </Link>
      ),
    },
    { key: "sollicitations", header: "Sollicitations", align: "right", width: "150px", render: (row) => String(row.sollicitations) },
    { key: "reponses", header: translate("field.reponses"), align: "right", width: "130px", render: (row) => String(row.reponses) },
    { key: "taux", header: translate("field.tauxDeReponse"), align: "right", width: "150px", render: (row) => formatPercent(row.taux_reponse_pourcentage, 0) },
  ];

  return (
    <div className="space-y-6">
      <TableSection title="PIPELINE ACTUEL" hint={translate("t.commandesFournisseursParStatutInstantIgnoreFiltre")}>
        <div className="px-[18px] py-5">
          <BarList
            rows={pipelineRows(report.pipeline_actuel)}
            note={translate("t.unStatutAZeroResteAfficheCEstCeQuiPermetDeVoirQuUn")}
          />
        </div>
      </TableSection>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{translate("t.reponseFournisseur")}</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <KpiCard label={translate("field.sollicites")} value={report.reponse_fournisseur.sollicitations} />
          <KpiCard label={translate("field.reponses")} value={report.reponse_fournisseur.reponses} />
          <KpiCard label={translate("field.refus")} value={report.reponse_fournisseur.refus} />
          <KpiCard label={translate("field.expirees")} value={report.reponse_fournisseur.expirees} />
          <KpiCard label={translate("field.tauxDeReponse")} value={formatPercent(report.reponse_fournisseur.taux_reponse_pourcentage, 0)}>
            <p className="text-xs text-muted-foreground">
              Délai moyen : {report.reponse_fournisseur.delai_moyen_reponse_jours !== null ? `${report.reponse_fournisseur.delai_moyen_reponse_jours} j` : "—"}
            </p>
          </KpiCard>
        </div>
      </section>

      <TableSection title={translate("t.performanceParFournisseur")} hint={translate("t.dixFournisseursLesPlusSollicites")}>
        <DataTable
          columns={supplierColumns}
          data={report.performance_par_fournisseur}
          rowKey={(row) => row.supplier_id}
          emptyTitle={translate("t.aucunFournisseurSollicite")}
          emptyDescription={translate("t.aucuneDemandeDePrixNAEteEnvoyeeSurLaPeriodeChoisie")}
          className="rounded-t-none border-0"
        />
      </TableSection>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{translate("t.devis")}</h3>
        <InfoBanner>{report.limite}</InfoBanner>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label={translate("field.devisRecus")} value={report.devis.total} />
          <KpiCard label={translate("field.retenus")} value={report.devis.selectionnes} />
          <KpiCard label={translate("field.tauxDeSelection")} value={formatPercent(report.devis.taux_selection_pourcentage, 0)} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Cycle commande fournisseur</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label={translate("field.receptionnees")} value={report.cycle_commande_fournisseur.commandes_receptionnees} />
          <KpiCard label={translate("field.delaiMoyen")} value={report.cycle_commande_fournisseur.delai_moyen_jours !== null ? `${report.cycle_commande_fournisseur.delai_moyen_jours} j` : "—"} />
          <KpiCard label={translate("field.livraisonsEnRetard")} value={report.cycle_commande_fournisseur.livraisons_en_retard} tone={report.cycle_commande_fournisseur.livraisons_en_retard > 0 ? "warning" : "default"} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">RFQ</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label={translate("field.rfqCreees")} value={report.rfq.total} />
          <KpiCard label={translate("field.annulees")} value={report.rfq.annulees} />
          <KpiCard label={translate("field.expirees")} value={report.rfq.expirees} />
          <KpiCard label={translate("field.convertiesEnCommande")} value={report.rfq.converties_en_commande} />
          <KpiCard
            label={translate("field.tauxDeTransformationRfqCommande")}
            value={formatPercent(report.rfq.taux_transformation_pourcentage, 0)}
            subtext={translate("t.fiableUniquementPourLesCommandesFournisseursCreees")}
          />
        </div>
      </section>

      <TableSection title={translate("t.tempsMoyenParEtape")} hint={translate("t.dureeMoyennePasseeDansChaqueStatutAvantDeBasculerVersL")}>
        <div className="px-[18px] py-5">
          <BarList
            rows={stageRows(report.temps_moyen_par_statut_jours)}
            note={translate("t.lHistoriqueDesStatutsFournisseurNExisteQueDepuisLa")}
            noteTone="warning"
          />
        </div>
      </TableSection>
    </div>
  );
}
