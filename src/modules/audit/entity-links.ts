import { routes } from "@/config/routes";
import type { AuditEntityType } from "./types";

/**
 * Point de cadrage § 3.1 de la spec ("pas de lien cliquable proposé ici, les
 * routes de chaque module n'étaient pas encore stabilisées au moment de la
 * rédaction") : les routes de tous les modules sont maintenant fixées
 * (Doc/frontend_architecture_structure.md, tous construits dans cette
 * session) — on ajoute donc le lien direct pour les entités identifiables
 * par leur seul `entity_id`. Les entités imbriquées (ex. `SupplierContact`,
 * qui a besoin de l'identifiant du fournisseur parent, absent du journal)
 * restent en texte simple, comme la spec le prévoyait par défaut.
 */
export function resolveEntityHref(entityType: AuditEntityType, entityId: number): string | null {
  switch (entityType) {
    case "User":
      return routes.users.detail(entityId);
    case "SalesOrder":
      return routes.salesOrders.detail(entityId);
    case "Product":
      return routes.products.detail(entityId);
    case "Supplier":
      return routes.suppliers.detail(entityId);
    case "Rfq":
      return routes.suppliers.rfqDetail(entityId);
    case "PurchaseOrder":
      return routes.suppliers.purchaseOrderDetail(entityId);
    case "Client":
      return routes.clients.detail(entityId);
    default:
      return null;
  }
}
