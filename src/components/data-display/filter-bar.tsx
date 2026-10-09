import { cn } from "@/lib/utils";

/**
 * Bandeau de filtres d'une page de liste. En vue mobile, les filtres restent
 * visibles sur une seule ligne défilable horizontalement ; à partir de `md`,
 * ils reviennent sur plusieurs lignes comme dans la maquette desktop.
 *
 * Convention : donner aux enfants une largeur mobile explicite (ex.
 * `w-[46vw] sm:w-48`) plutôt que `w-full`, pour qu'on en voie ~2 à la fois
 * avant de faire défiler.
 */
export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 overflow-x-auto rounded-lg border border-border bg-surface p-3",
        "md:flex-wrap md:overflow-visible md:p-4",
        "[&>*]:shrink-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
