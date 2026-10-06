"use client";

import { useState } from "react";
import { Bell, Download, FilePlus, MessageCircle, ReceiptText, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data-display/empty-state";
import { ErrorState } from "@/components/data-display/error-state";
import { EmitProformaDialog } from "./emit-proforma-dialog";
import { EmitProformaComparativeDialog } from "./emit-proforma-comparative-dialog";
import { EmitCreditNoteDialog } from "./emit-credit-note-dialog";
import { RecordInvoicePaymentDialog } from "./record-invoice-payment-dialog";
import { useSalesOrderInvoices } from "../hooks/use-sales-order-invoices";
import { useRelanceInvoiceWhatsapp, useSendInvoiceWhatsapp } from "../hooks/use-invoice-mutations";
import { INVOICE_DOCUMENT_TYPE_LABELS, INVOICE_DOCUMENT_TYPE_TONES, INVOICE_STATUS_LABELS, INVOICE_STATUS_TONES } from "../badges";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Invoice } from "../types";
import type { SalesOrder } from "@/modules/sales-orders/types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_factures.md § 1 « Onglet Documents » — historique unifié
 * PROFORMA/FACTURE/AVOIR, aucune action de modification/suppression (tout
 * document émis est immuable). La FACTURE n'a jamais de bouton d'émission
 * manuelle (générée automatiquement au passage à `PAYEE`, § « FACTURE : rien
 * à construire côté émission ») — si la commande est `PAYEE` sans FACTURE
 * dans la liste, un message discret l'explique plutôt qu'un état d'erreur.
 *
 * « Envoyer par WhatsApp »/« Relancer par WhatsApp » (Doc/
 * communication_whatsapp_manuelle.md § 5/§6) : action manuelle uniquement
 * (jamais planifiée, § 0.1 du même document) — routes/contrôleur réels
 * (`InvoiceController::sendWhatsapp()`/`relanceWhatsapp()`) déjà livrés côté
 * backend mais jusqu'ici sans aucune UI. L'envoi pose `sent_at`/statut
 * `ENVOYEE` en cas de succès (d'où le badge « Envoyée », jusqu'ici prévu mais
 * jamais réellement atteignable) ; la relance ne modifie rien sur le document
 * lui-même, réservée à la PROFORMA.
 */
