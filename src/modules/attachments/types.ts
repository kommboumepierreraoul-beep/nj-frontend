/**
 * Composant transverse « Pièces jointes » (Doc/spec_pages_produits.md
 * § « Composant transverse : Pièces jointes », repris par Clients/Commandes/
 * Fournisseurs). `AttachableType`/`AttachmentType` s'enrichissent module par
 * module (voir chaque spec) — cette liste réunit tous les cas rencontrés à ce
 * jour plutôt que de la dupliquer par module.
 *
 * Forme vérifiée contre `AttachmentResource::toArray()` (nj-backend) : l'API
 * ne renvoie jamais d'URL absolue, seulement `file_path` (relatif au disque
 * `public`) — toujours passer par `storageUrl()` (`@/lib/media`) pour
 * afficher un visuel, jamais un champ `*_path` en `src` directement.
 * `media_types` n'est présent que lorsque la relation `mediaTypes` a été
 * chargée côté backend (`AttachmentController::index` la charge toujours,
 * d'où l'absence de `?` ici malgré le `whenLoaded`).
 */
export type AttachableType = "product" | "supplier" | "client" | "sales_order" | "invoice";

export type AttachmentType =
  | "PRODUCT_IMAGE"
  | "PAYMENT_PROOF"
  | "SUPPLIER_DOCUMENT"
  | "CLIENT_DOCUMENT"
  | "SALES_ORDER_PROFORMA"
  | "SALES_ORDER_RECEIPT"
  | "SALES_ORDER_DELIVERY_NOTE"
  | "INVOICE_DOCUMENT"
  | "OTHER";

export interface Attachment {
  id: number;
  attachable_type: AttachableType;
  attachable_id: number;
  file_name: string;
  /** Chemin relatif au disque `public` — jamais une URL absolue. Résoudre avec `storageUrl()`. */
  file_path: string;
  mime_type: string;
  size_kb: number;
  media_types: AttachmentType[];
  is_primary: boolean;
  sort_order: number;
  uploaded_by_user_id: number | null;
  uploaded_at: string;
}

export interface CreateAttachmentPayload {
  attachable_type: AttachableType;
  attachable_id: number;
  file: File;
  media_types: AttachmentType[];
  is_primary?: boolean;
  sort_order?: number;
}

export interface UpdateAttachmentPayload {
  media_types?: AttachmentType[];
  is_primary?: boolean;
  sort_order?: number;
}

export interface AttachmentListFilters {
  attachable_type: AttachableType;
  attachable_id: number;
}
