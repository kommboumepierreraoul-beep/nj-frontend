"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuppliersList } from "@/modules/suppliers/hooks/use-suppliers-list";
import { PURCHASE_ORDER_STATUS_LABELS } from "../badges";
import type { PurchaseOrderListFilters } from "../types";
import { translate } from "@/i18n/translate";

const ALL = "__all__";

/** Barre de filtres (Doc/spec_pages_fournisseurs.md § 5), calquée sur NJ Global Trade Fournisseurs.dc.html lignes 409-442. */
export function PurchaseOrderFilters({ filters, onChange }: { filters: PurchaseOrderListFilters; onChange: (patch: Partial<PurchaseOrderListFilters>) => void }) {
  const suppliers = useSuppliersList({ per_page: 100 });

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-surface p-[18px]">
      <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.filtres")}</span>
      <div className="flex items-center gap-2.5 overflow-x-auto md:flex-wrap md:overflow-visible [&>*]:shrink-0">
        <Select
          value={filters.supplier_id ? String(filters.supplier_id) : ALL}
          onValueChange={(value) => onChange({ supplier_id: value === ALL ? undefined : Number(value) })}
        >
          <SelectTrigger className="w-[46vw] sm:w-56">
            <SelectValue placeholder={translate("ph.fournisseur")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{translate("t.tousLesFournisseurs")}</SelectItem>
            {(suppliers.data?.data ?? []).map((supplier) => (
              <SelectItem key={supplier.id} value={String(supplier.id)}>
                {supplier.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status ?? ALL} onValueChange={(value) => onChange({ status: value === ALL ? undefined : (value as PurchaseOrderListFilters["status"]) })}>
          <SelectTrigger className="w-[46vw] sm:w-48">
            <SelectValue placeholder={translate("ph.statut")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{translate("t.tousLesStatuts")}</SelectItem>
            {Object.entries(PURCHASE_ORDER_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="hidden flex-1 md:block" />

        <button
          type="button"
          onClick={() => onChange({ supplier_id: undefined, status: undefined })}
          className="flex h-[46px] shrink-0 items-center rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 text-[13px] font-semibold text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
