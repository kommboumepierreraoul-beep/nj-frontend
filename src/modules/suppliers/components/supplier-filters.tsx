"use client";

import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useProductCategories } from "@/modules/products/hooks/use-product-categories";
import { SUPPLIER_RELIABILITY_LABELS } from "../badges";
import type { SupplierListFilters } from "../types";
import { translate } from "@/i18n/translate";

const ALL = "__all__";

/**
 * Barre de filtres (Doc/spec_pages_fournisseurs.md § 1), calquée sur NJ
 * Global Trade Fournisseurs.dc.html lignes 409-442 : carte à angles 14px,
 * titre « FILTRES » en petites capitales, puces de recherche/sélecteurs/
 * cases à cocher en chips, bouton « Réinitialiser » aligné à droite.
 */
export function SupplierFilters({ filters, onChange }: { filters: SupplierListFilters; onChange: (patch: Partial<SupplierListFilters>) => void }) {
  const categories = useProductCategories();

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-surface p-[18px]">
      <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.filtres")}</span>
      <div className="flex items-center gap-2.5 overflow-x-auto md:flex-wrap md:overflow-visible [&>*]:shrink-0">
        <Input
          placeholder={translate("ph.raisonSocialeOuNomDeContact")}
          defaultValue={filters.search ?? ""}
          onChange={(event) => onChange({ search: event.target.value || undefined })}
          className="w-[64vw] sm:w-72"
        />

        <Select
          value={filters.reliability ?? ALL}
          onValueChange={(value) => onChange({ reliability: value === ALL ? undefined : (value as SupplierListFilters["reliability"]) })}
        >
          <SelectTrigger className="w-[46vw] sm:w-44">
            <SelectValue placeholder={translate("ph.fiabilite")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{translate("t.touteFiabilite")}</SelectItem>
            {Object.entries(SUPPLIER_RELIABILITY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category_id ? String(filters.category_id) : ALL}
          onValueChange={(value) => onChange({ category_id: value === ALL ? undefined : Number(value) })}
        >
          <SelectTrigger className="w-[46vw] sm:w-48">
            <SelectValue placeholder={translate("ph.categorieDeProduits")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{translate("t.touteCategorie")}</SelectItem>
            {(categories.data ?? []).map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <FilterChip
          checked={Boolean(filters.is_active)}
          label={translate("field.actifsUniquement")}
          tone="accent"
          onClick={() => onChange({ is_active: filters.is_active ? undefined : true })}
        />
        <FilterChip
          checked={Boolean(filters.is_blacklisted)}
          label={translate("field.listeNoire")}
          tone="foreground"
          onClick={() => onChange({ is_blacklisted: filters.is_blacklisted ? undefined : true })}
        />

        <div className="hidden flex-1 md:block" />

        <button
          type="button"
          onClick={() => onChange({ search: undefined, reliability: undefined, category_id: undefined, is_active: undefined, is_blacklisted: undefined })}
          className="flex h-[46px] shrink-0 items-center rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 text-[13px] font-semibold text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

/** Case à cocher-puce (Doc lignes 428-435) : toute la puce est cliquable, pas une case + libellé séparés. */
function FilterChip({ checked, label, tone, onClick }: { checked: boolean; label: string; tone: "accent" | "foreground"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[46px] shrink-0 items-center gap-2.5 rounded-[10px] border-[1.5px] px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
        !checked && "border-border bg-surface text-foreground",
        checked && tone === "accent" && "border-accent bg-accent-bg text-foreground",
        checked && tone === "foreground" && "border-foreground bg-background text-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px]",
          !checked && "border-border-2 bg-surface",
          checked && tone === "accent" && "border-accent bg-accent",
          checked && tone === "foreground" && "border-foreground bg-foreground",
        )}
      >
        {checked ? <Check className={cn("h-[13px] w-[13px]", tone === "accent" ? "text-accent-foreground" : "text-sidebar-foreground")} /> : null}
      </span>
      {label}
    </button>
  );
}
