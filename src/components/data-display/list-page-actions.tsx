"use client";

import Link from "next/link";
import { Download, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { translate } from "@/i18n/translate";

/**
 * Groupe d'actions standard de l'en-tête d'une page de liste, harmonisé sur
 * toutes les listes du back-office (cf. NJ Global Trade Template — chaque
 * artboard de liste présente le même trio dans le même ordre) :
 *
 *   [liens secondaires…]  ·  [Importer]  ·  [Exporter]  ·  [ + Nouveau … ]
 *
 * - `secondary` : liens contextuels du module (Catégories, Attributs, Tags…),
 *   rendus en `outline` avant les actions communes.
 * - `onImport` / `onExport` : affichent les boutons correspondants seulement
 *   s'ils sont fournis (une liste sans import n'a pas le bouton).
 * - action « Nouveau » : `onNew` (dialogue) ou `newHref` (page dédiée).
 *
 * À passer dans `actions={<ListPageActions … />}` de `<PageHeader>`.
 */
export function ListPageActions({
  secondary,
  onImport,
  onExport,
  newLabel,
  onNew,
  newHref,
  busy,
}: {
  secondary?: React.ReactNode;
  onImport?: () => void;
  onExport?: () => void;
  newLabel?: string;
  onNew?: () => void;
  newHref?: string;
  busy?: boolean;
}) {
  return (
    <>
      {secondary}
      {onImport ? (
        <Button variant="outline" size="icon" type="button" onClick={onImport} disabled={busy} title={translate("action.import")} aria-label={translate("action.import")} className="sm:h-[42px] sm:w-auto sm:px-4">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">{translate("action.import")}</span>
        </Button>
      ) : null}
      {onExport ? (
        <Button variant="outline" size="icon" type="button" onClick={onExport} disabled={busy} title={translate("action.export")} aria-label={translate("action.export")} className="sm:h-[42px] sm:w-auto sm:px-4">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">{translate("action.export")}</span>
        </Button>
      ) : null}
      {newLabel && newHref ? (
        <Button asChild title={newLabel} aria-label={newLabel} className="sm:px-4">
          <Link href={newHref} data-tour="list-new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{newLabel}</span>
          </Link>
        </Button>
      ) : newLabel && onNew ? (
        <Button type="button" onClick={onNew} data-tour="list-new" title={newLabel} aria-label={newLabel} className="sm:px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{newLabel}</span>
        </Button>
      ) : null}
    </>
  );
}
