import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Breadcrumb {
  label: string;
  href?: string;
}

/** Corps de page (§ 2.4) : fil d'Ariane + titre + badges d'état + actions en en-tête. */
export function PageHeader({
  breadcrumbs,
  title,
  description,
  badges,
  actions,
  className,
}: {
  breadcrumbs?: Breadcrumb[];
  title: string;
  description?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, index) => {
              // Fil d'Ariane calqué sur la maquette (`a { color:#B8850F } a:hover { color:#111 }`) :
              // maillons cliquables en doré (`text-link`) qui foncent au survol ; le dernier
              // maillon = page courante, doré et non cliquable.
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {index > 0 ? <ChevronRight className="h-3 w-3 text-muted-foreground" /> : null}
                  {crumb.href && !isLast ? (
                    <Link href={crumb.href} className="text-link transition-colors hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={cn("text-link", isLast && "font-medium")} aria-current={isLast ? "page" : undefined}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-foreground sm:text-[34px]">{title}</h1>
          {badges}
        </div>
        {description ? (
          <p className="max-w-[780px] text-[13.5px] leading-[1.55] text-muted-foreground text-pretty">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-shrink-0">{actions}</div> : null}
    </div>
  );
}
