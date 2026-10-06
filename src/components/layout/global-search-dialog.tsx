"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Building2, PackageSearch, Search, ShoppingBag, Users } from "lucide-react";
import { clientsApi } from "@/modules/clients/api/clients.api";
import { productsApi } from "@/modules/products/api/products.api";
import { suppliersApi } from "@/modules/suppliers/api/suppliers.api";
import { navigation, isNavItemVisible, getVisibleChildren } from "@/config/navigation";
import { routes } from "@/config/routes";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import { translate } from "@/i18n/translate";

interface SearchRow {
  key: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  sub: string;
  meta?: string;
  onSelect: () => void;
}

interface SearchGroup {
  title: string;
  rows: SearchRow[];
}

/**
 * Recherche globale ⌘K/Ctrl+K (§ 2.3 du design système, NJ Global Trade
 * Dashboard.dc.html lignes 235-274) : recherche transversale dans les
 * modules Clients/Produits/Fournisseurs déjà exposés côté API (`search=`),
 * plus un accès direct à toute page de la navigation. Les Commandes ne sont
 * pas incluses : `SalesOrderListFilters` n'expose aucun paramètre `search`
 * côté API à ce jour (voir src/modules/sales-orders/types.ts) — pas de
 * filtrage inventé côté frontend.
 */
