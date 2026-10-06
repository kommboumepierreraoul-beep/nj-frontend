/**
 * Toutes les routes frontend, telles que définies dans le plan du site § 3 de
 * Doc/design_system_maquette_complete.md (44 pages). Jamais de chaîne de
 * route écrite en dur dans un composant — toujours `routes.xxx.yyy` importé
 * d'ici, pour que renommer une URL reste une modification à un seul endroit.
 *
 * Regroupé par module, dans le même ordre que le tableau § 3. Les segments
 * dynamiques sont des fonctions plutôt que des templates figés.
 */
export const routes = {
  home: "/",

  auth: {
    login: "/login",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    googleCallback: "/auth/google/callback",
    changePassword: "/change-password",
  },

  dashboard: {
    home: "/dashboard",
    pendingInvoices: "/dashboard/factures-en-attente",
  },

  clients: {
    categories: "/clients/categories",
    contactChannels: "/clients/canaux-contact",
    list: "/clients",
    detail: (id: number | string) => `/clients/${id}`,
  },

  salesOrders: {
    list: "/sales-orders",
    detail: (id: number | string) => `/sales-orders/${id}`,
  },

  suppliers: {
    list: "/fournisseurs",
    detail: (id: number | string) => `/fournisseurs/${id}`,
    rfqList: "/rfq",
    rfqDetail: (id: number | string) => `/rfq/${id}`,
    purchaseOrderList: "/commandes-fournisseurs",
    purchaseOrderDetail: (id: number | string) => `/commandes-fournisseurs/${id}`,
  },

  products: {
    categories: "/produits/categories",
    list: "/produits",
    detail: (id: number | string) => `/produits/${id}`,
    variantDetail: (id: number | string, variantId: number | string) => `/produits/${id}/variantes/${variantId}`,
    attributes: "/produits/attributs",
    tags: "/produits/tags",
    /** Écran bonus § 6.1 — mêmes données que products.list, vue galerie. */
    gallery: "/catalogue",
  },

  audit: {
    log: "/admin/audit-log",
  },

  flowAnalytics: {
    home: "/flow-analytics",
  },

  notifications: {
    list: "/notifications",
    preferences: "/parametres/notifications",
  },

  account: {
    profile: "/account/profile",
    security: "/account/security",
  },

  users: {
    list: "/admin/users",
    detail: (id: number | string) => `/admin/users/${id}`,
    invite: "/admin/users/new",
    edit: (id: number | string) => `/admin/users/${id}/edit`,
    permissionsCatalog: "/admin/permissions",
    roles: "/admin/roles",
  },

  settings: {
    hub: "/parametres",
    company: "/parametres/entreprise",
    commissions: "/parametres/commissions",
    shippingRates: "/parametres/tarifs-transport",
    flowAnalyticsThresholds: "/parametres/analyse-flux",
  },

  /** Registre transverse des documents (Doc/design_system_maquette_complete.md § 3, page « Factures » autonome). */
  invoices: {
    registry: "/factures",
  },

  /** Écran bonus § 6.2 — registre transverse, sans route API dédiée à ce jour (point de cadrage ouvert). */
  payments: {
    registry: "/paiements",
  },
} as const;
