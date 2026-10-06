"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { ListChecks, Pencil, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsCount } from "@/components/ui/tabs";
import { PageHeader } from "@/components/data-display/page-header";
import { SummaryCard } from "@/components/data-display/summary-card";
import { ErrorState } from "@/components/data-display/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { RfqFormDialog } from "@/modules/rfq/components/rfq-form-dialog";
import { RfqItemsTab } from "@/modules/rfq/components/rfq-items-tab";
import { RfqSuppliersTab } from "@/modules/rfq/components/rfq-suppliers-tab";
import { useRfq } from "@/modules/rfq/hooks/use-rfq";
import { RFQ_STATUS_LABELS, RFQ_STATUS_TONES } from "@/modules/rfq/badges";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/format";
import { translate } from "@/i18n/translate";

export default function RfqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const rfqId = Number(id);
  if (!Number.isInteger(rfqId)) notFound();

  const query = useRfq(rfqId);
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

  const rfq = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: translate("t.rfqCrumb"), href: routes.suppliers.rfqList }, { label: rfq.reference }]}
        title={rfq.reference}
        badges={<Badge tone={RFQ_STATUS_TONES[rfq.status]}>{RFQ_STATUS_LABELS[rfq.status]}</Badge>}
        description={`${translate("t.demandeDuX", { x: formatDate(rfq.request_date) })}${rfq.expected_response_date ? translate("t.reponseAttendueLeX", { x: formatDate(rfq.expected_response_date) }) : ""}`}
        actions={
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            {translate("t.modifierLaRfqBtn")}
          </Button>
        }
      />

      <SummaryCard
        title={translate("section.rfqSummary")}
        fields={[
          { label: translate("col.reference"), value: rfq.reference },
          { label: translate("field.statut"), value: RFQ_STATUS_LABELS[rfq.status] },
          { label: translate("t.dateDeDemande"), value: formatDate(rfq.request_date) },
          { label: translate("col.expectedResponse"), value: rfq.expected_response_date ? formatDate(rfq.expected_response_date) : "—" },
          { label: translate("field.notes"), value: rfq.notes ?? "—", className: "sm:col-span-2 lg:col-span-4" },
        ]}
      />

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">
            <ListChecks className="h-[18px] w-[18px]" />
            {translate("col.items")}
            {typeof rfq.items_count === "number" ? <TabsCount>{rfq.items_count}</TabsCount> : null}
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <Truck className="h-[18px] w-[18px]" />
            {translate("col.suppliersSolicited")}
            {typeof rfq.suppliers_count === "number" ? <TabsCount>{rfq.suppliers_count}</TabsCount> : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <RfqItemsTab rfqId={rfq.id} />
        </TabsContent>
        <TabsContent value="suppliers">
          <RfqSuppliersTab rfqId={rfq.id} />
        </TabsContent>
      </Tabs>

      <RfqFormDialog open={editOpen} onOpenChange={setEditOpen} rfq={rfq} />
    </div>
  );
}
