"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SHIPPING_MODE_LABELS } from "../badges";
import type { ShippingRateListFilters } from "../types";
import { FilterBar } from "@/components/data-display/filter-bar";
import { translate } from "@/i18n/translate";

const ALL = "__all__";

export function ShippingRateFilters({ filters, onChange }: { filters: ShippingRateListFilters; onChange: (patch: Partial<ShippingRateListFilters>) => void }) {
  return (
    <FilterBar>
      <Select value={filters.mode ?? ALL} onValueChange={(value) => onChange({ mode: value === ALL ? undefined : (value as ShippingRateListFilters["mode"]) })}>
        <SelectTrigger className="w-[46vw] sm:w-48">
          <SelectValue placeholder={translate("ph.mode")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tousLesModes")}</SelectItem>
          {Object.entries(SHIPPING_MODE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.is_active === undefined ? ALL : String(filters.is_active)}
        onValueChange={(value) => onChange({ is_active: value === ALL ? undefined : value === "true" })}
      >
        <SelectTrigger className="w-[46vw] sm:w-40">
          <SelectValue placeholder={translate("ph.statut")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tous")}</SelectItem>
          <SelectItem value="true">{translate("t.actif")}</SelectItem>
          <SelectItem value="false">{translate("t.inactif")}</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
