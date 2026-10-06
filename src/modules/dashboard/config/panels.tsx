import type { LucideIcon } from "lucide-react";
import {
  ShoppingCart,
  Wallet,
  ReceiptText,
  Users,
  Package,
  Truck,
  ShieldCheck,
  Settings2,
} from "lucide-react";
import type { BadgeProps } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  SALES_ORDER_STATUS_LABELS,
  SALES_ORDER_TYPE_LABELS,
} from "@/modules/sales-orders/badges";
import { INVOICE_DOCUMENT_TYPE_LABELS } from "@/modules/invoices/badges";
import type { SalesOrderPaymentMethod, SalesOrderPaymentStatus, SalesOrderStatus, SalesOrderType } from "@/modules/sales-orders/types";
import type { InvoiceDocumentType } from "@/modules/invoices/types";
import type { DashboardPanelCode } from "../types";

type Tone = NonNullable<BadgeProps["tone"]>;
type PanelTone = Extract<Tone, "accent" | "success" | "neutral" | "warning" | "destructive">;

export interface PanelConfig {
  icon: LucideIcon;
  tone: PanelTone;
  href: string;
  linkKey: string;
  /** Libellé d'une métrique (`metrique.code`). */
  metricLabel: (code: string) => string;
  /** Libellé d'une barre (`barre.code`). */
  barLabel?: (code: string) => string;
  /** Libellé d'une entrée de pied de carte (`pied` : clé → libellé). */
  footLabel?: (code: string) => string;
}

/** `dashboard.panel.<panel>.title` / `.hint` — voir src/i18n/messages.ts. */
export function panelTitle(code: DashboardPanelCode): string {
  return translate(`dashboard.panel.${code}.title`);
}

export function panelHint(code: DashboardPanelCode): string {
  return translate(`dashboard.panel.${code}.hint`);
}

const metric = (panel: DashboardPanelCode) => (code: string) => translate(`dashboard.panel.${panel}.metric.${code}`);

export const PANEL_CONFIG: Record<DashboardPanelCode, PanelConfig> = {
  pipeline_commercial: {
    icon: ShoppingCart,
    tone: "accent",
    href: routes.salesOrders.list,
    linkKey: "dashboard.panel.pipeline_commercial.link",
    metricLabel: metric("pipeline_commercial"),
    barLabel: (code) => SALES_ORDER_STATUS_LABELS[code as SalesOrderStatus] ?? code,
    footLabel: (code) => SALES_ORDER_TYPE_LABELS[code as SalesOrderType] ?? code,
  },
  tresorerie: {
    icon: Wallet,
    tone: "success",
    href: routes.payments.registry,
    linkKey: "dashboard.panel.tresorerie.link",
    metricLabel: metric("tresorerie"),
    barLabel: (code) => PAYMENT_METHOD_LABELS[code as SalesOrderPaymentMethod] ?? code,
    footLabel: (code) => PAYMENT_STATUS_LABELS[code as SalesOrderPaymentStatus] ?? code,
  },
  documents_emis: {
    icon: ReceiptText,
    tone: "accent",
    href: routes.invoices.registry,
    linkKey: "dashboard.panel.documents_emis.link",
    metricLabel: (code) =>
      INVOICE_DOCUMENT_TYPE_LABELS[code as InvoiceDocumentType] ?? translate(`dashboard.panel.documents_emis.metric.${code}`),
  },
  portefeuille_clients: {
    icon: Users,
    tone: "accent",
    href: routes.clients.list,
    linkKey: "dashboard.panel.portefeuille_clients.link",
    metricLabel: metric("portefeuille_clients"),
    barLabel: (code) => translate(`dashboard.segment.${code}`),
  },
  catalogue: {
    icon: Package,
    tone: "neutral",
    href: routes.products.list,
    linkKey: "dashboard.panel.catalogue.link",
    metricLabel: metric("catalogue"),
    barLabel: (code) => translate(`dashboard.variantLevel.${code}`),
    footLabel: (code) => translate(`dashboard.panel.catalogue.foot.${code}`),
  },
  sourcing_fournisseurs: {
    icon: Truck,
    tone: "success",
    href: routes.suppliers.list,
    linkKey: "dashboard.panel.sourcing_fournisseurs.link",
    metricLabel: metric("sourcing_fournisseurs"),
    barLabel: (code) => translate(`dashboard.reliability.${code}`),
  },
  acces_tracabilite: {
    icon: ShieldCheck,
    tone: "neutral",
    href: routes.users.list,
    linkKey: "dashboard.panel.acces_tracabilite.link",
    metricLabel: metric("acces_tracabilite"),
  },
  configuration: {
    icon: Settings2,
    tone: "accent",
    href: routes.settings.hub,
    linkKey: "dashboard.panel.configuration.link",
    metricLabel: metric("configuration"),
  },
};

export const PANEL_ICON_TONE: Record<PanelTone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  destructive: "bg-destructive-bg text-destructive",
  neutral: "bg-neutral-bg text-neutral",
  accent: "bg-accent-bg text-accent-hover",
};

export const METRIC_TONE_TEXT: Record<"accent" | "success" | "warning" | "danger", string> = {
  accent: "text-accent-hover",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
};
