import { Package, Receipt, ShieldCheck, ShoppingCart, Truck, Users, Paperclip, type LucideIcon } from "lucide-react";
import type { BadgeProps } from "@/components/ui/badge";
import type { AuditEntityType, AuditModule } from "./types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_audit.md § 1.1 — un module ne part jamais dans la requête API (`entity_type` seul le fait) : sert uniquement à présélectionner la liste des `entity_type` du sélecteur suivant (option (a) recommandée par la spec). */
export const MODULE_ENTITY_TYPES: Record<AuditModule, AuditEntityType[]> = {
  users: ["User"],
  sales_orders: ["SalesOrder", "CommissionRule", "ShippingRate"],
  invoices: ["Invoice"],
  products: ["ProductCategory", "Product", "ProductAttribute", "ProductAttributeValue", "ProductVariant", "ProductVariantAttributeValue", "ProductSupplier", "ProductPriceHistory", "Tag"],
  suppliers: ["Supplier", "SupplierContact", "SupplierBankAccount", "SupplierDocument", "SupplierEvaluation", "SupplierCommunicationLog", "Rfq", "RfqItem", "RfqSupplier", "RfqSupplierQuote", "PurchaseOrder", "PurchaseOrderItem"],
  clients: ["ClientCategory", "ClientContact", "Client", "ContactChannelType"],
  attachments: ["Attachment"],
};

export const MODULE_LABELS: Record<AuditModule, string> = {
  get users() { return translate("badge.audit.module.users"); },
  get sales_orders() { return translate("badge.audit.module.sales_orders"); },
  get invoices() { return translate("badge.audit.module.invoices"); },
  get products() { return translate("badge.audit.module.products"); },
  get suppliers() { return translate("badge.audit.module.suppliers"); },
  get clients() { return translate("badge.audit.module.clients"); },
  get attachments() { return translate("badge.audit.module.attachments"); },
};

export const MODULE_TONES: Record<AuditModule, NonNullable<BadgeProps["tone"]>> = {
  users: "accent",
  sales_orders: "warning",
  invoices: "success",
  products: "products",
  suppliers: "suppliers",
  clients: "clients",
  attachments: "neutral",
};

/** Icône du badge « Module » (NJ Global Trade Audit.dc.html ligne 580) — reprend les icônes déjà associées à chaque module dans la navigation (`src/config/nav-icons.tsx`) plutôt que d'en inventer de nouvelles ; « Pièces jointes » n'a pas d'entrée de menu dédiée, `Paperclip` est le seul ajout propre à ce module. */
export const MODULE_ICONS: Record<AuditModule, LucideIcon> = {
  users: ShieldCheck,
  sales_orders: ShoppingCart,
  invoices: Receipt,
  products: Package,
  suppliers: Truck,
  clients: Users,
  attachments: Paperclip,
};

/** Libellés FR singuliers (§ note sous le tableau 1.2 : sert à générer « <Entité> créé(e)/modifié(e)/supprimé(e) » pour les ~70 combinaisons génériques non listées à la main). */
export const ENTITY_TYPE_LABELS: Record<AuditEntityType, string> = {
  get User() { return translate("badge.audit.entityType.User"); },
  get SalesOrder() { return translate("badge.audit.entityType.SalesOrder"); },
  get CommissionRule() { return translate("badge.audit.entityType.CommissionRule"); },
  get ShippingRate() { return translate("badge.audit.entityType.ShippingRate"); },
  get Invoice() { return translate("badge.audit.entityType.Invoice"); },
  get ProductCategory() { return translate("badge.audit.entityType.ProductCategory"); },
  get Product() { return translate("badge.audit.entityType.Product"); },
  get ProductAttribute() { return translate("badge.audit.entityType.ProductAttribute"); },
  get ProductAttributeValue() { return translate("badge.audit.entityType.ProductAttributeValue"); },
  get ProductVariant() { return translate("badge.audit.entityType.ProductVariant"); },
  get ProductVariantAttributeValue() { return translate("badge.audit.entityType.ProductVariantAttributeValue"); },
  get ProductSupplier() { return translate("badge.audit.entityType.ProductSupplier"); },
  get ProductPriceHistory() { return translate("badge.audit.entityType.ProductPriceHistory"); },
  get Tag() { return translate("badge.audit.entityType.Tag"); },
  get Supplier() { return translate("badge.audit.entityType.Supplier"); },
  get SupplierContact() { return translate("badge.audit.entityType.SupplierContact"); },
  get SupplierBankAccount() { return translate("badge.audit.entityType.SupplierBankAccount"); },
  get SupplierDocument() { return translate("badge.audit.entityType.SupplierDocument"); },
  get SupplierEvaluation() { return translate("badge.audit.entityType.SupplierEvaluation"); },
  get SupplierCommunicationLog() { return translate("badge.audit.entityType.SupplierCommunicationLog"); },
  get Rfq() { return translate("badge.audit.entityType.Rfq"); },
  get RfqItem() { return translate("badge.audit.entityType.RfqItem"); },
  get RfqSupplier() { return translate("badge.audit.entityType.RfqSupplier"); },
  get RfqSupplierQuote() { return translate("badge.audit.entityType.RfqSupplierQuote"); },
  get PurchaseOrder() { return translate("badge.audit.entityType.PurchaseOrder"); },
  get PurchaseOrderItem() { return translate("badge.audit.entityType.PurchaseOrderItem"); },
  get ClientCategory() { return translate("badge.audit.entityType.ClientCategory"); },
  get ClientContact() { return translate("badge.audit.entityType.ClientContact"); },
  get Client() { return translate("badge.audit.entityType.Client"); },
  get ContactChannelType() { return translate("badge.audit.entityType.ContactChannelType"); },
  get Attachment() { return translate("badge.audit.entityType.Attachment"); },
};

