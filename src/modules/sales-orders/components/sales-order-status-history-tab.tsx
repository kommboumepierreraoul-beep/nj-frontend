"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { useSalesOrderStatusHistory } from "../hooks/use-sales-order-status-history";
import { SALES_ORDER_STATUS_LABELS, SALES_ORDER_STATUS_TONES } from "../badges";
import { formatDateTime } from "@/lib/format";
import type { SalesOrderStatusHistoryEntry } from "../types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_commandes.md § « Onglet Historique de statut » — lecture seule, aucune action possible, tri du plus récent au plus ancien. */
export function SalesOrderStatusHistoryTab({ salesOrderId }: { salesOrderId: number }) {
  const query = useSalesOrderStatusHistory(salesOrderId);
  const sorted = [...(query.data ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const columns: DataTableColumn<SalesOrderStatusHistoryEntry>[] = [
    {
      key: "transition",
      header: "Changement",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.previous_status ? <Badge tone={SALES_ORDER_STATUS_TONES[row.previous_status]}>{SALES_ORDER_STATUS_LABELS[row.previous_status]}</Badge> : <span className="text-muted-foreground">—</span>}
          <span className="text-muted-foreground">→</span>
          <Badge tone={SALES_ORDER_STATUS_TONES[row.new_status]}>{SALES_ORDER_STATUS_LABELS[row.new_status]}</Badge>
        </div>
      ),
    },
    { key: "author", header: "Auteur", render: (row) => row.changed_by?.name ?? "—" },
    { key: "reason", header: "Motif", render: (row) => row.reason ?? "—" },
    { key: "date", header: "Date/heure", render: (row) => formatDateTime(row.created_at) },
  ];

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-muted-foreground">{translate("t.lectureSeuleAlimenteAutomatiquementAChaqueChangementDe")}</p>
      <DataTable
        columns={columns}
        data={sorted}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        rowKey={(row) => row.id}
        emptyTitle="Aucun changement de statut"
      />
    </div>
  );
}
