"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { SummaryCard } from "@/components/data-display/summary-card";
import { ErrorState } from "@/components/data-display/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PurchaseOrderFormDialog } from "@/modules/purchase-orders/components/purchase-order-form-dialog";
import { PurchaseOrderItemsTab } from "@/modules/purchase-orders/components/purchase-order-items-tab";
import { usePurchaseOrder } from "@/modules/purchase-orders/hooks/use-purchase-order";
import { PURCHASE_ORDER_STATUS_LABELS, PURCHASE_ORDER_STATUS_TONES } from "@/modules/purchase-orders/badges";
import { routes } from "@/config/routes";
import { formatCurrency, formatDate } from "@/lib/format";
import { translate } from "@/i18n/translate";

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const poId = Number(id);
  if (!Number.isInteger(poId)) notFound();

  const query = usePurchaseOrder(poId);
  const [editOpen, setEditOpen] = useState(false);

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const po = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: translate("page.purchaseOrders.title"), href: routes.suppliers.purchaseOrderList }, { label: po.reference }]}
        title={po.reference}
        badges={<Badge tone={PURCHASE_ORDER_STATUS_TONES[po.status]}>{PURCHASE_ORDER_STATUS_LABELS[po.status]}</Badge>}
        description={`${po.supplier.company_name} · ${translate("t.commandeDuX", { x: formatDate(po.order_date) })}`}
        actions={
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            {translate("form.head.modifierLaCommande")}
          </Button>
        }
      />

      <SummaryCard
        title={translate("section.orderSummary")}
        fields={[
          { label: translate("field.fournisseur"), value: po.supplier.company_name },
          { label: translate("field.statut"), value: PURCHASE_ORDER_STATUS_LABELS[po.status] },
          { label: translate("field.devise"), value: po.currency.code },
          { label: translate("t.montantTotal"), value: formatCurrency(po.total_amount, po.currency.code) },
          { label: translate("field.dateDeCommande"), value: formatDate(po.order_date) },
          { label: translate("col.expectedDelivery"), value: po.expected_delivery_date ? formatDate(po.expected_delivery_date) : "—" },
          { label: translate("t.livraisonReelle"), value: po.actual_delivery_date ? formatDate(po.actual_delivery_date) : "—" },
          { label: translate("field.notes"), value: po.notes ?? "—", className: "sm:col-span-2 lg:col-span-4" },
        ]}
      />

      <PurchaseOrderItemsTab poId={po.id} currencyCode={po.currency.code} />

      <div className="flex flex-wrap items-center justify-between gap-6 rounded-[14px] bg-sidebar px-6 py-5">
        <div className="flex flex-col gap-1">
          <span className="text-[9.5px] font-semibold tracking-[0.14em] text-text-tertiary uppercase">{translate("t.montantTotalDeLaCommande")}</span>
          <span className="text-[12.5px] text-text-quaternary">{translate("t.recalculeAutomatiquementAChaqueModificationDesArticles")}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[30px] leading-none font-extrabold tracking-[-0.03em] text-sidebar-foreground">{formatCurrency(po.total_amount, po.currency.code)}</span>
        </div>
      </div>

      <PurchaseOrderFormDialog open={editOpen} onOpenChange={setEditOpen} purchaseOrder={po} />
    </div>
  );
}
