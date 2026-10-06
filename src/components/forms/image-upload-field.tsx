"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Champ « logo/visuel » à téléversement réel de fichier — jamais une saisie
 * manuelle d'URL (§ demande frontend : « les images sont téléchargées par
 * upload puis renommées avec un format propre à l'app, pas d'URL »). Le nom
 * final et le chemin de stockage sont entièrement calculés côté backend
 * (`Storage::disk('public')->store(...)`, voir `ProductCategoryController`) ;
 * ce champ ne transmet jamais qu'un `File` brut au formulaire.
 */
export function ImageUploadField({
  value,
  onChange,
  existingUrl,
  onRemoveExisting,
  helpText = "PNG, JPG — 5 Mo maximum.",
  disabled,
}: {
  /** Nouveau fichier choisi par l'utilisateur, pas encore envoyé. */
  value?: File | null;
  onChange: (file: File | null) => void;
  /** URL déjà résolue (via `storageUrl()`) de l'image existante côté serveur, affichée tant qu'aucun nouveau fichier n'est choisi. */
  existingUrl?: string;
  /** Appelé quand l'utilisateur retire l'image existante sans en reteleverser une nouvelle. */
  onRemoveExisting?: () => void;
  helpText?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const displayUrl = previewUrl ?? existingUrl;

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-surface-subtle">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu local (fichier pas encore envoyé) ou vignette déjà hébergée par l'API
          <img src={displayUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-5 w-5 text-text-quaternary" />
        )}
      </span>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {displayUrl ? "Remplacer" : "Choisir un fichier"}
          </Button>
          {displayUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(null);
                onRemoveExisting?.();
              }}
              disabled={disabled}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Retirer
            </Button>
          ) : null}
        </div>
        <p className="text-[11px] text-text-tertiary">{helpText}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          onChange(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
