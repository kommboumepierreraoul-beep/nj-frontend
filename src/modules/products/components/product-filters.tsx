"use client";

import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryTreeSelect } from "./category-tree-select";
import { cn } from "@/lib/utils";
import { useProductCategories } from "../hooks/use-product-categories";
import { PRODUCT_STATUS_LABELS } from "../badges";
import type { ProductListFilters } from "../types";
import { translate } from "@/i18n/translate";

const ALL = "__all__";

/**
 * Barre de filtres (Doc/spec_pages_produits.md § 2), calquée sur NJ Global
 * Trade Produits.dc.html lignes 490-523 : carte « FILTRES », champs à 40px,
 * case à cocher en pastille pleine hauteur (jamais la case à cocher générique
 * `components/ui/checkbox.tsx`, calibrée pour les formulaires) et bouton
 * « Réinitialiser » aligné à droite.
 */
export function ProductFilters({
  filters,
  onChange,
}: {
  filters: ProductListFilters;
  onChange: (patch: Partial<ProductListFilters>) => void;
}) {
  const categories = useProductCategories();
  const isSensitiveOn = Boolean(filters.is_sensitive);
  const hasActiveFilters = Boolean(filters.search || filters.category_id || filters.status || filters.is_sensitive);

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-surface p-[18px]">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.filtres")}</p>
      <div className="flex items-center gap-2.5 overflow-x-auto md:flex-wrap md:overflow-visible [&>*]:shrink-0">
        <div className="relative flex w-[64vw] items-center sm:w-80">
          <Search className="pointer-events-none absolute left-3 h-[18px] w-[18px] text-text-tertiary" />
          <Input
            placeholder={translate("ph.nomOuReference")}
            value={filters.search ?? ""}
            onChange={(event) => onChange({ search: event.target.value || undefined })}
            className="h-10 pl-9 text-[13px]"
          />
        </div>

        <CategoryTreeSelect
          categories={categories.data ?? []}
          value={filters.category_id}
          onChange={(value) => onChange({ category_id: value })}
          placeholder={translate("ph.touteCategorie")}
          clearLabel={translate("t.touteCategorie")}
          triggerClassName="h-10 w-[46vw] text-[13px] font-medium sm:w-48"
        />

        <Select
          value={filters.status ?? ALL}
          onValueChange={(value) => onChange({ status: value === ALL ? undefined : (value as ProductListFilters["status"]) })}
        >
          <SelectTrigger className="h-10 w-[46vw] text-[13px] font-medium sm:w-44">
            <SelectValue placeholder={translate("ph.tousLesStatuts")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{translate("t.tousLesStatuts")}</SelectItem>
            {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => onChange({ is_sensitive: isSensitiveOn ? undefined : true })}
          className={cn(
            "flex h-10 items-center gap-2.5 rounded-[10px] border-[1.5px] px-2.5 pr-3.5 text-[13px] font-semibold whitespace-nowrap",
            isSensitiveOn ? "border-accent bg-accent-bg/40 text-foreground" : "border-border bg-surface text-foreground",
          )}
        >
          <span
            className={cn(
              "flex h-[17px] w-[17px] items-center justify-center rounded-[5px] border-[1.5px]",
              isSensitiveOn ? "border-accent bg-accent" : "border-border-2 bg-surface",
            )}
          >
            {isSensitiveOn ? <Check className="h-[13px] w-[13px] text-foreground" /> : null}
          </span>
          Produits sensibles uniquement
        </button>

        <div className="hidden flex-1 md:block" />

        <button
          type="button"
          disabled={!hasActiveFilters}
          onClick={() => onChange({ search: undefined, category_id: undefined, status: undefined, is_sensitive: undefined })}
          className="h-10 rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 text-[13px] font-semibold text-muted-foreground hover:border-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