export function GlobalSearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const q = query.trim();
  const enabled = open && q.length > 0;

  const clientsQuery = useQuery({
    queryKey: ["global-search", "clients", q],
    queryFn: () => clientsApi.list({ search: q, per_page: 4 }),
    enabled,
  });
  const productsQuery = useQuery({
    queryKey: ["global-search", "products", q],
    queryFn: () => productsApi.list({ search: q, per_page: 4 }),
    enabled,
  });
  const suppliersQuery = useQuery({
    queryKey: ["global-search", "suppliers", q],
    queryFn: () => suppliersApi.list({ search: q, per_page: 4 }),
    enabled,
  });

  const go = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  const groups = useMemo<SearchGroup[]>(() => {
    if (!enabled) return [];
    const out: SearchGroup[] = [];

    const clients = clientsQuery.data?.data ?? [];
    if (clients.length) {
      out.push({
        title: "CLIENTS",
        rows: clients.map((client) => ({
          key: `client-${client.id}`,
          icon: <Users className="h-[18px] w-[18px]" />,
          iconBg: "bg-background text-muted-foreground",
          title: client.full_name,
          sub: client.city || "—",
          onSelect: () => go(routes.clients.detail(client.id)),
        })),
      });
    }

    const products = productsQuery.data?.data ?? [];
    if (products.length) {
      out.push({
        title: "PRODUITS",
        rows: products.map((product) => ({
          key: `product-${product.id}`,
          icon: <PackageSearch className="h-[18px] w-[18px]" />,
          iconBg: "bg-background text-muted-foreground",
          title: product.name,
          sub: product.reference,
          onSelect: () => go(routes.products.detail(product.id)),
        })),
      });
    }

    const suppliers = suppliersQuery.data?.data ?? [];
    if (suppliers.length) {
      out.push({
        title: "FOURNISSEURS",
        rows: suppliers.map((supplier) => ({
          key: `supplier-${supplier.id}`,
          icon: <Building2 className="h-[18px] w-[18px]" />,
          iconBg: "bg-background text-muted-foreground",
          title: supplier.company_name,
          sub: [supplier.city, supplier.country?.name].filter(Boolean).join(", ") || "—",
          onSelect: () => go(routes.suppliers.detail(supplier.id)),
        })),
      });
    }

    const pageRows: SearchRow[] = [];
    if ("tableau de bord".includes(q.toLowerCase())) {
      pageRows.push({
        key: "page-dashboard",
        icon: <ShoppingBag className="h-[18px] w-[18px]" />,
        iconBg: "bg-accent-bg text-accent-hover",
        title: "Tableau de bord",
        sub: "Ouvrir le module",
        onSelect: () => go(routes.dashboard.home),
      });
    }
    navigation.forEach((group) => {
      group.items.forEach((item) => {
        if (!isNavItemVisible(item, user)) return;
        getVisibleChildren(item, user).forEach((child) => {
          if (!child.href) return;
          if (!child.label.toLowerCase().includes(q.toLowerCase())) return;
          pageRows.push({
            key: `page-${child.href}`,
            icon: <ShoppingBag className="h-[18px] w-[18px]" />,
            iconBg: "bg-accent-bg text-accent-hover",
            title: child.label,
            sub: "Ouvrir le module",
            onSelect: () => go(child.href as string),
          });
        });
      });
    });
    if (pageRows.length) out.push({ title: "MODULES", rows: pageRows.slice(0, 5) });

    return out;
  }, [enabled, q, clientsQuery.data, productsQuery.data, suppliersQuery.data, user]);

  const resultCount = groups.reduce((sum, group) => sum + group.rows.length, 0);
  const isEmpty = enabled && !isFetchingAny(clientsQuery.isFetching, productsQuery.isFetching, suppliersQuery.isFetching) && resultCount === 0;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery("");
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[60] bg-[#111111]/55"
          style={{ animation: "njFade 140ms ease" }}
        />
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto px-6 pb-10 pt-[90px]">
          <DialogPrimitive.Content
            className="flex max-h-full w-full max-w-[680px] flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
            style={{ animation: "njPop 180ms ease" }}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              inputRef.current?.focus();
            }}
          >
            <DialogPrimitive.Title className="sr-only">Recherche globale</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Recherchez un client, un produit, un fournisseur ou un module.
            </DialogPrimitive.Description>

            <div className="flex h-[62px] shrink-0 items-center gap-3 border-b border-border px-[18px]">
              <Search className="h-[21px] w-[21px] shrink-0 text-link" />
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && groups[0]?.rows[0]) groups[0].rows[0].onSelect();
                }}
                placeholder="Commande, client, produit, fournisseur…"
                className="h-full min-w-0 flex-1 border-none bg-transparent text-[15px] font-medium text-foreground outline-none placeholder:text-text-quaternary"
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-6 shrink-0 items-center rounded-md bg-background px-2 text-[10.5px] font-semibold text-text-tertiary"
              >
                ESC
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
              {!enabled ? (
                <div className="flex flex-col items-center gap-1.5 px-5 py-9 text-center">
                  <p className="text-[12.5px] text-muted-foreground">Tapez pour chercher dans l&apos;application.</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.title} className="flex flex-col gap-0.5 py-1.5">
                    <div className="px-2.5 py-1.5 text-[9.5px] font-bold tracking-[0.14em] text-text-quaternary">{group.title}</div>
                    {group.rows.map((row) => (
                      <button
                        key={row.key}
                        type="button"
                        onClick={row.onSelect}
                        className="flex items-center gap-3 rounded-[10px] p-2.5 text-left hover:bg-accent-bg/50"
                      >
                        <span className={cn("flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]", row.iconBg)}>
                          {row.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-semibold text-foreground">{row.title}</span>
                          <span className="block truncate text-[11.5px] text-text-tertiary">{row.sub}</span>
                        </span>
                        {row.meta ? <span className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">{row.meta}</span> : null}
                      </button>
                    ))}
                  </div>
                ))
              )}
              {isEmpty ? (
                <div className="flex flex-col items-center gap-1.5 px-5 py-9 text-center">
                  <p className="text-[13.5px] font-semibold text-foreground">{translate("t.aucunResultat")}</p>
                  <p className="text-[12.5px] text-text-tertiary">{translate("t.essayezUnNomUneReferenceOuUnNumeroDeDocument")}</p>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border bg-surface-subtle px-[18px] py-[11px]">
              <span className="text-[11.5px] text-text-tertiary">
                {enabled ? `${resultCount} résultat(s) pour « ${query} »` : "Tapez pour chercher et naviguer entre les pages."}
              </span>
              <span className="hidden text-[11.5px] font-medium text-text-quaternary sm:inline">{translate("t.entreePourOuvrirLePremierResultat")}</span>
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function isFetchingAny(...values: boolean[]): boolean {
  return values.some(Boolean);
}
