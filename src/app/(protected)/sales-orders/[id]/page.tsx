"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { Ban, CircleDollarSign, Download, FolderOpen, History, ListChecks, Pencil, Receipt, RefreshCw, TriangleAlert, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/data-display/page-header";
import { ErrorState } from "@/components/data-display/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportDialog } from "@/components/forms/export-dialog";
import { SalesOrderEditDialog } from "@/modules/sales-orders/components/sales-order-edit-dialog";
import { ChangeStatusDialog } from "@/modules/sales-orders/components/change-status-dialog";
import { RecordPaymentDialog } from "@/modules/sales-orders/components/record-payment-dialog";
import { SalesOrderItemsTab } from "@/modules/sales-orders/components/sales-order-items-tab";
import { SalesOrderPaymentsTab } from "@/modules/sales-orders/components/sales-order-payments-tab";
import { SalesOrderStatusHistoryTab } from "@/modules/sales-orders/components/sales-order-status-history-tab";
import { SalesOrderAttachmentsTab } from "@/modules/sales-orders/components/sales-order-attachments-tab";
import { InvoiceHistoryTab } from "@/modules/invoices/components/invoice-history-tab";
import { useSalesOrder } from "@/modules/sales-orders/hooks/use-sales-order";
import { salesOrdersApi } from "@/modules/sales-orders/api/sales-orders.api";
import { buildSalesOrderExportRows } from "@/modules/sales-orders/export";
import {
  COMMISSION_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  SALES_ORDER_STATUS_LABELS,
  SALES_ORDER_STATUS_TONES,
  SALES_ORDER_TYPE_LABELS,
  TRANSPORT_MODE_LABELS,
} from "@/modules/sales-orders/badges";
import { BILLING_MODE_LABELS } from "@/modules/clients/badges";
import { routes } from "@/config/routes";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { exportRows, exportStamp, type ExportFormat } from "@/lib/export";
import { ApiError } from "@/lib/http/api-error";
import { cn } from "@/lib/utils";
import { translate } from "@/i18n/translate";

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

