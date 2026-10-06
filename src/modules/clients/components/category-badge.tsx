import Image from "next/image";
import { cn } from "@/lib/utils";
import { storageUrl } from "@/lib/media";
import type { ClientCategory } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Badge de catégorie/provenance (Doc/spec_pages_clients.md § 11 et § Badges) :
 * couleur ou logo définis par l'utilisateur, jamais un mapping codé en dur —
 * `badge_image_path` prime sur `badge_color` si les deux sont renseignés.
 *
 * ⚠️ `badge_image_path` est un chemin relatif au disque `public` du backend
 * (`ClientCategoryResource`), jamais une URL absolue — toujours le résoudre
 * avec `storageUrl()` avant de le passer en `src`, sous peine de logo qui ne
 * s'affiche jamais (même bug que sur les visuels produit, déjà corrigé).
 */
export function CategoryBadge({ category, className }: { category: ClientCategory | null; className?: string }) {
  if (!category) {
    return <span className={cn("text-xs text-muted-foreground", className)}>{translate("t.sansCategorie")}</span>;
  }

  const logoUrl = storageUrl(category.badge_image_path);
  if (logoUrl) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-foreground", className)}>
        <Image src={logoUrl} alt="" width={14} height={14} className="h-3.5 w-3.5 rounded-full object-cover" unoptimized />
        {category.label}
      </span>
    );
  }

  const color = category.badge_color ?? "#666666";
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", className)}
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {category.label}
    </span>
  );
}
