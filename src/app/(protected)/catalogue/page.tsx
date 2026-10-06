"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { EmptyState } from "@/components/data-display/empty-state";
import { ErrorState } from "@/components/data-display/error-state";
import { Pagination } from "@/components/data-display/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSuspense } from "@/components/layout/page-suspense";
import { useQueryParams } from "@/hooks/use-query-params";
import { useProductsList } from "@/modules/products/hooks/use-products-list";
import { ProductFilters } from "@/modules/products/components/product-filters";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_TONES } from "@/modules/products/badges";
import type { ProductListFilters } from "@/modules/products/types";
import { getPrimaryImageUrl } from "@/modules/products/utils";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

/**
 * Écran bonus § 6.1 (Doc/design_system_maquette_complete.md) : vue galerie en
 * lecture seule, mêmes données/filtres que `/produits` (`GET /products`),
 * simplement présentées en grille de vignettes plutôt qu'en tableau. Aucune
 * action de création/modification ici — celles-ci restent sur `/produits`.
 */
export default function CataloguePage() {
  return (
    <PageSuspense>
      <CataloguePageContent />
    </PageSuspense>
  );
}

function CataloguePageContent() {
  const [filters, setFilters] = useQueryParams<Required<Pick<ProductListFilters, "page">> & ProductListFilters>({
    page: 1,
    category_id: undefined,
    status: undefined,
    is_sensitive: undefined,
    search: undefined,
  });

  const query = useProductsList({ ...filters, per_page: 24 });
  const total = query.data?.meta.total;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Tableau de bord", href: routes.dashboard.home }, { label: "Produits", href: routes.products.list }, { label: "Catalogue" }]}
        title={translate("page.catalogue.title")}
        badges={typeof total === "number" ? <Badge tone="neutral">{total} référence{total > 1 ? "s" : ""}</Badge> : undefined}
        description={translate("page.catalogue.desc")}
      />

      <ProductFilters filters={filters} onChange={(patch) => setFilters({ ...patch, page: 1 })} />

      {query.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data || query.data.data.length === 0 ? (
        <EmptyState title={translate("page.products.empty")} description={translate("t.ajustezVosFiltres")} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {query.data.data.map((product) => (
              <Link
                key={product.id}
                href={routes.products.detail(product.id)}
                className="group overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
              >
                <div className="flex aspect-square items-center justify-center bg-background">
                  {getPrimaryImageUrl(product) ? (
                    // eslint-disable-next-line @next/next/no-img-element -- galerie catalogue : images d'origines variées, optimisation Next non nécessaire ici
                    <img src={getPrimaryImageUrl(product)} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Aucune image</span>
                  )}
                </div>
                <div className="space-y-1.5 p-3">
                  <p className="truncate text-sm font-medium text-foreground group-hover:text-accent-hover">{product.name}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-mono text-xs text-muted-foreground">{product.reference}</p>
                    {product.category ? (
                      <p className="shrink-0 truncate text-[11px] font-medium text-text-tertiary">{product.category.name}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={PRODUCT_STATUS_TONES[product.status]}>{PRODUCT_STATUS_LABELS[product.status]}</Badge>
                    {product.is_sensitive ? (
                      <Badge tone="warning">
                        <ShieldAlert className="mr-1 h-3 w-3" />
                        Sensible
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {query.data.meta ? <Pagination meta={query.data.meta} onPageChange={(page) => setFilters({ page })} /> : null}
        </>
      )}
    </div>
  );
}
