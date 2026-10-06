"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEmitProforma } from "../hooks/use-invoice-mutations";
import { DocumentLanguageSelect, type DocumentLanguageChoice } from "./document-language-select";
import { ProformaPreview } from "./proforma-preview";
import type { SalesOrder } from "@/modules/sales-orders/types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_factures.md § 1.1 « Émettre une proforma » — gabarit plat
 * (MULTI_PRODUITS/PRESTATION_SERVICE) : récapitulatif en lecture seule des
 * lignes `is_selected = true`, aucun champ à saisir, `POST .../proforma` sans
 * corps de requête.
 */
export function EmitProformaDialog({
  open,
  onOpenChange,
  salesOrder,
  hasExistingProforma,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesOrder: SalesOrder;
  hasExistingProforma: boolean;
}) {
  const mutation = useEmitProforma(salesOrder.id);
  const selectedItems = (salesOrder.items ?? []).filter((item) => item.is_selected);
  const [language, setLanguage] = useState<DocumentLanguageChoice>("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px] p-6">
        <DialogTitle className="sr-only">{translate("t.emettreUneProforma")}</DialogTitle>
        <div className="flex items-start gap-3.5">
          <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] bg-accent-bg text-link">
            <FileText className="h-[23px] w-[23px]" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
            <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground text-pretty">{translate("t.emettreUneProforma")}</p>
            <DialogDescription className="text-[13.5px] leading-[1.55] text-muted-foreground text-pretty">
              {hasExistingProforma ? translate("t.uneNouvelleVersionSeraCreeeLaPrecedentePasseraAuSt") : translate("t.premiereEmissionPourCetteCommande")}
            </DialogDescription>
          </div>
        </div>

        <div className="mt-4 max-h-[52vh] overflow-y-auto">
          <ProformaPreview salesOrder={salesOrder} versionLabel={hasExistingProforma ? "NOUVELLE VERSION" : "VERSION 1"} />
        </div>

        {selectedItems.length === 0 ? (
          <p className="mt-3 rounded-md border border-warning/40 bg-warning/5 px-3 py-2 text-xs text-warning-foreground">
            Aucune ligne n&apos;est sélectionnée sur cette commande : la proforma serait vide. Sélectionnez au moins une ligne avant d&apos;émettre.
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <DocumentLanguageSelect value={language} onChange={setLanguage} disabled={mutation.isPending} />
          <div className="flex gap-2.5">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button
              type="button"
              disabled={mutation.isPending || selectedItems.length === 0}
              onClick={() => mutation.mutate(language ? { language } : undefined, { onSuccess: () => onOpenChange(false) })}
            >
              {translate("t.confirmerLEmission")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
