"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Pause, Play } from "lucide-react";
import { useAttachments } from "@/modules/attachments/hooks/use-attachments";
import { storageUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { translate } from "@/i18n/translate";

/**
 * Galerie de visuels produit — NJ Global Trade Produits.dc.html lignes
 * 372-427 (`galleryVals`, lignes 1300-1351 du script) : grand visuel avec
 * navigation + défilement automatique, puis bande de vignettes, alimentée par
 * les pièces jointes de type `PRODUCT_IMAGE` (le principal en premier, puis
 * `sort_order`). L'onglet « Pièces jointes » (`AttachmentDropzone`) reste le
 * seul endroit où on ajoute/supprime/désigne le visuel principal — cette
 * galerie n'en est qu'une présentation en lecture, au-dessus des onglets.
 */
export function ProductGallery({ productId }: { productId: number }) {
  const attachmentsQuery = useAttachments("product", productId);
  const images = useMemo(() => {
    const all = attachmentsQuery.data ?? [];
    return all
      .filter((a) => a.media_types.includes("PRODUCT_IMAGE"))
      .slice()
      .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order);
  }, [attachmentsQuery.data]);

  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    setIndex((current) => Math.min(current, Math.max(images.length - 1, 0)));
  }, [images.length]);

  useEffect(() => {
    if (!hasMultiple || !autoplay) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % images.length), 3500);
    return () => clearInterval(timer);
  }, [hasMultiple, autoplay, images.length]);

  if (attachmentsQuery.isLoading) {
    return <div className="aspect-[4/3] w-full animate-pulse rounded-xl border border-border bg-surface-subtle" />;
  }

  const current = images[index];

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-surface p-[18px]">
      <div className="flex items-center justify-between gap-3.5">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.visuelsDuProduit")}</p>
        {images.length ? (
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-semibold tabular-nums text-text-tertiary">
              {index + 1} / {images.length}
            </span>
            {hasMultiple ? (
              <button
                type="button"
                title={autoplay ? translate("t.arreterLeDefilementAutomatique") : translate("t.relancerLeDefilementAutomatique")}
                onClick={() => setAutoplay((v) => !v)}
                className={cn(
                  "flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border",
                  autoplay ? "bg-accent-bg text-link" : "bg-surface text-muted-foreground",
                )}
              >
                {autoplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-surface-subtle">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element -- galerie : image déjà hébergée par l'API, pas d'optimisation Next nécessaire
          <img src={storageUrl(current.file_path)} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-quaternary">
            <ImageOff className="h-7 w-7" />
            <p className="text-xs font-medium">{translate("t.aucunVisuelRattache")}</p>
          </div>
        )}

        {hasMultiple ? (
          <div className="absolute inset-0 flex items-center justify-between px-2.5">
            <button
              type="button"
              title={translate("t.visuelPrecedent")}
              onClick={() => {
                setAutoplay(false);
                setIndex((current) => (current - 1 + images.length) % images.length);
              }}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#111111]/55 text-white hover:bg-[#111111]/80"
            >
              <ChevronLeft className="h-[19px] w-[19px]" />
            </button>
            <button
              type="button"
              title="Visuel suivant"
              onClick={() => {
                setAutoplay(false);
                setIndex((current) => (current + 1) % images.length);
              }}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#111111]/55 text-white hover:bg-[#111111]/80"
            >
              <ChevronRight className="h-[19px] w-[19px]" />
            </button>
          </div>
        ) : null}

        {current ? (
          <div
            className={cn(
              "absolute top-2.5 left-2.5 flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[10.5px] font-bold tracking-wide",
              current.is_primary ? "bg-accent text-accent-foreground" : "bg-[#111111]/62 text-white",
            )}
          >
            {current.is_primary ? "VISUEL PRINCIPAL" : `VISUEL ${index + 1}`}
          </div>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="flex items-center justify-center gap-1.5">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              title={image.file_name}
              onClick={() => {
                setAutoplay(false);
                setIndex(i);
              }}
              className={cn("h-1.5 rounded-full transition-all", i === index ? "w-[22px] bg-accent" : "w-1.5 bg-border-2")}
            />
          ))}
        </div>
      ) : null}

      {images.length ? (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <p className="text-[9.5px] font-semibold tracking-[0.13em] text-muted-foreground uppercase">Tous les visuels · {images.length}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2">
            {images.map((image, i) => (
              <button
                key={image.id}
                type="button"
                title={image.file_name}
                onClick={() => {
                  setAutoplay(false);
                  setIndex(i);
                }}
                className={cn(
                  "flex flex-col gap-1 rounded-[10px] border p-1",
                  i === index ? "border-accent bg-accent-bg/40" : "border-border bg-surface",
                )}
              >
                <span className="relative block aspect-square w-full overflow-hidden rounded-[6px] bg-background">
                  {/* eslint-disable-next-line @next/next/no-img-element -- vignette d'une pièce jointe déjà hébergée par l'API */}
                  <img src={storageUrl(image.file_path)} alt="" className="h-full w-full object-cover" />
                </span>
                <span className={cn("truncate text-[9.5px] font-semibold", i === index ? "text-link" : "text-text-tertiary")}>
                  {image.is_primary ? "Principal" : `Visuel ${i + 1}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[11.5px] leading-[1.45] text-text-quaternary">
          Aucun visuel n&apos;est encore rattaché à ce produit. Ajoutez-en depuis l&apos;onglet « Pièces jointes » ci-dessous.
        </p>
      )}
    </div>
  );
}
