"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { CommissionRuleFormDialog } from "@/modules/commission-rules/components/commission-rule-form-dialog";
import { useCommissionRules } from "@/modules/commission-rules/hooks/use-commission-rules";
import { useDeleteCommissionRule } from "@/modules/commission-rules/hooks/use-commission-rule-mutations";
import { COMMISSION_TYPE_LABELS } from "@/modules/sales-orders/badges";
import { formatCurrency } from "@/lib/format";
import { routes } from "@/config/routes";
import type { CommissionRule } from "@/modules/commission-rules/types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_commandes.md § 3 « Paramètres → Commissions » — tableau ordonné par `sort_order`, suppression non bloquée par l'API mais désactiver plutôt que supprimer est recommandé pour garder une trace lisible. */
export default function CommissionRulesPage() {
  const query = useCommissionRules();
  const deleteMutation = useDeleteCommissionRule();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CommissionRule | null>(null);
  const [toDelete, setToDelete] = useState<CommissionRule | null>(null);

  const rules = [...(query.data ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  const columns: DataTableColumn<CommissionRule>[] = [
    { key: "label", header: translate("col.label"), render: (row) => row.label },
    {
      key: "range",
      header: translate("col.amountRange"),
      render: (row) => `${formatCurrency(row.min_amount, row.currency?.code)} → ${row.max_amount !== null ? formatCurrency(row.max_amount, row.currency?.code) : translate("value.unlimited")}`,
    },
    { key: "type", header: translate("col.type"), render: (row) => COMMISSION_TYPE_LABELS[row.commission_type] },
    { key: "rate", header: translate("col.rate"), render: (row) => (row.commission_type === "POURCENTAGE" ? `${row.rate_or_amount}%` : formatCurrency(row.rate_or_amount, row.currency?.code)) },
    { key: "currency", header: translate("col.currency"), render: (row) => row.currency?.code ?? "—" },
    { key: "status", header: translate("col.status"), render: (row) => <Badge tone={row.is_active ? "success" : "neutral"}>{row.is_active ? translate("value.active") : translate("value.inactive")}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(row); setFormOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setToDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Tableau de bord", href: routes.dashboard.home }, { label: translate("nav.settings"), href: routes.settings.hub }, { label: "Commissions" }]}
        title={translate("page.commissions.title")}
        badges={
          <>
            <Badge tone="neutral">{translate("t.commercial")}</Badge>
            <Badge tone="success">{rules.filter((rule) => rule.is_active).length} actif(s)</Badge>
          </>
        }
        description={translate("page.commissions.desc")}
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Nouveau palier
          </Button>
        }
      />

      <DataTable columns={columns} data={rules} isLoading={query.isLoading} isError={query.isError} error={query.error} onRetry={() => query.refetch()} rowKey={(row) => row.id} emptyTitle={translate("page.commissions.empty")} />

      <CommissionRuleFormDialog open={formOpen} onOpenChange={setFormOpen} rule={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.commissions.deleteTitle")}
        description={translate("page.commissions.deleteDesc")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </div>
  );
}
