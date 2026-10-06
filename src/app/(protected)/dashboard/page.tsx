"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { PageHeader } from "@/components/data-display/page-header";
import { ErrorState } from "@/components/data-display/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSuspense } from "@/components/layout/page-suspense";
import { ExportDialog } from "@/components/forms/export-dialog";
import { exportRows, exportStamp, type ExportFormat } from "@/lib/export";
import { useQueryParams } from "@/hooks/use-query-params";
import { useDashboardStats } from "@/modules/dashboard/hooks/use-dashboard-stats";
import { useDashboardOverview } from "@/modules/dashboard/hooks/use-dashboard-overview";
import { PeriodFilter } from "@/modules/dashboard/components/period-filter";
import { RevenueKpiCard } from "@/modules/dashboard/components/revenue-kpi-card";
import { PendingInvoicesKpiCard } from "@/modules/dashboard/components/pending-invoices-kpi-card";
import { ConversionRateKpiCard } from "@/modules/dashboard/components/conversion-rate-kpi-card";
import { ProvenancePerformanceCard } from "@/modules/dashboard/components/provenance-performance-card";
import { QuickStartPanel } from "@/modules/dashboard/components/quick-start-panel";
import { MonthlyPerformanceCard } from "@/modules/dashboard/components/monthly-performance-card";
import { RecoveryQualityCard } from "@/modules/dashboard/components/recovery-quality-card";
import { LifecycleVelocityCard } from "@/modules/dashboard/components/lifecycle-velocity-card";
import { ModulePanelsGrid } from "@/modules/dashboard/components/module-panels-grid";
import { ActivityFeeds } from "@/modules/dashboard/components/activity-feeds";
import { buildDashboardReportRows } from "@/modules/dashboard/export";
import type { DashboardPeriod } from "@/modules/dashboard/types";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Pastille "PÉRIODE" affichée sur 3 des 4 cartes KPI (NJ Global Trade
 * Dashboard.dc.html lignes 388, 444, 471) — dérivée du filtre period/date
 * déjà connu du client, jamais une donnée renvoyée par l'API.
 */
function periodBadgeLabel(period: DashboardPeriod, date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  if (period === "day") return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (period === "week") return `Semaine du ${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}`;
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export default function DashboardPage() {
  return (
    <PageSuspense>
      <DashboardPageContent />
    </PageSuspense>
  );
}

function DashboardPageContent() {
  const user = useAuthStore((state) => state.user);
  const [{ period, date }, setParams] = useQueryParams({ period: "month", date: todayIso() });
  const [exportOpen, setExportOpen] = useState(false);

  const stats = useDashboardStats({ period: period as DashboardPeriod, date });
  const overview = useDashboardOverview();
  const badgeLabel = periodBadgeLabel(period as DashboardPeriod, date);
  const relances = overview.data?.relances_count ?? 0;

  // Indicateur « temps réel » : les 2 requêtes se rafraîchissent toutes seules
  // (focus + intervalle, voir les hooks). On affiche l'heure du dernier
  // rafraîchissement réussi, ou un état « en cours » pendant un re-fetch.
  const isRefreshing = stats.isFetching || overview.isFetching;
  const lastUpdatedAt = Math.max(stats.dataUpdatedAt ?? 0, overview.dataUpdatedAt ?? 0);
  const refreshLabel = isRefreshing
    ? translate("dashboard.refreshing")
    : lastUpdatedAt > 0
      ? translate("dashboard.refreshedAt", { time: new Date(lastUpdatedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) })
      : null;

  function handleExport(format: ExportFormat) {
    if (!stats.data || !overview.data) return;
    const ok = exportRows(
      format,
      `tableau-de-bord-njg-${exportStamp()}`,
      translate("dashboard.export.heading"),
      buildDashboardReportRows(stats.data, overview.data),
    );
    if (!ok) {
      toast.error(translate("dashboard.export.popupBlocked"));
      return;
    }
    setExportOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={translate("page.dashboard.title")}
        description={`Bienvenue${user ? `, ${user.full_name || user.name}` : ""}. Voici l'état de l'activité en temps réel.`}
        badges={
          <>
            {relances > 0 ? (
              <Badge tone="destructive">{translate("dashboard.relances", { count: relances })}</Badge>
            ) : null}
            {refreshLabel ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isRefreshing ? "animate-pulse bg-accent" : "bg-success"}`}
                  aria-hidden
                />
                {refreshLabel}
              </span>
            ) : null}
          </>
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={routes.salesOrders.list}>{translate("nav.salesOrders")}</Link>
            </Button>
            <Button onClick={() => setExportOpen(true)} disabled={!stats.data || !overview.data}>
              {translate("dashboard.export.action")}
            </Button>
          </>
        }
      />

      <QuickStartPanel />

      <PeriodFilter period={period as DashboardPeriod} date={date} caption={badgeLabel} onChange={(patch) => setParams(patch)} />

      {stats.isError ? (
        <ErrorState error={stats.error} onRetry={() => stats.refetch()} />
      ) : stats.isLoading || !stats.data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <RevenueKpiCard revenue={stats.data.revenue} periodLabel={badgeLabel} />
          <PendingInvoicesKpiCard summary={stats.data.factures_en_attente} />
          <ConversionRateKpiCard rate={stats.data.taux_transformation} periodLabel={badgeLabel} />
          <ProvenancePerformanceCard items={stats.data.performance_par_provenance} periodLabel={badgeLabel} />
        </div>
      )}

      {overview.isError ? (
        <ErrorState error={overview.error} onRetry={() => overview.refetch()} />
      ) : overview.isLoading || !overview.data ? (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
            <Skeleton className="h-[320px] w-full" />
            <Skeleton className="h-[320px] w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
            <MonthlyPerformanceCard data={overview.data.performance_mensuelle} />
            <RecoveryQualityCard data={overview.data.qualite_recouvrement} />
          </div>
          <LifecycleVelocityCard data={overview.data.velocite_cycle_vie} />
          <ModulePanelsGrid panels={overview.data.panels} />
          <ActivityFeeds feeds={overview.data.feeds} />
        </div>
      )}

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title={translate("dashboard.export.action")}
        subtitle={translate("dashboard.export.subtitle")}
        onSubmit={(format) => handleExport(format)}
      />
    </div>
  );
}
