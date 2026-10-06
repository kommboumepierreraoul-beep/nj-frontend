"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Pause, Play } from "lucide-react";
import { useAttachments } from "@/modules/attachments/hooks/use-attachments";
import { storageUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { translate } from "@/i18n/translate";

const AUTO_PLAY_MS = 4200;

/**
 * Carte « VISUELS DU PRODUIT » (`Produits.dc.html` L.372-427, fonction JS
 * `galleryVals()`) : totalement absente de l'implémentation précédente — la
 * fiche produit n'affichait jamais aucune image (signalé par l'utilisateur,
 * "les images ne s'affichent pas dans la fiche produit"), l'onglet
 * « Pièces jointes » plus bas ne montrant qu'une liste générique.
 *
 * Résolution des visuels via `storageUrl()` (`@/lib/media`) à partir de
 * `attachment.file_path` — l'API ne renvoie jamais d'URL absolue précalculée
 * (voir le commentaire de `storageUrl`), c'est le même patron que
 * `attachment-dropzone.tsx` et `modules/products/utils.ts::getPrimaryImageUrl`.
 *
 * Visualiseur principal (défilement auto 4.2 s, flèches, pastille "VISUEL
 * PRINCIPAL"/"VISUEL n") + bande de vignettes cliquables, fidèle au patron
 * du template. Écart assumé : le template propose des "emplacements" vides
 * glissables un par un (jusqu'à 3) quand aucune image n'existe — le modèle
 * de données `Attachment` (liste plate + `is_primary`/`sort_order`, aucune
 * notion de "slot") ne permet pas ce comportement ; l'état vide renvoie
 * simplement vers l'onglet « Pièces jointes » pour ajouter des visuels.
 */
export function ProductImageGallery({ productId }: { productId: number }) {
  const attachmentsQuery = useAttachments("product", productId);

  const images = useMemo(
    () =>
      (attachmentsQuery.data ?? [])
        .filter((attachment) => attachment.media_types.includes("PRODUCT_IMAGE"))
        .slice()
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order),
    [attachmentsQuery.data],
  );

  const [rawIndex, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const multiple = images.length > 1;
  // Index dérivé (jamais stocké tel quel) : évite un effet qui devrait
  // remettre l'état à zéro dès que la liste d'images change de longueur
  // (ajout/suppression depuis l'onglet « Pièces jointes » pendant que la
  // galerie est affichée) — le modulo absorbe directement le changement.
  const index = images.length ? ((rawIndex % images.length) + images.length) % images.length : 0;

  useEffect(() => {
    if (!multiple || !autoPlay) return;
    const timer = setInterval(() => setIndex((current) => current + 1), AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [multiple, autoPlay]);

  if (attachmentsQuery.isLoading) {
    return <div className="aspect-square w-full animate-pulse rounded-[14px] border border-border bg-surface lg:aspect-auto lg:h-[420px]" />;
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-surface p-[18px]">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.visuelsDuProduit")}</p>
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 text-center">
          <ImageOff className="h-6 w-6 text-text-tertiary" />
          <p className="max-w-[240px] text-[12px] text-text-tertiary">
            Aucun visuel n&apos;est encore rattaché à ce produit. Ajoutez-en depuis l&apos;onglet « Pièces jointes » ci-dessous.
          </p>
        </div>
      </div>
    );
  }

  const current = images[index];

  function go(delta: number) {
    setIndex((value) => (value + delta + images.length) % images.length);
    setAutoPlay(false);
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-surface p-[18px]">
      <div className="flex items-center justify-between gap-3.5">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.visuelsDuProduit")}</p>
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] font-semibold tabular-nums text-muted-foreground">
            {index + 1} / {images.length}
          </span>
          {multiple ? (
            <button
              type="button"
              onClick={() => setAutoPlay((value) => !value)}
              title={autoPlay ? translate("t.arreterLeDefilementAutomatique") : translate("t.relancerLeDefilementAutomatique")}
              className={cn(
                "flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border-[1.5px] border-border hover:border-foreground",
                autoPlay ? "bg-accent-bg text-accent-hover" : "bg-surface text-muted-foreground",
              )}
            >
              {autoPlay ? <Pause className="h-[17px] w-[17px]" /> : <Play className="h-[17px] w-[17px]" />}
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-background">
        {images.map((image, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- visuels produit hébergés par le backend (disque "public"), pas d'optimisation Next nécessaire
          <img
            key={image.id}
            src={storageUrl(image.file_path)}
            alt={image.file_name}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-[420ms]",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          />
        ))}
        {multiple ? (
          <div className="absolute inset-0 flex items-center justify-between px-2.5">
            <button
              type="button"
              onClick={() => go(-1)}
              title={translate("t.visuelPrecedent")}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[rgba(17,17,17,0.55)] text-white hover:bg-[rgba(17,17,17,0.8)]"
            >
              <ChevronLeft className="h-[19px] w-[19px]" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              title="Visuel suivant"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[rgba(17,17,17,0.55)] text-white hover:bg-[rgba(17,17,17,0.8)]"
            >
              <ChevronRight className="h-[19px] w-[19px]" />
            </button>
          </div>
        ) : null}
        <div
          className={cn(
            "absolute top-2.5 left-2.5 flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[10.5px] font-bold tracking-[0.06em]",
            current.is_primary ? "bg-accent text-foreground" : "bg-[rgba(17,17,17,0.62)] text-white",
          )}
        >
          {current.is_primary ? "VISUEL PRINCIPAL" : `VISUEL ${index + 1}`}
        </div>
      </div>

      {multiple ? (
        <div className="flex items-center justify-center gap-1.5">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              title={`Visuel ${i + 1}`}
              onClick={() => {
                setIndex(i);
                setAutoPlay(false);
              }}
              className={cn("h-1.5 rounded-full transition-all", i === index ? "w-[22px] bg-accent" : "w-1.5 bg-[#DCDCDC]")}
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5 border-t border-border pt-3">
        <p className="text-[9.5px] font-semibold tracking-[0.13em] text-muted-foreground">TOUS LES VISUELS · {images.length}</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2.5">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => {
                setIndex(i);
                setAutoPlay(false);
              }}
              title={image.file_name + (image.is_primary ? " — visuel principal" : "")}
              className={cn(
                "flex flex-col gap-1.5 rounded-[11px] border-[1.5px] p-1.5 hover:border-accent",
                i === index ? "border-accent bg-accent-bg/40" : "border-border bg-surface",
              )}
            >
              <span className="relative aspect-square w-full overflow-hidden rounded-[7px] bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element -- idem visualiseur principal */}
                <img src={storageUrl(image.file_path)} alt={image.file_name} className="h-full w-full object-cover" />
              </span>
              <span className={cn("truncate text-[9.5px] font-semibold", i === index ? "text-accent-hover" : "text-text-tertiary")}>
                {image.is_primary ? "Principal" : `Visuel ${i + 1}`}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[11.5px] leading-[1.45] text-text-quaternary">
          Le visuel principal est celui repris sur la proforma et le catalogue. Gérez vos visuels depuis l&apos;onglet « Pièces jointes » ci-dessous.
        </p>
      </div>
    </div>
  );
}