export function InvoiceHistoryTab({ salesOrder }: { salesOrder: SalesOrder }) {
  const query = useSalesOrderInvoices(salesOrder.id);
  const [emitProformaOpen, setEmitProformaOpen] = useState(false);
  const [creditNoteTarget, setCreditNoteTarget] = useState<Invoice | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Invoice | null>(null);
  const sendWhatsappMutation = useSendInvoiceWhatsapp(salesOrder.id);
  const relanceWhatsappMutation = useRelanceInvoiceWhatsapp();

  const invoices = query.data ?? [];
  const hasExistingProforma = invoices.some((invoice) => invoice.document_type === "PROFORMA");
  const hasFacture = invoices.some((invoice) => invoice.document_type === "FACTURE");
  const canEmitProforma = salesOrder.status !== "ANNULEE" && salesOrder.status !== "CLOTUREE";

  // Doc/communication_whatsapp_manuelle.md § 5 : InvoiceController::sendWhatsapp()
  // refuse un AVOIR et un document ANNULEE/REMPLACEE (EMISE/ENVOYEE restent
  // tous deux éligibles à un renvoi manuel) ; relanceWhatsapp() est réservée à
  // la PROFORMA, mêmes statuts exclus.
  const isDocumentActive = (invoice: Invoice) => invoice.status !== "ANNULEE" && invoice.status !== "REMPLACEE";
  // Le RECU (Doc/factures_recu_addendum.md) est un document interne de preuve de règlement :
  // ni envoi/relance WhatsApp, ni paiement rattaché, ni avoir — seul le téléchargement PDF
  // reste disponible.
  const canSendWhatsapp = (invoice: Invoice) =>
    invoice.document_type !== "AVOIR" && invoice.document_type !== "RECU" && isDocumentActive(invoice);
  const canRelanceWhatsapp = (invoice: Invoice) => invoice.document_type === "PROFORMA" && isDocumentActive(invoice);

  const columns: DataTableColumn<Invoice>[] = [
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Badge tone={INVOICE_DOCUMENT_TYPE_TONES[row.document_type]}>{INVOICE_DOCUMENT_TYPE_LABELS[row.document_type]}</Badge>
          {/* Doc/spec_pages_factures.md § « Tampon de règlement » — texte court sur la ligne, le PDF garde le libellé complet. */}
          {row.document_type === "FACTURE" ? <Badge tone="success">{translate("t.payeIntegralement")}</Badge> : null}
          {row.supersedes_invoice_id ? <Badge tone="neutral">Remplace v{(row.version ?? 1) - 1}</Badge> : null}
        </div>
      ),
    },
    { key: "version", header: "Version", render: (row) => (row.document_type === "PROFORMA" && row.version ? `v${row.version}` : "—") },
    { key: "number", header: translate("col.number"), render: (row) => row.invoice_number },
    {
      key: "status",
      header: "Statut",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <Badge tone={INVOICE_STATUS_TONES[row.status]}>{INVOICE_STATUS_LABELS[row.status]}</Badge>
          {row.sent_at ? <span className="text-[10px] text-muted-foreground">Envoyé le {formatDateTime(row.sent_at)}</span> : null}
        </div>
      ),
    },
    { key: "amount", header: "Montant", render: (row) => `${row.document_type === "AVOIR" ? "− " : ""}${formatCurrency(row.total_amount, row.currency.code)}` },
    { key: "issued_at", header: translate("col.issuedAt"), render: (row) => formatDateTime(row.issued_at) },
    { key: "issued_by", header: translate("col.issuedBy"), render: (row) => row.issued_by?.name ?? "—" },
    {
      key: "credits",
      header: "",
      render: (row) => (row.document_type === "AVOIR" && row.credits ? <span className="text-xs text-muted-foreground">Crédite : {row.credits.invoice_number}</span> : null),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <a href={row.pdf_url} target="_blank" rel="noreferrer" title={translate("t.telechargerLePdf")}>
            <Button variant="ghost" size="icon" type="button">
              <Download className="h-4 w-4" />
            </Button>
          </a>
          {canSendWhatsapp(row) ? (
            <Button
              variant="ghost"
              size="icon"
              title={translate("t.envoyerParWhatsapp")}
              disabled={sendWhatsappMutation.isPending}
              onClick={() => sendWhatsappMutation.mutate(row.id)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          ) : null}
          {canRelanceWhatsapp(row) ? (
            <Button
              variant="ghost"
              size="icon"
              title={translate("t.relancerParWhatsapp")}
              disabled={relanceWhatsappMutation.isPending}
              onClick={() => relanceWhatsappMutation.mutate(row.id)}
            >
              <Bell className="h-4 w-4" />
            </Button>
          ) : null}
          {row.status === "EMISE" && row.document_type !== "AVOIR" && row.document_type !== "RECU" ? (
            <>
              <Button variant="ghost" size="icon" title={translate("t.enregistrerUnPaiementSurCeDocument")} onClick={() => setPaymentTarget(row)}>
                <ReceiptText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title={translate("t.emettreUnAvoir")} onClick={() => setCreditNoteTarget(row)}>
                <Undo2 className="h-4 w-4" />
              </Button>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{translate("t.historiqueDesDocuments")}</p>
        {canEmitProforma ? (
          <Button size="sm" onClick={() => setEmitProformaOpen(true)}>
            <FilePlus className="h-4 w-4" />
            {translate("t.emettreUneProforma")}
          </Button>
        ) : null}
      </div>

      {query.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : invoices.length === 0 ? (
        <EmptyState title={translate("t.aucunDocumentEmis")} description={translate("t.emettezUneProformaPourDemarrerLHistorique")} />
      ) : (
        <DataTable columns={columns} data={invoices} rowKey={(row) => row.id} emptyTitle={translate("t.aucunDocumentEmis")} />
      )}

      {salesOrder.payment_status === "PAYEE" && !hasFacture ? (
        <p className="rounded-md border border-border-2 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
          Facture non générée : aucune ligne sélectionnée sur cette commande au moment du paiement intégral, ou commande soldée par avoir sans encaissement.
        </p>
      ) : null}

      {salesOrder.type === "PRODUIT_UNIQUE_MULTI_CHOIX" ? (
        <EmitProformaComparativeDialog open={emitProformaOpen} onOpenChange={setEmitProformaOpen} salesOrder={salesOrder} hasExistingProforma={hasExistingProforma} />
      ) : (
        <EmitProformaDialog open={emitProformaOpen} onOpenChange={setEmitProformaOpen} salesOrder={salesOrder} hasExistingProforma={hasExistingProforma} />
      )}
      <EmitCreditNoteDialog
        open={Boolean(creditNoteTarget)}
        onOpenChange={(open) => !open && setCreditNoteTarget(null)}
        salesOrderId={salesOrder.id}
        invoiceId={creditNoteTarget?.id ?? null}
        currencyCode={salesOrder.currency.code}
      />
      <RecordInvoicePaymentDialog open={Boolean(paymentTarget)} onOpenChange={(open) => !open && setPaymentTarget(null)} salesOrderId={salesOrder.id} invoice={paymentTarget} />
    </div>
  );
}