/** Doc/spec_pages_commandes.md § 2 « Fiche commande » — vue à 360°, onglets Lignes/Paiements/Historique de statut/Documents. */
export default function SalesOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const salesOrderId = Number(id);
  if (!Number.isInteger(salesOrderId)) notFound();

  const query = useSalesOrder(salesOrderId);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const salesOrder = query.data;
  const isCancelled = salesOrder.status === "ANNULEE";
  const isValidityExpired = Boolean(salesOrder.valid_until) && new Date(salesOrder.valid_until as string) < new Date() && salesOrder.payment_status !== "PAYEE";
  const isSoldedByCreditNote = salesOrder.payment_status === "PAYEE" && salesOrder.credited_amount > 0;
  const daysLeft = daysUntil(salesOrder.valid_until);

  /** Doc/spec_pages_commandes.md § « Fiche commande » — un seul bandeau à la fois, priorité annulation > soldée par avoir > proforma expirée (NJ Global Trade Commandes.dc.html lignes 1793-1798). */
  const alert = isCancelled
    ? {
        tone: "warn" as const,
        icon: Ban,
        title: translate("t.commandeAnnulee"),
        text: `${translate("t.commandeAnnuleeLePrefix", { x: salesOrder.cancelled_at ? formatDateTime(salesOrder.cancelled_at) : "—" })}${salesOrder.cancellation_reason ? translate("t.motifSuffix", { x: salesOrder.cancellation_reason }) : ""}`,
      }
    : isSoldedByCreditNote
      ? {
          tone: "info" as const,
          icon: Undo2,
          title: translate("t.soldeeParAvoir"),
          text: translate("t.leSoldeRestantDuAEteCouvertParUnOuPlusieursAvoirsS"),
        }
      : isValidityExpired
        ? {
            tone: "warn" as const,
            icon: TriangleAlert,
            title: translate("t.proformaExpiree"),
            text: translate("t.proformaExpireeDepuisRelance", { x: formatDate(salesOrder.valid_until as string) }),
          }
        : null;

  /**
   * Doc/design_system_maquette_complete.md § 4.7 — « bon de commande » d'une
   * commande précise (NJ Global Trade Commandes.dc.html, dialogue « export »).
   * Récupère systématiquement lignes/paiements/historique (indépendamment des
   * sections cochées) : « Encaissé »/« Reste dû » en dépendent toujours, et
   * l'utilisateur peut exporter sans avoir ouvert les onglets correspondants.
   */
  async function handleExport(format: ExportFormat, values: Record<string, boolean>) {
    setIsExporting(true);
    try {
      const [itemsResponse, paymentsResponse, historyResponse] = await Promise.all([
        salesOrdersApi.items(salesOrderId),
        salesOrdersApi.payments(salesOrderId),
        salesOrdersApi.statusHistory(salesOrderId),
      ]);
      const rows = buildSalesOrderExportRows(salesOrder, itemsResponse.data, paymentsResponse.data, historyResponse.data, {
        scope_items: values.scope_items ?? false,
        scope_payments: values.scope_payments ?? false,
        scope_history: values.scope_history ?? false,
        scope_commission: values.scope_commission ?? false,
        only_selected: values.only_selected ?? false,
      });
      const ok = exportRows(format, `bon-de-commande-${salesOrder.reference}-${exportStamp()}`, `Bon de commande ${salesOrder.reference}`, rows);
      if (!ok) {
        toast.error(translate("t.leNavigateurABloqueLaFenetreAutorisezLesPopUps"));
        return;
      }
      toast.success(translate("t.exportXGenere", { x: format }));
      setExportOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : translate("toast.exportImpossible"));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Commandes clients", href: routes.salesOrders.list }, { label: salesOrder.reference }]}
        title={salesOrder.reference}
        badges={
          <>
            <Badge tone="neutral">{SALES_ORDER_TYPE_LABELS[salesOrder.type]}</Badge>
            <Badge tone={SALES_ORDER_STATUS_TONES[salesOrder.status]}>{SALES_ORDER_STATUS_LABELS[salesOrder.status]}</Badge>
            <Badge tone={PAYMENT_STATUS_TONES[salesOrder.payment_status]}>
              {PAYMENT_STATUS_LABELS[salesOrder.payment_status]}
              {isSoldedByCreditNote ? ` ${translate("t.soldeeParAvoir2")}` : ""}
            </Badge>
            {isValidityExpired ? <Badge tone="destructive">{translate("t.proformaExpireeARelancer")}</Badge> : null}
          </>
        }
        description={`${salesOrder.client.full_name} · ${translate("t.commandeDuX", { x: formatDate(salesOrder.order_date) })} · ${BILLING_MODE_LABELS[salesOrder.billing_mode]}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4" />
              {translate("action.export")}
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              {translate("action.edit")}
            </Button>
            <Button variant="outline" onClick={() => setStatusOpen(true)}>
              <RefreshCw className="h-4 w-4" />
              {translate("t.changerLeStatut")}
            </Button>
            <Button onClick={() => setPaymentOpen(true)}>
              <CircleDollarSign className="h-4 w-4" />
              {translate("t.enregistrerUnEncaissementBtn")}
            </Button>
          </>
        }
      />

      {/* Carte « Informations générales » — NJ Global Trade Commandes.dc.html lignes 371-418 (title + grille 4 colonnes + bandeau d'alerte). */}
      <div className="flex flex-col gap-5 rounded-[14px] border border-border bg-surface px-6 py-[22px]">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.informationsGenerales")}</p>

        <div className="grid grid-cols-2 gap-x-[26px] gap-y-[18px] border-t border-border pt-[18px] sm:grid-cols-4">
          <InfoItem label={translate("field.client")} value={salesOrder.client.full_name} />
          <InfoItem label={translate("field.type")} value={SALES_ORDER_TYPE_LABELS[salesOrder.type]} />
          <InfoItem label={translate("field.devise")} value={salesOrder.currency.code} />
          <InfoItem label={translate("field.modeDeFacturation")} value={BILLING_MODE_LABELS[salesOrder.billing_mode]} />

          <InfoItem label={translate("t.sousTotalLabel")} value={formatCurrency(salesOrder.subtotal_amount, salesOrder.currency.code)} />
          <InfoItem label={translate("t.remiseGlobaleLabel")} value={formatCurrency(salesOrder.discount_amount, salesOrder.currency.code)} />
          <InfoItem
            label={translate("t.commissionFigee")}
            value={
              salesOrder.commission_amount !== null
                ? `${formatCurrency(salesOrder.commission_amount, salesOrder.currency.code)}${salesOrder.commission_type ? ` (${COMMISSION_TYPE_LABELS[salesOrder.commission_type]}${salesOrder.commission_rate_applied !== null ? ` — ${salesOrder.commission_rate_applied}${salesOrder.commission_type === "POURCENTAGE" ? "%" : ""}` : ""})` : ""}${salesOrder.commission_rule ? ` — ${salesOrder.commission_rule.label}` : ""}`
                : null
            }
          />
          <InfoItem
            label={translate("guide.p.tva")}
            value={
              salesOrder.tax_rate !== null
                ? `${formatCurrency(salesOrder.tax_amount, salesOrder.currency.code)} (${Number(salesOrder.tax_rate)}%)`
                : null
            }
          />
          <InfoItem
            label={salesOrder.tax_rate !== null ? translate("t.totalTtcLabel") : translate("t.totalLabel")}
            value={formatCurrency(salesOrder.total_amount, salesOrder.currency.code)}
          />

          <InfoItem label={translate("field.dateDeCommande")} value={formatDate(salesOrder.order_date)} />
          <InfoItem
            label={translate("t.validite")}
            value={
              salesOrder.valid_until
                ? `${formatDate(salesOrder.valid_until)}${daysLeft === null ? "" : daysLeft < 0 ? ` (${translate("t.expireeDepuisXJ", { x: Math.abs(daysLeft) })})` : ` (${translate("t.xJRestants", { x: daysLeft })})`}`
                : null
            }
            tone={isValidityExpired ? "warning" : "default"}
          />
          <InfoItem label={translate("t.transportLabel")} value={TRANSPORT_MODE_LABELS[salesOrder.transport_mode]} />
          <InfoItem label={translate("field.transporteur")} value={salesOrder.carrier_name} />

          <InfoItem label={translate("t.noDeSuivi")} value={salesOrder.tracking_number} />
          <InfoItem label={translate("t.poidsEstReel")} value={`${salesOrder.estimated_weight_kg ?? 0} / ${salesOrder.actual_weight_kg ?? 0} kg`} />
          <InfoItem label={translate("t.volumeEstReel")} value={`${salesOrder.estimated_volume_cbm ?? 0} / ${salesOrder.actual_volume_cbm ?? 0} cbm`} />
          <InfoItem label={translate("t.confirmeeLe")} value={salesOrder.confirmed_at ? formatDateTime(salesOrder.confirmed_at) : null} />

          <InfoItem label={translate("t.expedieeLe")} value={salesOrder.shipped_at ? formatDateTime(salesOrder.shipped_at) : null} />
          <InfoItem label={translate("t.livreeLe")} value={salesOrder.delivered_at ? formatDateTime(salesOrder.delivered_at) : null} />
          <InfoItem label={translate("t.clotureeLe")} value={salesOrder.closed_at ? formatDateTime(salesOrder.closed_at) : null} />
          <InfoItem label={translate("t.annuleeLe")} value={salesOrder.cancelled_at ? formatDateTime(salesOrder.cancelled_at) : null} />

          <InfoItem label={translate("t.notesProforma")} value={salesOrder.notes} className="col-span-2" />
          <InfoItem label={translate("field.notesInternes")} value={salesOrder.internal_notes} className="col-span-2" />
        </div>

        {alert ? (
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl border px-4 py-3.5",
              alert.tone === "warn" ? "border-destructive/25 bg-destructive-bg" : "border-border bg-background/60",
            )}
          >
            <alert.icon className={cn("mt-0.5 h-5 w-5 shrink-0", alert.tone === "warn" ? "text-destructive" : "text-muted-foreground")} />
            <div className="flex flex-col gap-0.5">
              <p className={cn("text-[12.5px] font-bold", alert.tone === "warn" ? "text-destructive" : "text-foreground")}>{alert.title}</p>
              <p className={cn("text-[12.5px] leading-[1.5] text-pretty", alert.tone === "warn" ? "text-destructive" : "text-muted-foreground")}>{alert.text}</p>
            </div>
          </div>
        ) : null}
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">
            <ListChecks className="h-[18px] w-[18px]" />
            {translate("tab.items")}
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CircleDollarSign className="h-[18px] w-[18px]" />
            {translate("tab.payments")}
          </TabsTrigger>
          <TabsTrigger value="status-history">
            <History className="h-[18px] w-[18px]" />
            {translate("tab.statusHistory")}
          </TabsTrigger>
          <TabsTrigger value="documents">
            <Receipt className="h-[18px] w-[18px]" />
            {translate("tab.documents")}
          </TabsTrigger>
          <TabsTrigger value="attachments">
            <FolderOpen className="h-[18px] w-[18px]" />
            {translate("tab.attachments")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <SalesOrderItemsTab salesOrderId={salesOrder.id} orderType={salesOrder.type} currencyCode={salesOrder.currency.code} />
        </TabsContent>
        <TabsContent value="payments">
          <SalesOrderPaymentsTab salesOrder={salesOrder} />
        </TabsContent>
        <TabsContent value="status-history">
          <SalesOrderStatusHistoryTab salesOrderId={salesOrder.id} />
        </TabsContent>
        <TabsContent value="documents">
          <InvoiceHistoryTab salesOrder={salesOrder} />
        </TabsContent>
        <TabsContent value="attachments">
          <SalesOrderAttachmentsTab salesOrderId={salesOrder.id} />
        </TabsContent>
      </Tabs>

      <SalesOrderEditDialog open={editOpen} onOpenChange={setEditOpen} salesOrder={salesOrder} />
      <ChangeStatusDialog open={statusOpen} onOpenChange={setStatusOpen} salesOrder={salesOrder} />
      <RecordPaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} salesOrder={salesOrder} />
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title={translate("page.salesOrderExport.title")}
        subtitle={translate("page.salesOrderExport.subtitle")}
        defaultFormat="PDF"
        options={[
          { key: "scope_items", label: translate("t.lignesDeLaCommandeLabel"), help: translate("t.produitsOuPrestationsQuantitesPrixEtSousTotaux"), defaultChecked: true },
          { key: "scope_payments", label: translate("t.encaissementsLabel"), help: translate("t.montantsMethodesNumerosDeRecuLesMouvementsAnnulesS"), defaultChecked: true },
          { key: "scope_history", label: translate("tab.statusHistory") },
          {
            key: "scope_commission",
            label: translate("t.detailDeLaCommission"),
            help: translate("t.decochezPourUnDocumentDestineAuClientEnModePrixGlo"),
            defaultChecked: salesOrder.billing_mode !== "PRIX_GLOBAL",
          },
          { key: "only_selected", label: translate("t.lignesRetenuesUniquementLabel"), help: translate("t.recommandeExclutLesOptionsNonRetenuesDuComparatif3"), defaultChecked: true },
        ]}
        isPending={isExporting}
        onSubmit={handleExport}
      />
    </div>
  );
}

/** Champ de la carte « Informations générales » — libellé 9.5px/600/tracking large gris tertiaire, valeur 13.5px/500 (NJ Global Trade Commandes.dc.html lignes 390-395), tiret gris quaternaire quand la valeur est absente. */
function InfoItem({
  label,
  value,
  className,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
  tone?: "default" | "warning";
}) {
  const isEmpty = value === null || value === undefined || value === "";
  return (
    <div className={cn("flex min-w-0 flex-col gap-[5px]", className)}>
      <p className="text-[9.5px] font-semibold tracking-[0.13em] text-text-tertiary uppercase">{label}</p>
      <p
        className={cn(
          "text-[13.5px] leading-[1.45] font-medium text-pretty break-words",
          isEmpty ? "text-text-quaternary" : tone === "warning" ? "text-warning" : "text-foreground",
        )}
      >
        {isEmpty ? "—" : value}
      </p>
    </div>
  );
}
