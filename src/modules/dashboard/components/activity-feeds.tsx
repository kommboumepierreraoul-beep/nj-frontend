import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { translate } from "@/i18n/translate";
import { routes } from "@/config/routes";
import { PAYMENT_METHOD_LABELS } from "@/modules/sales-orders/badges";
import { INVOICE_DOCUMENT_TYPE_LABELS, INVOICE_STATUS_LABELS } from "@/modules/invoices/badges";
import type { SalesOrderPaymentMethod } from "@/modules/sales-orders/types";
import type { InvoiceDocumentType, InvoiceStatus } from "@/modules/invoices/types";
import type { DashboardFeedDocument, DashboardFeedMovement, DashboardFeeds } from "../types";

/**
 * Deux fils d'activité — NJ Global Trade Dashboard.dc.html lignes 666-695 :
 * derniers mouvements de caisse et derniers documents émis, du plus récent au
 * plus ancien, chaque ligne renvoyant vers la commande concernée.
 */
export function ActivityFeeds({ feeds }: { feeds: DashboardFeeds }) {
  return (
    <div className="grid items-start gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))" }}>
      <FeedCard
        title={translate("dashboard.feed.movements.title")}
        hint={translate("dashboard.feed.movements.hint")}
        href={routes.payments.registry}
        empty={feeds.derniers_mouvements.length === 0 ? translate("dashboard.feed.movements.empty") : null}
      >
        {feeds.derniers_mouvements.map((movement, index) => (
          <MovementRow key={`${movement.receipt_number ?? "mvt"}-${index}`} movement={movement} />
        ))}
      </FeedCard>

      <FeedCard
        title={translate("dashboard.feed.documents.title")}
        hint={translate("dashboard.feed.documents.hint")}
        href={routes.invoices.registry}
        empty={feeds.derniers_documents.length === 0 ? translate("dashboard.feed.documents.empty") : null}
      >
        {feeds.derniers_documents.map((document, index) => (
          <DocumentRow key={`${document.invoice_number ?? "doc"}-${index}`} document={document} />
        ))}
      </FeedCard>
    </div>
  );
}

function FeedCard({
  title,
  hint,
  href,
  empty,
  children,
}: {
  title: string;
  hint: string;
  href: string;
  empty: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10px] font-bold tracking-[0.14em] text-text-tertiary uppercase">{title}</span>
          <span className="text-xs text-text-tertiary text-pretty">{hint}</span>
        </div>
        <Link
          href={href}
          className="shrink-0 rounded-lg border-[1.5px] border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          {translate("dashboard.feed.viewAll")}
        </Link>
      </div>
      {empty ? (
        <div className="px-5 py-10 text-center text-[12.5px] text-muted-foreground">{empty}</div>
      ) : (
        <div className="flex flex-col">{children}</div>
      )}
    </div>
  );
}

function Row({ href, children }: { href: string | null; children: React.ReactNode }) {
  const className = "flex items-center gap-3 border-b border-border/60 px-5 py-3.5 last:border-b-0";
  if (!href) return <div className={className}>{children}</div>;
  return (
    <Link href={href} className={cn(className, "transition-colors hover:bg-muted/50")}>
      {children}
    </Link>
  );
}

function MovementRow({ movement }: { movement: DashboardFeedMovement }) {
  const isRefund = movement.direction === "REMBOURSEMENT";
  const Icon = isRefund ? ArrowDownLeft : ArrowUpRight;
  const method = movement.payment_method ? PAYMENT_METHOD_LABELS[movement.payment_method as SalesOrderPaymentMethod] ?? movement.payment_method : "—";

  return (
    <Row href={movement.sales_order_id ? routes.salesOrders.detail(movement.sales_order_id) : null}>
      <span
        className={cn(
          "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]",
          movement.is_voided ? "bg-neutral-bg text-text-quaternary" : isRefund ? "bg-warning-bg text-warning" : "bg-success-bg text-success",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] font-semibold text-foreground">{movement.receipt_number ?? "—"}</span>
        <span className="truncate text-[11.5px] text-text-tertiary">
          {movement.client_full_name ?? "—"} · {method}
          {movement.is_voided ? ` · ${translate("dashboard.feed.voided")}` : ""}
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span
          className={cn(
            "text-[13px] font-bold tabular-nums",
            movement.is_voided ? "text-text-quaternary" : isRefund ? "text-warning" : "text-success",
          )}
        >
          {isRefund ? "− " : ""}
          {formatCurrency(movement.amount, movement.currency ?? "XOF")}
        </span>
        <span className="text-[11px] font-medium text-text-quaternary">{formatDate(movement.paid_at)}</span>
      </div>
    </Row>
  );
}

function DocumentRow({ document }: { document: DashboardFeedDocument }) {
  const typeLabel = document.document_type
    ? INVOICE_DOCUMENT_TYPE_LABELS[document.document_type as InvoiceDocumentType] ?? document.document_type
    : "—";
  const statusLabel = document.status ? INVOICE_STATUS_LABELS[document.status as InvoiceStatus] ?? document.status : "";

  return (
    <Row href={document.sales_order_id ? routes.salesOrders.detail(document.sales_order_id) : null}>
      <span
        className={cn(
          "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]",
          document.document_type === "AVOIR" ? "bg-destructive-bg text-destructive" : "bg-accent-bg text-accent-hover",
        )}
      >
        <FileText className="h-[18px] w-[18px]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] font-semibold text-foreground">{document.invoice_number ?? "—"}</span>
        <span className="truncate text-[11.5px] text-text-tertiary">
          {document.client_full_name ?? "—"} · {typeLabel}
          {document.document_type === "PROFORMA" && document.version ? ` v${document.version}` : ""}
          {statusLabel ? ` · ${statusLabel}` : ""}
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className={cn("text-[13px] font-bold tabular-nums", document.document_type === "AVOIR" ? "text-destructive" : "text-foreground")}>
          {formatCurrency(document.total_amount, document.currency ?? "XOF")}
        </span>
        <span className="text-[11px] font-medium text-text-quaternary">{formatDate(document.issued_at)}</span>
      </div>
    </Row>
  );
}
