"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { proformaComparativeSchema, type ProformaComparativeSchema } from "../schemas/proforma-comparative.schema";
import { useEmitProforma } from "../hooks/use-invoice-mutations";
import { useProformaDefaults } from "../hooks/use-proforma-defaults";
import { DocumentLanguageSelect, type DocumentLanguageChoice } from "./document-language-select";
import type { ProformaComparativeLevelDetails, ProformaComparativeProposalPayload } from "../types";
import type { SalesOrder } from "@/modules/sales-orders/types";
import { formatCurrency } from "@/lib/format";
import { translate } from "@/i18n/translate";

const LEVEL_LABELS: Record<string, string> = {
  PREMIER_CHOIX: "Premier choix",
  DEUXIEME_CHOIX: "Deuxième choix",
  TROISIEME_CHOIX: "Troisième choix",
  STANDARD: "Standard",
};

/**
 * Doc/spec_pages_factures.md § 1.2 « Émettre une proforma comparative »
 * (`PRODUIT_UNIQUE_MULTI_CHOIX`) — un formulaire par niveau (Premier/Deuxième/
 * Troisième choix), chacun avec « Points forts »/« Points d'attention » (une
 * ligne saisie = un point de la liste à puces sur le PDF) et une
 * recommandation, plus un bloc « Notes / conditions » à 4 champs fixes — forme
 * exacte lue dans `ProformaController::buildComparatifOptions()` et le
 * gabarit `invoice_proforma_comparatif.blade.php` (voir `../types.ts`).
 */
const LEVELS = [
  { formKey: "premier_choix", apiKey: "PREMIER_CHOIX", title: "Premier choix — Premium" },
  { formKey: "deuxieme_choix", apiKey: "DEUXIEME_CHOIX", title: "Deuxième choix — Meilleur compromis" },
  { formKey: "troisieme_choix", apiKey: "TROISIEME_CHOIX", title: "Troisième choix — Volume négocié" },
] as const;

