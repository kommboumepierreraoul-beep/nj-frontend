"use client";

import { useRef, useState } from "react";
import { FileText, Pencil, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogFormFooter, DialogFormHeader } from "@/components/forms/dialog-form-chrome";
import { FormField } from "@/components/forms/form-section";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { EmptyState } from "@/components/data-display/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAttachments,
  useCreateAttachment,
  useDeleteAttachment,
  useUpdateAttachment,
} from "@/modules/attachments/hooks/use-attachments";
import type { AttachableType, Attachment, AttachmentType } from "@/modules/attachments/types";
import { storageUrl } from "@/lib/media";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { translate } from "@/i18n/translate";

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

const MEDIA_TYPE_LABELS: Record<AttachmentType, string> = {
  PRODUCT_IMAGE: "Image produit",
  PAYMENT_PROOF: "Preuve de paiement",
  SUPPLIER_DOCUMENT: "Document fournisseur",
  CLIENT_DOCUMENT: "Document client",
  SALES_ORDER_PROFORMA: "Proforma",
  SALES_ORDER_RECEIPT: "Reçu",
  SALES_ORDER_DELIVERY_NOTE: "Bon de livraison",
  INVOICE_DOCUMENT: "Document de facture",
  OTHER: "Autre",
};

/**
 * Composant transverse « Pièces jointes » (§ 4.3) : réutilisé par Produits
 * (galerie), Fournisseurs (documents), Clients (KYC), Commandes (documents).
 * `mediaTypes` doit toujours être restreint au sous-ensemble pertinent de
 * l'écran, jamais l'énumération complète — voir chaque appelant.
 */
export function AttachmentDropzone({
  attachableType,
  attachableId,
  mediaTypes,
  allowPrimary = false,
  className,
}: {
  attachableType: AttachableType;
  attachableId: number;
  mediaTypes: AttachmentType[];
  allowPrimary?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<AttachmentType>(mediaTypes[0] ?? "OTHER");
  const [editing, setEditing] = useState<Attachment | null>(null);
  const [editMediaTypes, setEditMediaTypes] = useState<AttachmentType[]>([]);
  const [editSortOrder, setEditSortOrder] = useState("0");
  const [toDelete, setToDelete] = useState<Attachment | null>(null);

  const attachmentsQuery = useAttachments(attachableType, attachableId);
  const createMutation = useCreateAttachment(attachableType, attachableId);
  const updateMutation = useUpdateAttachment(attachableType, attachableId);
  const deleteMutation = useDeleteAttachment(attachableType, attachableId);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE_BYTES) {
        continue;
      }
      createMutation.mutate({ file, media_types: [selectedType] });
    }
  }

  function openEdit(attachment: Attachment) {
    setEditing(attachment);
    setEditMediaTypes(attachment.media_types);
    setEditSortOrder(String(attachment.sort_order ?? 0));
  }

  function submitEdit() {
    if (!editing || editMediaTypes.length === 0) return;
    updateMutation.mutate(
      { id: editing.id, payload: { media_types: editMediaTypes, sort_order: Number(editSortOrder) || 0 } },
      { onSuccess: () => setEditing(null) },
    );
  }

  function toggleEditType(type: AttachmentType) {
    setEditMediaTypes((current) => (current.includes(type) ? current.filter((t) => t !== type) : current.concat(type)));
  }

  return (
    <div className={cn("space-y-3", className)}>
      {mediaTypes.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {mediaTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selectedType === type
                  ? "border-accent bg-accent-bg text-accent-hover"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {MEDIA_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      ) : null}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          isDragging ? "border-accent bg-accent-bg/40" : "border-border-2 bg-background/50",
        )}
      >
        <Upload className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{translate("t.glissezDeposezUnFichierIciOu")}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={createMutation.isPending}>
          Choisir un fichier
        </Button>
        <p className="text-xs text-text-tertiary">20 Mo maximum</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      <div className="space-y-2">
        {attachmentsQuery.isLoading ? (
          <>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </>
        ) : !attachmentsQuery.data || attachmentsQuery.data.length === 0 ? (
          <EmptyState title={translate("t.aucunePieceJointe")} className="py-8" />
        ) : (
          attachmentsQuery.data.map((attachment) => {
            const isImage = attachment.mime_type?.startsWith("image/");
            const url = storageUrl(attachment.file_path);
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
              >
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- miniature d'une pièce jointe déjà hébergée par l'API, pas d'optimisation Next nécessaire
                  <img src={url} alt="" className="h-9 w-9 shrink-0 rounded-md border border-border object-cover" />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
                    <FileText className="h-4 w-4" />
                  </span>
                )}
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate text-sm font-medium text-foreground hover:text-accent-hover"
                >
                  {attachment.file_name}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {attachment.media_types.map((type) => MEDIA_TYPE_LABELS[type]).join(", ")} · {formatDateTime(attachment.uploaded_at)}
                  </span>
                </a>
                {allowPrimary ? (
                  <button
                    type="button"
                    title="Image principale"
                    onClick={() => updateMutation.mutate({ id: attachment.id, payload: { is_primary: !attachment.is_primary } })}
                    className={cn("shrink-0", attachment.is_primary ? "text-accent" : "text-text-tertiary hover:text-foreground")}
                  >
                    <Star className="h-4 w-4" fill={attachment.is_primary ? "currentColor" : "none"} />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => openEdit(attachment)}
                  className="shrink-0 text-text-tertiary hover:text-foreground"
                  title="Modifier"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(attachment)}
                  className="shrink-0 text-text-tertiary hover:text-destructive"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modale « Modifier la pièce jointe » — mockup NJ Global Trade
          Produits.dc.html / nj-product-forms.js (`attachment`, mode édition) :
          le fichier n'est pas remplaçable, seuls types de média et ordre
          d'affichage se modifient ici. */}
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-[480px] p-0">
          <DialogFormHeader title={translate("t.modifierLaPieceJointe")} subtitle={translate("t.leFichierNEstPasRemplacableSupprimezPuisReajoutezL")} pending={createMutation.isPending} />
          <div className="space-y-4 px-6 py-5">
            <FormField label={translate("t.typesDeMedia")} required>
              <div className="flex flex-wrap gap-2">
                {mediaTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleEditType(type)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      editMediaTypes.includes(type)
                        ? "border-accent bg-accent-bg text-accent-hover"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {MEDIA_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Ordre d'affichage" htmlFor="attachment_sort_order">
              <Input id="attachment_sort_order" type="number" value={editSortOrder} onChange={(event) => setEditSortOrder(event.target.value)} />
            </FormField>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button type="button" onClick={submitEdit} disabled={updateMutation.isPending || editMediaTypes.length === 0}>
              Enregistrer
            </Button>
          </DialogFormFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("t.supprimerCettePieceJointe")}
        description={toDelete ? `« ${toDelete.file_name} » sera supprimée.` : undefined}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
