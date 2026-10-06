/**
 * Chemins de l'API nj-backend, relatifs à `env.NEXT_PUBLIC_API_BASE_URL`
 * (qui inclut déjà `/api`). Aucune URL en dur ailleurs dans le code — un
 * changement de route côté backend se corrige à un seul endroit.
 *
 * Seul le module `auth` est renseigné pour l'instant (bases du projet). Les
 * autres modules suivent exactement le même schéma : un objet
 * `endpoints.<module>` ajouté ici au moment de construire ce module,
 * construit à partir de la spec correspondante (Doc/spec_pages_*.md) et des
 * fichiers routes/*.php réels — jamais deviné.
 */
export const endpoints = {
  auth: {
    login: "/auth/login",
    googleRedirect: "/auth/google/redirect",
    googleCallback: "/auth/google/callback",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    me: "/auth/me",
    logout: "/auth/logout",
    logoutAll: "/auth/logout-all",
    changePassword: "/auth/change-password",
    sessions: "/auth/sessions",
    revokeSession: (tokenId: number | string) => `/auth/sessions/${tokenId}`,
  },

  /** Composant transverse « Pièces jointes » (Doc/spec_pages_produits.md § Composant transverse). */
  attachments: {
    base: "/attachments",
    detail: (id: number | string) => `/attachments/${id}`,
  },

  dashboard: {
    stats: "/dashboard/stats",
    overview: "/dashboard/overview",
    pendingSalesOrders: "/dashboard/pending-sales-orders",
  },

  /** Référentiels transverses (Doc/spec_pages_clients.md § Conventions générales). */
  referenceData: {
    countries: "/countries",
    currencies: "/currencies",
    units: "/units",
    tags: "/tags",
    tagDetail: (id: number | string) => `/tags/${id}`,
  },

  /** Paramètres → Entreprise (Doc/design_system_maquette_complete.md § 5.10 / § 8.2 — API livrée 2026-09-03). */
  company: {
    settings: "/company-settings",
    settingsLogo: "/company-settings/logo",
    paymentMethods: "/company-payment-methods",
    paymentMethodDetail: (id: number | string) => `/company-payment-methods/${id}`,
    // Écriture des devises (la lecture reste referenceData.currencies).
    currencies: "/currencies",
    currencyDetail: (id: number | string) => `/currencies/${id}`,
    currencyExchangeRates: (id: number | string) => `/currencies/${id}/exchange-rates`,
  },

  clients: {
    categories: "/client-categories",
    categoryDetail: (id: number | string) => `/client-categories/${id}`,
    contactChannels: "/contact-channel-types",
    contactChannelDetail: (id: number | string) => `/contact-channel-types/${id}`,
    base: "/clients",
    detail: (id: number | string) => `/clients/${id}`,
    status: (id: number | string) => `/clients/${id}/status`,
    valueSegment: (id: number | string) => `/clients/${id}/value-segment`,
    contacts: (clientId: number | string) => `/clients/${clientId}/contacts`,
    contactDetail: (clientId: number | string, contactId: number | string) => `/clients/${clientId}/contacts/${contactId}`,
    tags: (clientId: number | string) => `/clients/${clientId}/tags`,
  },

  products: {
    categories: "/product-categories",
    categoryDetail: (id: number | string) => `/product-categories/${id}`,
    base: "/products",
    detail: (id: number | string) => `/products/${id}`,
    tags: (productId: number | string) => `/products/${productId}/tags`,
    variants: (productId: number | string) => `/products/${productId}/variants`,
    variantDetail: (productId: number | string, variantId: number | string) => `/products/${productId}/variants/${variantId}`,
    variantAttributes: (productId: number | string, variantId: number | string) =>
      `/products/${productId}/variants/${variantId}/attribute-values`,
    variantAttributeDetail: (productId: number | string, variantId: number | string, valueId: number | string) =>
      `/products/${productId}/variants/${variantId}/attribute-values/${valueId}`,
    variantSuppliers: (productId: number | string, variantId: number | string) =>
      `/products/${productId}/variants/${variantId}/suppliers`,
    variantSupplierDetail: (productId: number | string, variantId: number | string, linkId: number | string) =>
      `/products/${productId}/variants/${variantId}/suppliers/${linkId}`,
    variantPriceHistory: (productId: number | string, variantId: number | string) =>
      `/products/${productId}/variants/${variantId}/price-history`,
    attributes: "/product-attributes",
    attributeDetail: (id: number | string) => `/product-attributes/${id}`,
    attributeValues: (attributeId: number | string) => `/product-attributes/${attributeId}/values`,
    attributeValueDetail: (attributeId: number | string, valueId: number | string) => `/product-attributes/${attributeId}/values/${valueId}`,
  },

  suppliers: {
    base: "/suppliers",
    detail: (id: number | string) => `/suppliers/${id}`,
    verify: (id: number | string) => `/suppliers/${id}/verify`,
    blacklist: (id: number | string) => `/suppliers/${id}/blacklist`,
    contacts: (supplierId: number | string) => `/suppliers/${supplierId}/contacts`,
    contactDetail: (supplierId: number | string, contactId: number | string) => `/suppliers/${supplierId}/contacts/${contactId}`,
    bankAccounts: (supplierId: number | string) => `/suppliers/${supplierId}/bank-accounts`,
    bankAccountDetail: (supplierId: number | string, accountId: number | string) => `/suppliers/${supplierId}/bank-accounts/${accountId}`,
    documents: (supplierId: number | string) => `/suppliers/${supplierId}/documents`,
    documentDetail: (supplierId: number | string, documentId: number | string) => `/suppliers/${supplierId}/documents/${documentId}`,
    evaluations: (supplierId: number | string) => `/suppliers/${supplierId}/evaluations`,
    evaluationDetail: (supplierId: number | string, evaluationId: number | string) => `/suppliers/${supplierId}/evaluations/${evaluationId}`,
    communicationLogs: (supplierId: number | string) => `/suppliers/${supplierId}/communication-logs`,
    communicationLogDetail: (supplierId: number | string, logId: number | string) => `/suppliers/${supplierId}/communication-logs/${logId}`,
  },

  rfqs: {
    base: "/rfqs",
    detail: (id: number | string) => `/rfqs/${id}`,
    items: (rfqId: number | string) => `/rfqs/${rfqId}/items`,
    itemDetail: (rfqId: number | string, itemId: number | string) => `/rfqs/${rfqId}/items/${itemId}`,
    suppliers: (rfqId: number | string) => `/rfqs/${rfqId}/suppliers`,
    supplierDetail: (rfqId: number | string, rfqSupplierId: number | string) => `/rfqs/${rfqId}/suppliers/${rfqSupplierId}`,
    /** Ressource distincte `rfq-suppliers/{id}/quotes` (pas nichée sous /rfqs) — cf. spec_pages_fournisseurs.md § 4. */
    quotes: (rfqSupplierId: number | string) => `/rfq-suppliers/${rfqSupplierId}/quotes`,
    quoteDetail: (rfqSupplierId: number | string, quoteId: number | string) => `/rfq-suppliers/${rfqSupplierId}/quotes/${quoteId}`,
    selectQuote: (rfqSupplierId: number | string, quoteId: number | string) => `/rfq-suppliers/${rfqSupplierId}/quotes/${quoteId}/select`,
  },

  purchaseOrders: {
    base: "/purchase-orders",
    detail: (id: number | string) => `/purchase-orders/${id}`,
    items: (poId: number | string) => `/purchase-orders/${poId}/items`,
    itemDetail: (poId: number | string, itemId: number | string) => `/purchase-orders/${poId}/items/${itemId}`,
  },

  salesOrders: {
    base: "/sales-orders",
    detail: (id: number | string) => `/sales-orders/${id}`,
    status: (id: number | string) => `/sales-orders/${id}/status`,
    items: (id: number | string) => `/sales-orders/${id}/items`,
    itemDetail: (id: number | string, itemId: number | string) => `/sales-orders/${id}/items/${itemId}`,
    payments: (id: number | string) => `/sales-orders/${id}/payments`,
    voidPayment: (id: number | string, paymentId: number | string) => `/sales-orders/${id}/payments/${paymentId}/void`,
    statusHistory: (id: number | string) => `/sales-orders/${id}/status-history`,
    /** Doc/spec_pages_factures.md § 1 — historique unifié PROFORMA/FACTURE/AVOIR, remplace l'usage exclusif de `proformas`. */
    invoices: (id: number | string) => `/sales-orders/${id}/invoices`,
    proformas: (id: number | string) => `/sales-orders/${id}/proformas`,
    emitProforma: (id: number | string) => `/sales-orders/${id}/proforma`,
    /** Valeurs par défaut de la proforma comparative (arguments par variante + notes société). */
    proformaDefaults: (id: number | string) => `/sales-orders/${id}/proforma-defaults`,
  },

  /** Doc/design_system_maquette_complete.md § 6.2 — registre transverse des paiements, toutes commandes confondues. */
  salesOrderPayments: {
    base: "/sales-order-payments",
  },

  /** Doc/spec_pages_commandes.md § 3 — Paramètres → Commissions. */
  commissionRules: {
    base: "/commission-rules",
    detail: (id: number | string) => `/commission-rules/${id}`,
  },

  /** Doc/spec_pages_factures.md § 2 — Paramètres → Tarifs de transport. */
  shippingRates: {
    base: "/shipping-rates",
    detail: (id: number | string) => `/shipping-rates/${id}`,
  },

  /** Doc/spec_pages_factures.md § 1 — historique/émission de documents, rattaché à un document précis (pas à une commande). */
  invoices: {
    /** Registre transverse des documents, toutes commandes confondues (page « Factures »). */
    registry: "/invoices",
    detail: (id: number | string) => `/invoices/${id}`,
    creditNotes: (id: number | string) => `/invoices/${id}/credit-notes`,
    payments: (id: number | string) => `/invoices/${id}/payments`,
    /** Doc/communication_whatsapp_manuelle.md § 6 — envoi manuel, jamais planifié. */
    sendWhatsapp: (id: number | string) => `/invoices/${id}/send-whatsapp`,
    relanceWhatsapp: (id: number | string) => `/invoices/${id}/relance-whatsapp`,
  },

  /** Doc/spec_pages_utilisateurs.md § 4/§7 — Gestion des utilisateurs (ADMIN/SUPER_ADMIN). Utilisé aussi en bootstrap minimal par le sélecteur « Auteur » du journal d'audit. */
  users: {
    base: "/users",
    detail: (id: number | string) => `/users/${id}`,
    status: (id: number | string) => `/users/${id}/status`,
    permissions: (id: number | string) => `/users/${id}/permissions`,
    sessions: (id: number | string) => `/users/${id}/sessions`,
  },

  /** Doc/spec_pages_utilisateurs.md § 5 — D1 (lecture seule) / D2 (SUPER_ADMIN ou `users.manage_permissions`). */
  permissionsCatalog: {
    base: "/permissions",
  },
  rolePermissions: {
    detail: (role: string) => `/roles/${role}/permissions`,
  },

  /** Doc/spec_pages_audit.md § 1 — journal d'activité transversal, lecture seule. */
  audit: {
    base: "/audit-logs",
    detail: (id: number | string) => `/audit-logs/${id}`,
  },

  /** Doc/spec_pages_analyse_flux.md — 5 rapports en lecture seule + export direct (pas de génération asynchrone). */
  flowAnalytics: {
    bottlenecks: "/flow-analytics/bottlenecks",
    purchaseFlow: "/flow-analytics/purchase-flow",
    salesFlow: "/flow-analytics/sales-flow",
    financial: "/flow-analytics/financial",
    activityFlow: "/flow-analytics/activity-flow",
    export: (flow: string) => `/flow-analytics/${flow}/export`,
  },

  /** Doc/spec_pages_analyse_flux.md § 2 — Paramètres → Analyse des flux (seuils). */
  flowStageThresholds: {
    base: "/flow-stage-thresholds",
    detail: (id: number | string) => `/flow-stage-thresholds/${id}`,
  },

  /** Doc/spec_pages_notifications.md — ressource personnelle, aucune permission de rôle. */
  notifications: {
    base: "/notifications",
    unreadCount: "/notifications/unread-count",
    markRead: (id: number | string) => `/notifications/${id}/read`,
    markAllRead: "/notifications/read-all",
  },
  notificationPreferences: {
    base: "/notification-preferences",
  },
} as const;