function linesToArray(text?: string): string[] | undefined {
  const lines = (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : undefined;
}

/**
 * Valeurs par défaut renvoyées par `GET /sales-orders/{id}/proforma-defaults`
 * (arguments par variante + notes société) -> valeurs initiales du formulaire
 * (listes jointes « une par ligne »). L'émetteur part de ce pré-remplissage et
 * l'ajuste avant d'émettre.
 */
function defaultsToForm(defaults: ProformaComparativeProposalPayload): Partial<ProformaComparativeSchema> {
  const values: Record<string, string> = {};
  for (const level of LEVELS) {
    const details = defaults[level.apiKey];
    values[`${level.formKey}_points_forts`] = (details?.points_forts ?? []).join("\n");
    values[`${level.formKey}_points_attention`] = (details?.points_attention ?? []).join("\n");
    values[`${level.formKey}_recommandation`] = details?.recommandation ?? "";
  }
  values.conditions_commerciales = defaults.notes?.conditions_commerciales ?? "";
  values.delai_production = defaults.notes?.delai_production ?? "";
  values.paiement = defaults.notes?.paiement ?? "";
  values.douane_livraison = defaults.notes?.douane_livraison ?? "";
  return values as Partial<ProformaComparativeSchema>;
}

export function EmitProformaComparativeDialog({
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
  const defaultsQuery = useProformaDefaults(salesOrder.id, open);
  const [language, setLanguage] = useState<DocumentLanguageChoice>("");
  const options = (salesOrder.items ?? []).filter((item) => item.is_proposed_option || item.is_selected);
  const {
    register,
    handleSubmit,
    reset,
  } = useForm<ProformaComparativeSchema>({ resolver: zodResolver(proformaComparativeSchema), defaultValues: {} });

  // Pré-remplissage depuis la base (fiches variantes + Paramètres), une seule fois
  // par ouverture — l'émetteur reste libre de tout modifier ensuite.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!open) {
      prefilled.current = false;
      return;
    }
    if (defaultsQuery.data && !prefilled.current) {
      prefilled.current = true;
      reset(defaultsToForm(defaultsQuery.data));
    }
  }, [open, defaultsQuery.data, reset]);

  function onSubmit(values: ProformaComparativeSchema) {
    const proposal_details: ProformaComparativeProposalPayload = {};

    for (const level of LEVELS) {
      const details: ProformaComparativeLevelDetails = {};
      const pointsForts = linesToArray(values[`${level.formKey}_points_forts` as keyof ProformaComparativeSchema] as string | undefined);
      const pointsAttention = linesToArray(values[`${level.formKey}_points_attention` as keyof ProformaComparativeSchema] as string | undefined);
      const recommandation = (values[`${level.formKey}_recommandation` as keyof ProformaComparativeSchema] as string | undefined)?.trim();
      if (pointsForts) details.points_forts = pointsForts;
      if (pointsAttention) details.points_attention = pointsAttention;
      if (recommandation) details.recommandation = recommandation;
      if (Object.keys(details).length > 0) proposal_details[level.apiKey] = details;
    }

    const notes = {
      conditions_commerciales: values.conditions_commerciales?.trim() || undefined,
      delai_production: values.delai_production?.trim() || undefined,
      paiement: values.paiement?.trim() || undefined,
      douane_livraison: values.douane_livraison?.trim() || undefined,
    };
    if (Object.values(notes).some(Boolean)) proposal_details.notes = notes;

    mutation.mutate(
      language ? { proposal_details, language } : { proposal_details },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader
            title={translate("form.head.emettreUneProformaComparative")}
            subtitle={hasExistingProforma ? translate("t.uneNouvelleVersionSeraCreeeLaPrecedentePasseraAuSt") : translate("t.presenteJusquA3OptionsAuClientUneParLigneProposeeT")}
            pending={mutation.isPending}
          />
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <p className="rounded-md border border-border-2 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
              {defaultsQuery.isLoading
                ? translate("t.chargementDesArgumentsEnregistres")
                : translate("t.preRempliDepuisLesFichesVariantesEtLesParametresEn")}
            </p>

            {options.length > 0 ? (
              <div className="rounded-md border border-border bg-background/40 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{translate("misc.optionsProposeesAuClient")}</p>
                <div className="space-y-1.5 text-xs">
                  {options.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {item.product_variant?.level ? (LEVEL_LABELS[item.product_variant.level] ?? item.product_variant.level) : "—"}
                        </span>
                        <span className="truncate">{item.product_variant ? `${item.product_variant.sku} — ${item.product_variant.name}` : item.label}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unit_price, salesOrder.currency.code)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-text-quaternary">
                  Renseignez ci-dessous les arguments par niveau — ils apparaissent en regard de chaque option sur le PDF comparatif.
                </p>
              </div>
            ) : null}

            {LEVELS.map((level) => (
              <FormSection key={level.formKey} title={level.title} cols={1}>
                <FormField label={translate("field.pointsForts")} htmlFor={`${level.formKey}_points_forts`}>
                  <Textarea id={`${level.formKey}_points_forts`} {...register(`${level.formKey}_points_forts` as keyof ProformaComparativeSchema)} rows={2} placeholder={"Un point par ligne, ex.\nMeilleur rapport qualité/prix\nLivraison plus rapide"} />
                </FormField>
                <FormField label={translate("field.pointsDAttention")} htmlFor={`${level.formKey}_points_attention`}>
                  <Textarea id={`${level.formKey}_points_attention`} {...register(`${level.formKey}_points_attention` as keyof ProformaComparativeSchema)} rows={2} placeholder={translate("ph.unPointParLigne")} />
                </FormField>
                <FormField label={translate("field.recommandation")} htmlFor={`${level.formKey}_recommandation`}>
                  <Input id={`${level.formKey}_recommandation`} {...register(`${level.formKey}_recommandation` as keyof ProformaComparativeSchema)} placeholder={translate("ph.exRecommandePourUnPremierEssai")} />
                </FormField>
              </FormSection>
            ))}

            <FormSection title={translate("section.notesConditions")} cols={2}>
              <FormField label={translate("field.conditionsCommerciales")} htmlFor="conditions_commerciales">
                <Textarea id="conditions_commerciales" {...register("conditions_commerciales")} rows={2} />
              </FormField>
              <FormField label={translate("field.delaiDeProduction")} htmlFor="delai_production">
                <Textarea id="delai_production" {...register("delai_production")} rows={2} />
              </FormField>
              <FormField label={translate("field.paiement")} htmlFor="paiement">
                <Textarea id="paiement" {...register("paiement")} rows={2} />
              </FormField>
              <FormField label={translate("field.douaneLivraison")} htmlFor="douane_livraison">
                <Textarea id="douane_livraison" {...register("douane_livraison")} rows={2} />
              </FormField>
            </FormSection>
          </div>
          <DialogFormFooter className="justify-between">
            <DocumentLanguageSelect value={language} onChange={setLanguage} disabled={mutation.isPending} />
            <div className="flex gap-2.5">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {translate("t.confirmerLEmission")}
              </Button>
            </div>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
