import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Next.js exige un `<Suspense>` autour de tout composant qui lit
 * `useSearchParams` (ex. `useQueryParams`, filtres en URL — § 5) pour pouvoir
 * pré-rendre la coquille de page. Toute page de liste/détail filtrable
 * utilise ce wrapper autour de son composant de contenu plutôt que de gérer
 * la limite au cas par cas.
 */
export function PageSuspense({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <Suspense fallback={fallback ?? <Skeleton className="h-40 w-full" />}>{children}</Suspense>;
}
