import type { AuthUser } from "@/modules/auth/types";
import type { UserRole } from "@/types/permissions";
import { hasPermission, hasRole } from "@/lib/auth/permissions";
import { translate } from "@/i18n/translate";
import { routes } from "./routes";

/**
 * Sous-entrée d'un module (flyout en barre réduite, liste indentée en barre
 * déployée — voir NJ Global Trade Dashboard.dc.html lignes 322-338).
 *
 * `href: null` = le template prévoit cette entrée mais aucune des 44 pages du
 * plan du site ne lui correspond (point de cadrage ouvert, voir
 * Doc/frontend_architecture_structure.md). L'entrée reste visible pour
 * respecter le template fourni, mais AppSidebar la rend inerte (survol atténué,
 * clic → toast) plutôt que de pointer vers une route inventée.
 */
export interface NavChild {
  label: string;
  /** Clé i18n (src/i18n/messages.ts) — `label` reste le repli français. */
  labelKey?: string;
  href: string | null;
  permissions?: string[];
  roles?: UserRole[];
}

export interface NavItem {
  label: string;
  labelKey?: string;
  /** Clé résolue vers un composant lucide-react par src/config/nav-icons.tsx. */
  icon: string;
  /** Route directe si l'entrée n'a pas de sous-menu. */
  href?: string | null;
  children?: NavChild[];
  /** Un seul des codes suffit (OR) — reflète les paires view/manage du plan du site § 3. */
  permissions?: string[];
  roles?: UserRole[];
}

export interface NavGroup {
  label: string;
  labelKey?: string;
  items: NavItem[];
}

/**
 * Structure calquée sur `navGroups()` de NJ Global Trade Dashboard.dc.html
 * (lignes 915-943) : mêmes groupes, mêmes libellés, mêmes icônes, mêmes
 * sous-entrées, dans le même ordre. Chaque sous-entrée est reliée à sa route
 * réelle dans src/config/routes.ts quand elle existe ; `null` sinon (voir
 * NavChild ci-dessus). Deux choix d'association méritent d'être tracés :
 *
 * - Clients → « Provenances » est relié à `routes.clients.categories` (aucun
 *   nom de route plus proche n'existe) ; à corriger si "provenance" recouvre
 *   en réalité une autre notion côté backend.
 * - Paramètres → les 6 sous-domaines du template (Entreprise, Commercial,
 *   Clients, Catalogue, Documents, Accès) pointent tous vers le même
 *   `routes.settings.hub`, faute de filtrage par domaine côté page (module
 *   Paramètres pas encore construit) — pas d'URL inventée par domaine.
 */