export function entityTypeToModule(entityType: AuditEntityType): AuditModule {
  const entry = (Object.entries(MODULE_ENTITY_TYPES) as [AuditModule, AuditEntityType[]][]).find(([, types]) => types.includes(entityType));
  return entry ? entry[0] : "attachments";
}

/** Doc/spec_pages_audit.md § 1.2 — actions « métier » au-delà de created/updated/deleted, à écrire à la main. */
const NAMED_ACTION_LABELS: Record<string, string> = {
  "user.status_changed": "Statut modifié",
  "user.permissions_updated": "Permissions individuelles modifiées",
  "user.sessions_revoked": "Sessions révoquées",
  "sales_order.status_changed": "Statut modifié",
  "sales_order.cancelled": "Commande annulée",
  "sales_order.payment_recorded": "Encaissement enregistré",
  "sales_order.refund_recorded": "Remboursement enregistré",
  "sales_order.payment_voided": "Paiement annulé",
  "invoice.issued": "Document émis",
  "invoice.superseded": "Document remplacé",
  "invoice.credit_note_issued": "Avoir émis",
  "invoice.attachment_deleted": "Pièce jointe supprimée",
  "product.tags_synced": "Étiquettes modifiées",
  "product_price_history.recorded": "Prix enregistré",
  "supplier.verified": "Fournisseur vérifié",
  "supplier.blacklist_updated": "Liste noire modifiée",
  "rfq_supplier_quote.selected": "Devis retenu",
  "client.status_changed": "Statut modifié",
  "client.value_segment_changed": "Segment de valeur modifié",
  "client.tags_synced": "Étiquettes modifiées",
};

/** `PascalCase` → `snake_case`, pour reconstruire la clé technique `<entité>.<verbe>` (convention backend systématique). */
export function toSnakeCase(pascal: string): string {
  return pascal.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

/** Toutes les actions possibles pour un `entity_type` donné : générique (created/updated/deleted) + spécifiques trouvées dans le dictionnaire. `ProductPriceHistory` n'a que `.recorded` (historique immuable), traité comme cas particulier. */
export function actionsForEntityType(entityType: AuditEntityType): { value: string; label: string }[] {
  const prefix = toSnakeCase(entityType);
  const isImmutableHistory = entityType === "ProductPriceHistory";
  const generic = isImmutableHistory ? [] : ["created", "updated", "deleted"].map((verb) => ({ value: `${prefix}.${verb}`, label: resolveActionLabel(entityType, `${prefix}.${verb}`) }));
  const named = Object.keys(NAMED_ACTION_LABELS)
    .filter((key) => key.startsWith(`${prefix}.`) && !generic.some((g) => g.value === key))
    .map((key) => ({ value: key, label: NAMED_ACTION_LABELS[key] }));
  return [...generic, ...named];
}

/** Libellé FR d'une action : dictionnaire nommé en priorité, sinon génération « <Entité> créé(e)/modifié(e)/supprimé(e) » à partir du suffixe. */
export function resolveActionLabel(entityType: AuditEntityType, action: string): string {
  if (NAMED_ACTION_LABELS[action]) return NAMED_ACTION_LABELS[action];
  const label = ENTITY_TYPE_LABELS[entityType];
  if (action.endsWith(".created")) return translate("badge.audit.action.created", { label });
  if (action.endsWith(".updated")) return translate("badge.audit.action.updated", { label });
  if (action.endsWith(".deleted")) return translate("badge.audit.action.deleted", { label });
  return action;
}

const SNAKE_TO_ENTITY_TYPE: Record<string, AuditEntityType> = Object.fromEntries(
  (Object.keys(ENTITY_TYPE_LABELS) as AuditEntityType[]).map((entityType) => [toSnakeCase(entityType), entityType]),
);

/**
 * Doc/spec_pages_analyse_flux.md § « Actions par type » — réutilise le
 * dictionnaire `action` → libellé FR défini ici pour l'onglet Flux d'activité,
 * qui ne dispose que de la clé technique `action` (pas de `entity_type`
 * associé dans cette réponse-là) : on retrouve l'entité à partir du préfixe.
 */
export function resolveActionLabelByKey(action: string): string {
  if (NAMED_ACTION_LABELS[action]) return NAMED_ACTION_LABELS[action];
  const lastDot = action.lastIndexOf(".");
  if (lastDot === -1) return action;
  const entityType = SNAKE_TO_ENTITY_TYPE[action.slice(0, lastDot)];
  return entityType ? resolveActionLabel(entityType, action) : action;
}
