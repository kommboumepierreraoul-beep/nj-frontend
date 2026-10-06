import type { Currency } from "@/modules/reference-data/types";
import type { PaymentDirection, SalesOrderPaymentMethod } from "@/modules/sales-orders/types";

/**
 * Types du module Factures (Doc/spec_pages_factures.md) : onglet « Documents »
 * de la fiche commande — historique unifié PROFORMA/FACTURE/AVOIR, émission
 * de proforma/avoir, et règlement rattaché à un document précis. `PaymentDirection`
 * et `SalesOrderPaymentMethod` sont réutilisés tels quels du module Commandes
 * (même table `sales_order_payments`, voir § « Éléments distinctifs »).
 */
export type InvoiceDocumentType = "PROFORMA" | "FACTURE" | "AVOIR" | "RECU";

/** Seules `EMISE` et `REMPLACEE` sont réellement atteignables (§ « Éléments distinctifs ») — `ENVOYEE`/`ANNULEE` n'ont aucune route pour y être posées. */
export type InvoiceStatus = "EMISE" | "ENVOYEE" | "ANNULEE" | "REMPLACEE";

export interface InvoiceItem {
  id: number;
  label: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: number;
  sales_order_id: number;
  /** Nom du client figé à l'émission (colonne `invoices.client_name`). */
  client_name?: string | null;
  /** Fiche client rattachée, chargée sur le registre transverse (`GET /invoices`). */
  client?: { id: number; full_name: string } | null;
  document_type: InvoiceDocumentType;
  /** Uniquement pertinent pour PROFORMA — `null` pour FACTURE/AVOIR (pas de mécanisme de réémission). */
  version: number | null;
  invoice_number: string;
  status: InvoiceStatus;
  currency: Currency;
  total_amount: number;
  issued_at: string;
  issued_by: { id: number; name: string } | null;
  /** Doc/communication_whatsapp_manuelle.md § 1 — posé uniquement par un envoi WhatsApp réussi (`InvoiceController::sendWhatsapp()`), jamais recalculé sinon. */
  sent_at: string | null;
  pdf_url: string;
  supersedes_invoice_id: number | null;
  /** Document crédité, uniquement renseigné pour un AVOIR. */
  credits_invoice_id: number | null;
  credits?: { id: number; invoice_number: string } | null;
  items?: InvoiceItem[];
}

/** Filtres du registre transverse des documents (`GET /invoices`, page « Factures » autonome). */
export interface InvoiceListFilters {
  page?: number;
  per_page?: number;
  document_type?: InvoiceDocumentType;
  status?: InvoiceStatus;
  client_id?: number;
  sales_order_id?: number;
  from?: string;
  to?: string;
  search?: string;
}

/**
 * § 1.2 « Émettre une proforma comparative » (`PRODUIT_UNIQUE_MULTI_CHOIX`) —
 * forme réelle de `proposal_details`, lue directement dans
 * `ProformaController::buildComparatifOptions()` et le gabarit
 * `resources/views/pdf/invoice_proforma_comparatif.blade.php` (Doc/
 * proforma_comparatif_addendum.md, décision n°5) : une clé par niveau
 * (`VariantLevel`, valeurs exactes de l'enum PHP) avec `points_forts`/
 * `points_attention` (listes à puces sur le PDF) et `recommandation` (texte),
 * plus un bloc `notes` à 4 champs fixes (conditions commerciales, délai de
 * production, paiement, douane/livraison) — distinct d'une « note générale »
 * libre, qui n'existe pas côté gabarit.
 */
export interface ProformaComparativeLevelDetails {
  points_forts?: string[];
  points_attention?: string[];
  recommandation?: string;
}

export interface ProformaComparativeNotes {
  conditions_commerciales?: string;
  delai_production?: string;
  paiement?: string;
  douane_livraison?: string;
}

export interface ProformaComparativeProposalPayload {
  PREMIER_CHOIX?: ProformaComparativeLevelDetails;
  DEUXIEME_CHOIX?: ProformaComparativeLevelDetails;
  TROISIEME_CHOIX?: ProformaComparativeLevelDetails;
  notes?: ProformaComparativeNotes;
}

export interface CreditNoteItemPayload {
  invoice_item_id: number;
  quantity?: number;
}

/**
 * Langue d'un document PDF émis (proforma, facture, avoir, reçu). Absente à
 * l'émission → l'API retombe sur la langue préférée du client (défaut FR).
 * Voir Doc/documents_bilingues_addendum.md.
 */
export type DocumentLanguage = "FR" | "EN";

/** § 1.3 « Émettre un avoir » — pas de champ envoyé pour un avoir total (l'API copie toutes les lignes du document ciblé). */
export interface CreditNotePayload {
  items?: CreditNoteItemPayload[];
  reason?: string;
  language?: DocumentLanguage;
}

/** § 1.4 — mêmes champs/règles que « Enregistrer un encaissement » (spec_pages_commandes.md), sans `invoice_id` (fixé automatiquement au document depuis lequel l'action est lancée). */
export interface InvoicePaymentPayload {
  direction?: PaymentDirection;
  amount: number;
  currency_id: number;
  payment_method: SalesOrderPaymentMethod;
  external_reference?: string;
  paid_at: string;
  notes?: string;
}