export const navigation: NavGroup[] = [
  {
    label: "Gestion",
    labelKey: "nav.group.gestion",
    items: [
      {
        label: "Produits",
        labelKey: "nav.products",
        icon: "inventory_2",
        permissions: ["products.view", "products.manage"],
        children: [
          { label: "Catalogue", labelKey: "nav.products.catalog", href: routes.products.list },
          { label: "Catégories", labelKey: "nav.products.categories", href: routes.products.categories },
          { label: "Attributs", labelKey: "nav.products.attributes", href: routes.products.attributes },
          { label: "Tags", labelKey: "nav.products.tags", href: routes.products.tags },
        ],
      },
      {
        label: "Clients",
        labelKey: "nav.clients",
        icon: "groups",
        permissions: ["clients.view", "clients.manage"],
        children: [
          { label: "Clients", labelKey: "nav.clients.list", href: routes.clients.list },
          { label: "Provenances", labelKey: "nav.clients.provenances", href: routes.clients.categories },
          { label: "Canaux", labelKey: "nav.clients.channels", href: routes.clients.contactChannels },
        ],
      },
      {
        label: "Fournisseurs",
        labelKey: "nav.suppliers",
        icon: "local_shipping",
        permissions: ["suppliers.view", "suppliers.manage"],
        children: [
          { label: "Liste", labelKey: "nav.suppliers.list", href: routes.suppliers.list },
          { label: "Demandes de prix", labelKey: "nav.suppliers.rfq", href: routes.suppliers.rfqList },
          { label: "Commandes fournisseurs", labelKey: "nav.suppliers.po", href: routes.suppliers.purchaseOrderList },
        ],
      },
      {
        label: "Commandes",
        labelKey: "nav.salesOrders",
        icon: "shopping_cart",
        permissions: ["sales_orders.view", "sales_orders.manage"],
        children: [
          { label: "Commandes clients", labelKey: "nav.salesOrders.list", href: routes.salesOrders.list },
          { label: "Commissions", labelKey: "nav.settings.commissions", href: routes.settings.commissions },
          { label: "Tarifs de transport", labelKey: "nav.settings.shippingRates", href: routes.settings.shippingRates },
        ],
      },
    ],
  },
  {
    label: "Finances",
    labelKey: "nav.group.finances",
    items: [
      {
        label: "Paiements",
        labelKey: "nav.payments",
        icon: "credit_card",
        permissions: ["sales_orders.manage_payments", "sales_orders.view"],
        children: [
          { label: "Liste", labelKey: "nav.payments.list", href: routes.payments.registry },
          { label: "Méthodes", labelKey: "nav.payments.methods", href: null },
        ],
      },
    ],
  },
  {
    label: "Facturation",
    labelKey: "nav.group.facturation",
    items: [
      {
        label: "Factures",
        labelKey: "nav.invoices",
        icon: "receipt_long",
        href: routes.invoices.registry,
        permissions: ["invoices.view"],
      },
    ],
  },
  {
    label: "Rapports & analyses",
    labelKey: "nav.group.rapports",
    items: [
      {
        label: "Analyses",
        labelKey: "nav.analytics",
        icon: "monitoring",
        permissions: ["flow_analytics.view"],
        children: [
          { label: "Flux", labelKey: "nav.analytics.flows", href: routes.flowAnalytics.home },
          { label: "Performances", labelKey: "nav.analytics.performance", href: null },
        ],
      },
      {
        label: "Rapports",
        labelKey: "nav.reports",
        icon: "description",
        href: null,
      },
    ],
  },
  {
    label: "Administration",
    labelKey: "nav.group.administration",
    items: [
      {
        label: "Administration",
        labelKey: "nav.group.administration",
        icon: "admin_panel_settings",
        roles: ["ADMIN", "SUPER_ADMIN"],
        children: [
          { label: "Utilisateurs", labelKey: "nav.users", href: routes.users.list, roles: ["ADMIN", "SUPER_ADMIN"] },
          { label: "Rôles & permissions", labelKey: "nav.users.roles", href: routes.users.roles, roles: ["SUPER_ADMIN"] },
          { label: "Catalogue des permissions", labelKey: "nav.users.permissions", href: routes.users.permissionsCatalog, roles: ["SUPER_ADMIN"] },
          { label: "Journal d'activité", labelKey: "nav.auditLog", href: routes.audit.log, permissions: ["audit_logs.view"] },
          { label: "Mon compte", labelKey: "nav.account", href: routes.account.profile },
        ],
      },
    ],
  },
  {
    label: "Mon espace",
    labelKey: "nav.group.monEspace",
    items: [
      {
        label: "Mon espace",
        labelKey: "nav.myspace",
        icon: "account_circle",
        children: [
          { label: "Centre de notifications", labelKey: "nav.notifications.center", href: routes.notifications.list },
          { label: "Mon compte", labelKey: "nav.account", href: routes.account.profile },
          { label: "Sécurité & sessions", labelKey: "nav.account.security", href: routes.account.security },
        ],
      },
    ],
  },
  {
    label: "Support",
    labelKey: "nav.group.support",
    items: [
      {
        label: "Assistance",
        labelKey: "nav.assistance",
        icon: "support_agent",
        href: null,
      },
      {
        label: "Paramètres",
        labelKey: "nav.settings",
        icon: "settings",
        children: [
          { label: "Entreprise", labelKey: "nav.settings.company", href: routes.settings.company },
          { label: "Commercial", labelKey: "nav.settings.commercial", href: routes.settings.hub },
          { label: "Clients", labelKey: "nav.settings.clients", href: routes.settings.hub },
          { label: "Catalogue", labelKey: "nav.settings.catalog", href: routes.settings.hub },
          { label: "Documents", labelKey: "nav.settings.documents", href: routes.settings.hub },
          { label: "Accès", labelKey: "nav.settings.access", href: routes.settings.hub },
        ],
      },
    ],
  },
];

/** Libellé d'entrée de navigation dans la locale active (repli sur `label` français). */
export function navLabel(entry: { label: string; labelKey?: string }): string {
  return entry.labelKey ? translate(entry.labelKey) : entry.label;
}

export function isNavItemVisible(item: NavItem | NavChild, user: AuthUser | null): boolean {
  if (item.roles && !item.roles.some((role) => hasRole(user, role))) return false;
  if (item.permissions && !item.permissions.some((code) => hasPermission(user, code))) return false;
  return true;
}

/** Sous-entrées visibles d'un module, en respectant leurs propres rôles/permissions. */
export function getVisibleChildren(item: NavItem, user: AuthUser | null): NavChild[] {
  return (item.children ?? []).filter((child) => isNavItemVisible(child, user));
}
