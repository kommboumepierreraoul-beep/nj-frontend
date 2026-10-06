import { AttachmentDropzone } from "@/components/forms/attachment-dropzone";

/**
 * Onglet « Pièces jointes » de la fiche commande — NJ Global Trade
 * Commandes.dc.html ligne 1819 (`tab: "docs"`, séparé de l'onglet
 * « Documents » qui liste les proformas/factures/avoirs, cf.
 * `invoice-history-tab.tsx`). Composant transverse « Pièces jointes »
 * (Doc/spec_pages_commandes.md § « Onglet Documents ») filtré aux 4 types de
 * média pertinents pour une commande.
 */
export function SalesOrderAttachmentsTab({ salesOrderId }: { salesOrderId: number }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Fichiers rattachés à la commande — les documents émis (proforma, facture, avoirs) vivent dans l&apos;onglet « Documents ».
      </p>
      <AttachmentDropzone
        attachableType="sales_order"
        attachableId={salesOrderId}
        mediaTypes={["SALES_ORDER_PROFORMA", "SALES_ORDER_RECEIPT", "SALES_ORDER_DELIVERY_NOTE", "PAYMENT_PROOF"]}
      />
    </div>
  );
}
