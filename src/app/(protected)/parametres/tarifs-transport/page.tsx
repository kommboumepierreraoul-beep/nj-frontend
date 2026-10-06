"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { ShippingRateFilters } from "@/modules/shipping-rates/components/shipping-rate-filters";
import { ShippingRateFormDialog } from "@/modules/shipping-rates/components/shipping-rate-form-dialog";
import { useShippingRates } from "@/modules/shipping-rates/hooks/use-shipping-rates";
import { useDeleteShippingRate } from "@/modules/shipping-rates/hooks/use-shipping-rate-mutations";
import { SHIPPING_MODE_LABELS } from "@/modules/shipping-rates/badges";
import { formatCurrency } from "@/lib/format";
import { routes } from "@/config/routes";
import type { ShippingRate, ShippingRateListFilters } from "@/modules/shipping-rates/types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_factures.md § 2 « Paramètres → Tarifs de transport » — grille utilisée pour l'estimation logistique du comparatif Proforma. */
export default function ShippingRatesPage() {
  const [filters, setFilters] = useState<ShippingRateListFilters>({});
  const query = useShippingRates(filters);
  const deleteMutation = useDeleteShippingRate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingRate | null>(null);
  const [toDelete, setToDelete] = useState<ShippingRate | null>(null);

  const rates = [...(query.data ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  const columns: DataTableColumn<ShippingRate>[] = [
    { key: "mode", header: translate("col.mode"), render: (row) => <Badge tone="neutral">{SHIPPING_MODE_LABELS[row.mode]}</Badge> },
    { key: "range", header: translate("col.qtyRange"), render: (row) => `${row.min_quantity} → ${row.max_quantity !== null ? row.max_quantity : translate("value.unlimited")} ${row.unit}` },
    { key: "rate", header: translate("col.rate"), render: (row) => `${formatCurrency(row.rate)} / ${row.unit}` },
    { key: "lead_time", header: translate("col.leadTime"), render: (row) => row.lead_time_label },
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
        breadcrumbs={[{ label: "Tableau de bord", href: routes.dashboard.home }, { label: translate("nav.settings"), href: routes.settings.hub }, { label: "Tarifs de transport" }]}
        title={translate("page.shippingRates.title")}
        badges={
          <>
            <Badge tone="neutral">{translate("t.commercial")}</Badge>
            <Badge tone="success">{rates.filter((rate) => rate.is_active).length} actif(s)</Badge>
          </>
        }
        description={translate("page.shippingRates.desc")}
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Nouveau palier
          </Button>
        }
      />

      <ShippingRateFilters filters={filters} onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))} />

      <DataTable columns={columns} data={rates} isLoading={query.isLoading} isError={query.isError} error={query.error} onRetry={() => query.refetch()} rowKey={(row) => row.id} emptyTitle={translate("page.commissions.empty")} />

      <ShippingRateFormDialog open={formOpen} onOpenChange={setFormOpen} rate={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.commissions.deleteTitle")}
        description={translate("page.tags.deleteDesc")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </div>
  );
}
