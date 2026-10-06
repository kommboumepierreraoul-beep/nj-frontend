"use client";

import { useState } from "react";
import Link from "next/link";
import { Gauge, Lock, SlidersHorizontal, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/data-display/page-header";
import { PageSuspense } from "@/components/layout/page-suspense";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryParams } from "@/hooks/use-query-params";
import { PeriodFilter } from "@/modules/dashboard/components/period-filter";
import { FlowExportMenu } from "@/modules/flow-analytics/components/flow-export-menu";
import { BottlenecksTab } from "@/modules/flow-analytics/components/bottlenecks-tab";
import { PurchaseFlowTab } from "@/modules/flow-analytics/components/purchase-flow-tab";
import { SalesFlowTab } from "@/modules/flow-analytics/components/sales-flow-tab";
import { FinancialFlowTab } from "@/modules/flow-analytics/components/financial-flow-tab";
import { ActivityFlowTab } from "@/modules/flow-analytics/components/activity-flow-tab";
import { FLOW_TYPE_ICONS } from "@/modules/flow-analytics/badges";
import { routes } from "@/config/routes";
import type { DashboardPeriod } from "@/modules/dashboard/types";
import type { FlowReportKey } from "@/modules/flow-analytics/types";
import { translate } from "@/i18n/translate";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const TAB_TO_FLOW: Record<string, FlowReportKey> = {
  bottlenecks: "bottlenecks",
  "purchase-flow": "purchase-flow",
  "sales-flow": "sales-flow",
  financial: "financial",
  "activity-flow": "activity-flow",
};

/** Fenêtre `from`/`to` couverte par `period`+`date` — même calcul que NJ Global Trade Flux.dc.html `range()` (uniquement pour la légende affichée, aucune requête n'en dépend). */
function computeRange(period: DashboardPeriod, date: string): { from: Date; to: Date } {
  const d = new Date(`${date}T00:00:00`);
  if (period === "day") return { from: d, to: d };
  if (period === "week") {
    const dayOfWeek = (d.getDay() + 6) % 7;
    return {
      from: new Date(d.getFullYear(), d.getMonth(), d.getDate() - dayOfWeek),
      to: new Date(d.getFullYear(), d.getMonth(), d.getDate() - dayOfWeek + 6),
    };
  }
  return { from: new Date(d.getFullYear(), d.getMonth(), 1), to: new Date(d.getFullYear(), d.getMonth() + 1, 0) };
}

function formatFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Doc/spec_pages_analyse_flux.md § 1 « Analyse des flux » — page de travail
 * périodique (pas un écran consulté en continu), en-tête de filtres commun
 * puis 5 onglets adossés chacun à leur propre endpoint. Onglet « Vue
 * d'ensemble » (goulots) par défaut à l'ouverture, réponse directe à « où
 * est-ce que ça bloque ».
 */
export default function FlowAnalyticsPage() {
  return (
    <PageSuspense>
      <FlowAnalyticsPageContent />
    </PageSuspense>
  );
}

function FlowAnalyticsPageContent() {
  const [{ period, date }, setParams] = useQueryParams({ period: "month", date: todayIso() });
  const [activeTab, setActiveTab] = useState("bottlenecks");
  const filters = { period: period as DashboardPeriod, date };
  const range = computeRange(filters.period, filters.date);

  return (
    <div className="space-y-6">
      <PageHeader
        title={translate("page.flowAnalytics.title")}
        badges={
          <Badge tone="neutral">
            <Lock className="mr-1 h-3 w-3" />
            Lecture seule
          </Badge>
        }
        description={translate("page.flowAnalytics.desc")}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={routes.settings.flowAnalyticsThresholds}>
                <SlidersHorizontal className="h-4 w-4" />
                Seuils d&apos;alerte
              </Link>
            </Button>
            <FlowExportMenu flow={TAB_TO_FLOW[activeTab]} filters={filters} />
          </>
        }
      />

      <PeriodFilter
        period={filters.period}
        date={filters.date}
        caption={`Période analysée : ${formatFr(range.from)} → ${formatFr(range.to)}`}
        onChange={(patch) => setParams(patch)}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bottlenecks">
            <Gauge className="h-[18px] w-[18px]" />
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger value="purchase-flow">
            <FLOW_TYPE_ICONS.ACHAT className="h-[18px] w-[18px]" />
            Flux achat
          </TabsTrigger>
          <TabsTrigger value="sales-flow">
            <FLOW_TYPE_ICONS.VENTE className="h-[18px] w-[18px]" />
            Flux vente
          </TabsTrigger>
          <TabsTrigger value="financial">
            <Wallet className="h-[18px] w-[18px]" />
            Flux financier
          </TabsTrigger>
          <TabsTrigger value="activity-flow">
            <FLOW_TYPE_ICONS.ACTIVITE className="h-[18px] w-[18px]" />
            Flux d&apos;activité
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bottlenecks">
          <BottlenecksTab filters={filters} />
        </TabsContent>
        <TabsContent value="purchase-flow">
          <PurchaseFlowTab filters={filters} />
        </TabsContent>
        <TabsContent value="sales-flow">
          <SalesFlowTab filters={filters} />
        </TabsContent>
        <TabsContent value="financial">
          <FinancialFlowTab filters={filters} />
        </TabsContent>
        <TabsContent value="activity-flow">
          <ActivityFlowTab filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
