"use client";

import { Fragment } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { Pagination } from "./pagination";
import type { PaginationMeta } from "@/types/api";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /**
   * Piste de la grille CSS pour cette colonne (ex. `"minmax(220px,1.4fr)"`),
   * équivalent de `table.template` dans la maquette. Par défaut les colonnes
   * se partagent la largeur à parts égales.
   */
  width?: string;
  align?: "left" | "right" | "center";
  className?: string;
  headerClassName?: string;
}

const ALIGN_CLASS: Record<NonNullable<DataTableColumn<unknown>["align"]>, string> = {
  left: "justify-start text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
};

/**
 * Tableau de données générique (§ 2.3), calqué sur NJ Global Trade
 * Clients.dc.html lignes 455-613 : grille CSS (pas un `<table>` HTML — la
 * maquette n'en utilise jamais) avec en-tête de colonnes à fond
 * `--color-surface-subtle`, lignes séparées par un filet fin (`#F4F4F4`),
 * survol systématique, puis les états chargement (squelette de lignes,
 * jamais un spinner plein écran — § 4.5), vide et erreur (+ bouton
 * réessayer), et la pagination en pied de tableau. Chaque module définit ses
 * colonnes et lui passe la page courante de `ApiCollection<T>`.
 */
export function DataTable<T>({
  columns,
  data,
  meta,
  isLoading,
  isError,
  error,
  onRetry,
  onPageChange,
  emptyTitle,
  emptyDescription,
  rowKey,
  onRowClick,
  rowClassName,
  skeletonRows = 6,
  className,
}: {
  columns: DataTableColumn<T>[];
  data: T[] | undefined;
  meta?: PaginationMeta;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onPageChange?: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  /**
   * Classe additionnelle par ligne (ex. fond rosé pour un client BLOQUE —
   * NJ Global Trade Clients.dc.html ligne 1160, `row.bg: "#FFFBFB"`).
   */
  rowClassName?: (row: T) => string | undefined;
  skeletonRows?: number;
  className?: string;
}) {
  const gridTemplateColumns = columns.map((column) => column.width ?? "minmax(140px,1fr)").join(" ");
  const rows = data ?? [];
  const isEmpty = !isLoading && !isError && rows.length === 0;

  return (
    <div className={cn("overflow-x-auto rounded-[14px] border border-border bg-surface", className)}>
      <div style={{ minWidth: columns.length > 4 ? `${columns.length * 160}px` : undefined }}>
        <div
          className="grid items-center gap-3 border-b border-border bg-surface-subtle px-[18px]"
          style={{ gridTemplateColumns, minHeight: "40px" }}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className={cn(
                "flex text-[9.5px] font-semibold tracking-[0.12em] text-muted-foreground uppercase",
                ALIGN_CLASS[column.align ?? "left"],
                column.headerClassName,
              )}
            >
              {column.header}
            </div>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: skeletonRows }).map((_, rowIndex) => (
            <div
              key={`skeleton-${rowIndex}`}
              className="grid items-center gap-3 border-b border-border px-[18px] py-2 last:border-b-0"
              style={{ gridTemplateColumns, minHeight: "42px" }}
            >
              {columns.map((column) => (
                <Skeleton key={column.key} className="h-3.5 w-full max-w-[160px]" />
              ))}
            </div>
          ))
        ) : isError ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : isEmpty ? (
          <EmptyState title={emptyTitle} description={emptyDescription} size="lg" />
        ) : (
          rows.map((row) => (
            <Fragment key={rowKey(row)}>
              <div
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "grid items-center gap-3 border-b border-border px-[18px] py-2 text-[11.5px] leading-snug last:border-b-0 hover:bg-surface-subtle",
                  onRowClick && "cursor-pointer",
                  rowClassName?.(row),
                )}
                style={{ gridTemplateColumns, minHeight: "42px" }}
              >
                {columns.map((column) => (
                  <div key={column.key} className={cn("flex min-w-0 items-center", ALIGN_CLASS[column.align ?? "left"], column.className)}>
                    {column.render(row)}
                  </div>
                ))}
              </div>
            </Fragment>
          ))
        )}
      </div>
      {meta && onPageChange && !isLoading && !isError ? <Pagination meta={meta} onPageChange={onPageChange} /> : null}
    </div>
  );
}
