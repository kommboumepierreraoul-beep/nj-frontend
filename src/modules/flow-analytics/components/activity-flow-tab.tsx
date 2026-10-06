"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/data-display/error-state";
import { EmptyState } from "@/components/data-display/empty-state";
import { KpiCard } from "@/components/data-display/kpi-card";
import { InfoBanner } from "@/components/data-display/info-banner";
import { Avatar } from "@/components/data-display/avatar";
import { TableSection } from "@/components/data-display/table-section";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { BarList, type BarRow } from "./dynamic-status-table";
import { useActivityFlow } from "../hooks/use-flow-reports";
import { MODULE_LABELS, entityTypeToModule, resolveActionLabelByKey } from "@/modules/audit/badges";
import { routes } from "@/config/routes";
import type { AuditModule } from "@/modules/audit/types";
import type { ActivityByUser, FlowAnalyticsFilters } from "../types";
import { translate } from "@/i18n/translate";

/** Couleur de barre par module (mêmes familles que les badges du Journal d'audit, § MODULE_TONES) — pas une teinte ad hoc. */
const MODULE_BAR_CLASSES: Record<AuditModule, string> = {
  users: "bg-accent",
  sales_orders: "bg-warning",
  invoices: "bg-success",
  products: "bg-module-products",
  suppliers: "bg-module-suppliers",
  clients: "bg-module-clients",
  attachments: "bg-neutral-bg",
};

/** Doc/spec_pages_analyse_flux.md § Onglet E « Flux d'activité » — complète le Journal d'audit par une lecture agrégée, simple comptage sans scoring ni corrélation. */
export function ActivityFlowTab({ filters }: { filters: FlowAnalyticsFilters }) {
  const query = useActivityFlow(filters, true);

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

  const byModule = new Map<AuditModule, number>();
  for (const entry of report.actions_par_module) {
    const auditModule = entityTypeToModule(entry.entity_type);
    byModule.set(auditModule, (byModule.get(auditModule) ?? 0) + entry.total);
  }
  const moduleRows = Array.from(byModule.entries()).sort((a, b) => b[1] - a[1]);
  const totalModuleActions = moduleRows.reduce((sum, [, total]) => sum + total, 0);
  const maxModule = Math.max(...moduleRows.map(([, total]) => total), 1);
  const moduleBars: BarRow[] = moduleRows.map(([auditModule, total]) => ({
    key: auditModule,
    label: MODULE_LABELS[auditModule],
    pct: (total / maxModule) * 100,
    inBarText: String(total),
    barClassName: MODULE_BAR_CLASSES[auditModule],
  }));

  const maxAction = Math.max(...report.actions_par_type.map((entry) => entry.total), 1);
  const actionBars: BarRow[] = report.actions_par_type.map((entry) => ({
    key: entry.action,
    label: resolveActionLabelByKey(entry.action),
    pct: (entry.total / maxAction) * 100,
    inBarText: String(entry.total),
    barClassName: "bg-accent",
  }));

  const userColumns: DataTableColumn<ActivityByUser>[] = [
    {
      key: "user",
      header: "Utilisateur",
      width: "minmax(220px,1.5fr)",
      render: (row) => (
        <Link href={routes.users.detail(row.user_id)} className="flex min-w-0 items-center gap-2.5 font-medium text-foreground hover:underline">
          <Avatar name={row.full_name} size={30} />
          <span className="truncate">{row.full_name}</span>
        </Link>
      ),
    },
    { key: "total", header: "Actions", align: "right", width: "110px", render: (row) => String(row.total) },
    {
      key: "share",
      header: "Volume relatif",
      width: "minmax(140px,1fr)",
      render: (row) => (
        <div className="flex w-full items-center gap-2">
          <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-neutral-bg">
            <div
              className="h-full rounded-full bg-[var(--color-link)]"
              style={{ width: `${(row.total / Math.max(...report.actions_par_utilisateur.map((u) => u.total), 1)) * 100}%` }}
            />
          </div>
          <span className="w-9 shrink-0 text-right text-[12px] font-bold text-muted-foreground">
            {Math.round((row.total / Math.max(report.actions_par_utilisateur.reduce((sum, u) => sum + u.total, 0), 1)) * 100)}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TableSection
        title={translate("t.actionsParModule")}
        hint={moduleRows.length ? `${totalModuleActions} action(s) journalisée(s) sur ${moduleRows.length} module(s).` : translate("t.aucuneActionEnregistreeSurCettePeriode2")}
      >
        {moduleBars.length === 0 ? (
          <EmptyState title={translate("t.aucuneActionEnregistreeSurCettePeriode")} />
        ) : (
          <div className="px-[18px] py-5">
            <BarList rows={moduleBars} note={translate("t.pourRetrouverUneActionPreciseEtSesValeursAvantApre")} />
          </div>
        )}
      </TableSection>

      <TableSection title={translate("t.actionsParUtilisateur")} hint={translate("t.dixUtilisateursLesPlusActifsSurLaPeriodeUnSimpleCo")}>
        <DataTable
          columns={userColumns}
          data={report.actions_par_utilisateur}
          rowKey={(row) => row.user_id}
          emptyTitle={translate("t.aucunUtilisateurNARealiseDActionJournalisee")}
          emptyDescription={translate("t.aucuneActionNAEteEnregistreePendantLaFenetreChoisi")}
          className="rounded-t-none border-0"
        />
      </TableSection>

      <TableSection title={translate("t.actionsParType")} hint={translate("t.natureDesOperationsRealisees")}>
        {actionBars.length === 0 ? (
          <EmptyState title={translate("t.aucuneActionEnregistreeSurCettePeriode")} />
        ) : (
          <div className="px-[18px] py-5">
            <BarList rows={actionBars} note="Les changements de statut et les encaissements dominent normalement cette liste : c'est le rythme de vie des commandes." />
          </div>
        )}
      </TableSection>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{translate("t.connexionEtAcces")}</h3>
        <InfoBanner>
          Un volume élevé d&apos;accès refusés faute de permission signale le plus souvent un profil mal calibré (quelqu&apos;un qui n&apos;a pas les droits pour son usage quotidien), pas une tentative d&apos;intrusion — ce module fait un simple comptage, pas de la détection de sécurité avancée.
        </InfoBanner>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label={translate("field.echecsDeConnexion")} value={report.connexion.echecs_connexion} />
          <KpiCard label={translate("field.comptesVerrouilles")} value={report.connexion.comptes_verrouilles} tone={report.connexion.comptes_verrouilles > 0 ? "warning" : "default"} />
          <KpiCard label={translate("field.accesRefusesPermission")} value={report.connexion.acces_refuses_permission} />
          <KpiCard label={translate("field.accesRefusesRole")} value={report.connexion.acces_refuses_role} />
        </div>
      </section>
    </div>
  );
}
