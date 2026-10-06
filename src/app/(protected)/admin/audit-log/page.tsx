"use client";

import { useState } from "react";
import { Eye, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/data-display/avatar";
import { PageHeader } from "@/components/data-display/page-header";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { TableSection } from "@/components/data-display/table-section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageSuspense } from "@/components/layout/page-suspense";
import { useQueryParams } from "@/hooks/use-query-params";
import { useAuditLogs } from "@/modules/audit/hooks/use-audit-logs";
import { AuditLogFilters } from "@/modules/audit/components/audit-log-filters";
import { AuditLogDetailDialog } from "@/modules/audit/components/audit-log-detail-dialog";
import { ENTITY_TYPE_LABELS, MODULE_ICONS, MODULE_LABELS, MODULE_TONES, entityTypeToModule, resolveActionLabel } from "@/modules/audit/badges";
import type { AuditLog, AuditLogListFilters } from "@/modules/audit/types";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

/** Doc/spec_pages_audit.md § 1 « Journal d'activité » — liste et détail cohabitent sur le même écran (modale au clic), pas de route de détail séparée. Lecture seule, aucune action d'écriture. */
export default function AuditLogPage() {
  return (
    <PageSuspense>
      <AuditLogPageContent />
    </PageSuspense>
  );
}

function AuditLogPageContent() {
  const [filters, setFilters] = useQueryParams<Required<Pick<AuditLogListFilters, "page">> & AuditLogListFilters>({
    page: 1,
    per_page: 20,
    entity_type: undefined,
    entity_id: undefined,
    actor_user_id: undefined,
    action: undefined,
    from: undefined,
    to: undefined,
  });

  const query = useAuditLogs(filters);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const meta = query.data?.meta;

  const columns: DataTableColumn<AuditLog>[] = [
    {
      key: "date",
      header: translate("col.date"),
      width: "150px",
      render: (row) => (
        <div title={formatDateTime(row.created_at)} className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{formatRelativeTime(row.created_at)}</span>
          <span className="text-[11px] tabular-nums text-text-quaternary">{formatDateTime(row.created_at)}</span>
        </div>
      ),
    },
    {
      key: "actor",
      header: translate("col.actor"),
      width: "minmax(190px,1fr)",
      render: (row) =>
        row.actor ? (
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar name={row.actor.full_name} size={30} />
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{row.actor.full_name}</p>
              <p className="truncate text-xs text-text-quaternary">{row.actor.email}</p>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">{translate("t.utilisateurSupprime")}</span>
        ),
    },
    {
      key: "module",
      header: translate("col.module"),
      width: "170px",
      render: (row) => {
        const auditModule = entityTypeToModule(row.entity_type);
        const ModuleIcon = MODULE_ICONS[auditModule];
        return (
          <Badge tone={MODULE_TONES[auditModule]} className="max-w-full">
            <ModuleIcon className="mr-1 h-3 w-3 shrink-0" />
            <span className="truncate">{MODULE_LABELS[auditModule]}</span>
          </Badge>
        );
      },
    },
    {
      key: "action",
      header: translate("col.action"),
      width: "minmax(220px,1.3fr)",
      render: (row) => <span title={row.action}>{resolveActionLabel(row.entity_type, row.action)}</span>,
    },
    {
      key: "entity",
      header: translate("col.entity"),
      width: "170px",
      render: (row) => (
        <span className="truncate text-text-tertiary">{ENTITY_TYPE_LABELS[row.entity_type]}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "60px",
      align: "right",
      render: (row) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" title={translate("tooltip.viewEntry")} onClick={() => setSelected(row)}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: translate("page.dashboard.title"), href: routes.dashboard.home }, { label: translate("nav.group.administration") }, { label: translate("nav.auditLog") }]}
        title={translate("page.audit.title")}
        badges={
          <>
            <Badge tone="neutral">
              <Lock className="mr-1 h-3 w-3" />
              Lecture seule
            </Badge>
            {meta ? <Badge tone="success">{meta.total} entrée{meta.total > 1 ? "s" : ""}</Badge> : null}
          </>
        }
        description={translate("page.audit.desc")}
        actions={
          <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>
            <RefreshCw className={query.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Actualiser
          </Button>
        }
      />

      <AuditLogFilters filters={filters} onChange={(patch) => setFilters({ ...patch, page: 1 })} />

      <TableSection
        title={translate("page.audit.section")}
        hint={meta ? `${meta.total} entrée${meta.total > 1 ? "s" : ""} correspondant aux filtres actifs` : undefined}
        action={
          <div className="flex items-center gap-2">
            <label className="text-[11.5px] font-medium text-muted-foreground">{translate("t.parPage")}</label>
            <Select value={String(filters.per_page ?? 20)} onValueChange={(value) => setFilters({ per_page: Number(value), page: 1 })}>
              <SelectTrigger className="h-[34px] w-[70px] px-2.5 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        <DataTable
          className="rounded-t-none border-0"
          columns={columns}
          data={query.data?.data}
          meta={query.data?.meta}
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          onRetry={() => query.refetch()}
          onPageChange={(page) => setFilters({ page })}
          onRowClick={(row) => setSelected(row)}
          rowKey={(row) => row.id}
          emptyTitle={translate("page.audit.empty")}
        />
      </TableSection>

      <AuditLogDetailDialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} log={selected} />
    </div>
  );
}
