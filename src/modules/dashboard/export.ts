import type { ExportRow } from "@/lib/export";
import { formatDate } from "@/lib/format";
import { translate } from "@/i18n/translate";
import { PAYMENT_STATUS_LABELS, SALES_ORDER_STATUS_LABELS } from "@/modules/sales-orders/badges";
import { INVOICE_DOCUMENT_TYPE_LABELS } from "@/modules/invoices/badges";
import type { SalesOrderStatus } from "@/modules/sales-orders/types";
import type { InvoiceDocumentType } from "@/modules/invoices/types";
import { PANEL_CONFIG, panelTitle } from "./config/panels";
import type { DashboardOverview, DashboardStats } from "./types";

/**
 * « Exporter le rapport » — NJ Global Trade Dashboard.dc.html lignes 1442-1474 :
 * un document imprimable reprenant les indicateurs, la trésorerie, le pipeline,
 * les documents et les référentiels, assemblé côté client à partir des réponses
 * déjà chargées (`/dashboard/stats` + `/dashboard/overview`).
 */
export function buildDashboardReportRows(stats: DashboardStats, overview: DashboardOverview): ExportRow[] {
  const rows: ExportRow[] = [
    [translate("dashboard.export.heading"), `${translate("dashboard.export.generatedOn")} ${formatDate(new Date())}`],
    [],
  ];

  rows.push([translate("dashboard.export.kpiSection")]);
  rows.push([translate("dashboard.export.caEncaisse"), stats.revenue.ca_encaisse]);
  rows.push([translate("dashboard.export.commissionRealised"), stats.revenue.commission_realisee]);
  rows.push([translate("dashboard.recovery.title"), `${overview.qualite_recouvrement.taux_recouvre_pourcentage} %`]);
  rows.push([translate("dashboard.export.pendingInvoices"), stats.factures_en_attente.count]);
  rows.push([translate("dashboard.export.conversionRate"), `${stats.taux_transformation.taux_pourcentage} %`]);
  rows.push([]);

  const recovery = overview.qualite_recouvrement;
  rows.push([translate("dashboard.export.recoverySection")]);
  rows.push([translate("dashboard.export.engagedRevenue"), recovery.ca_engage_total]);
  rows.push([translate("dashboard.export.netCollected"), recovery.net_encaisse_total]);
  rows.push([translate("dashboard.export.creditedByNote"), recovery.credite_avoir_total]);
  for (const bucket of recovery.buckets) {
    rows.push([PAYMENT_STATUS_LABELS[bucket.payment_status], bucket.count, bucket.montant]);
  }
  rows.push([]);

  rows.push([translate("dashboard.export.monthlySection")]);
  rows.push([
    translate("dashboard.export.month"),
    translate("dashboard.monthly.legend.engaged"),
    translate("dashboard.monthly.legend.collected"),
  ]);
  for (const point of overview.performance_mensuelle.mois) {
    rows.push([point.mois, point.ca_engage, point.net_encaisse]);
  }
  rows.push([]);

  const pipeline = overview.panels.find((panel) => panel.code === "pipeline_commercial");
  if (pipeline) {
    rows.push([panelTitle("pipeline_commercial")]);
    for (const bar of pipeline.barres) {
      rows.push([SALES_ORDER_STATUS_LABELS[bar.code as SalesOrderStatus] ?? bar.code, bar.valeur, bar.montant ?? 0]);
    }
    rows.push([]);
  }

  const documents = overview.panels.find((panel) => panel.code === "documents_emis");
  if (documents) {
    rows.push([panelTitle("documents_emis")]);
    for (const metric of documents.metriques) {
      const label =
        INVOICE_DOCUMENT_TYPE_LABELS[metric.code as InvoiceDocumentType] ?? PANEL_CONFIG.documents_emis.metricLabel(metric.code);
      rows.push([label, metric.valeur]);
    }
    rows.push([]);
  }

  rows.push([translate("dashboard.export.referentialsSection")]);
  for (const code of ["portefeuille_clients", "catalogue", "sourcing_fournisseurs", "acces_tracabilite"] as const) {
    const panel = overview.panels.find((item) => item.code === code);
    if (!panel) continue;
    const config = PANEL_CONFIG[code];
    for (const metric of panel.metriques) {
      rows.push([`${panelTitle(code)} — ${config.metricLabel(metric.code)}`, metric.valeur]);
    }
  }

  return rows;
}
