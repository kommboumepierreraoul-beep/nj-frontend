import type { LucideIcon } from "lucide-react";
import { Building2, UserPlus, PackagePlus, ShoppingCart, ReceiptText, CircleDollarSign } from "lucide-react";
import { routes } from "./routes";

/**
 * « Prise en main » — mode d'accueil simplifié pour le démarrage.
 *
 * Le système compte 44 écrans ; le premier jour, on n'en impose que 5–6. Ce
 * panneau s'affiche en haut du tableau de bord, se masque en un clic
 * (`localStorage[QUICK_START_STORAGE_KEY]`) et ne retire jamais rien du menu :
 * tout le reste reste accessible depuis la barre latérale.
 *
 * Pour rouvrir la prise en main après l'avoir masquée : bouton « Afficher la
 * prise en main » laissé en place, ou suppression de la clé localStorage.
 */
export const QUICK_START_STORAGE_KEY = "nj.quickStart.dismissed";

export interface QuickStartAction {
  id: string;
  href: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  /** Visible si l'utilisateur détient AU MOINS une de ces permissions (vide/absent = toujours visible). */
  anyPermission?: string[];
  /** Clé de `TOURS` (src/config/tours.ts) : affiche un bouton « Suivez le guide » qui lance la visite interactive sur la page cible. */
  tourId?: string;
}

export const QUICK_START_ACTIONS: QuickStartAction[] = [
  {
    id: "company",
    href: routes.settings.company,
    icon: Building2,
    titleKey: "quickStart.company.title",
    descKey: "quickStart.company.desc",
    anyPermission: ["company_settings.view", "company_settings.manage"],
    tourId: "company",
  },
  {
    id: "client",
    href: routes.clients.list,
    icon: UserPlus,
    titleKey: "quickStart.client.title",
    descKey: "quickStart.client.desc",
    anyPermission: ["clients.view", "clients.manage"],
    tourId: "client",
  },
  {
    id: "product",
    href: routes.products.list,
    icon: PackagePlus,
    titleKey: "quickStart.product.title",
    descKey: "quickStart.product.desc",
    anyPermission: ["products.view", "products.manage"],
    tourId: "product",
  },
  {
    id: "order",
    href: routes.salesOrders.list,
    icon: ShoppingCart,
    titleKey: "quickStart.order.title",
    descKey: "quickStart.order.desc",
    anyPermission: ["sales_orders.view", "sales_orders.manage"],
    tourId: "order",
  },
  {
    id: "invoices",
    href: routes.invoices.registry,
    icon: ReceiptText,
    titleKey: "quickStart.invoices.title",
    descKey: "quickStart.invoices.desc",
    anyPermission: ["invoices.view"],
  },
  {
    id: "payments",
    href: routes.payments.registry,
    icon: CircleDollarSign,
    titleKey: "quickStart.payments.title",
    descKey: "quickStart.payments.desc",
    anyPermission: ["sales_orders.view", "sales_orders.manage_payments"],
  },
];
