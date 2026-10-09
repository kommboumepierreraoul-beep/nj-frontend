import { cn } from "@/lib/utils";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

/**
 * Bandeau de filtres d'une page de liste. En mobile, il reste compact sur une
 * seule ligne et les champs sont accessibles dans un panneau natif déroulant.
 * À partir de `md`, les champs sont toujours visibles comme sur desktop.
 *
 * Convention : donner aux enfants une largeur mobile explicite (ex.
 * `w-[46vw] sm:w-48`) plutôt que `w-full`, pour qu'on en voie ~2 à la fois
 * avant de faire défiler.
 */
export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface", className)}>
      <details className="group">
        <summary className="flex h-12 cursor-pointer list-none items-center justify-between gap-2 px-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden md:hidden">
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            Filtres
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="flex flex-nowrap items-center gap-3 overflow-x-auto border-t border-border p-3 md:flex-wrap md:overflow-visible md:border-0 md:p-4 [&>*]:shrink-0">
          {children}
        </div>
      </details>
    </div>
  );
}
