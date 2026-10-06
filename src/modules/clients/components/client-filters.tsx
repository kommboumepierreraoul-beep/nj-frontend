"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientCategories } from "../hooks/use-client-categories";
import { CLIENT_STATUS_LABELS, VALUE_SEGMENT_LABELS } from "../badges";
import { CLIENT_TYPE_LABELS } from "../badges";
import type { ClientListFilters } from "../types";
import { FilterBar } from "@/components/data-display/filter-bar";
import { translate } from "@/i18n/translate";

const ALL = "__all__";

export function ClientFilters({
  filters,
  onChange,
}: {
  filters: ClientListFilters;
  onChange: (patch: Partial<ClientListFilters>) => void;
}) {
  const categories = useClientCategories();

  return (
    <FilterBar>
      <Input
        placeholder={translate("ph.rechercherUnClient")}
        defaultValue={filters.search ?? ""}
        onChange={(event) => onChange({ search: event.target.value || undefined })}
        className="w-[64vw] sm:w-64"
      />

      <Select
        value={filters.category_id ? String(filters.category_id) : ALL}
        onValueChange={(value) => onChange({ category_id: value === ALL ? undefined : Number(value) })}
      >
        <SelectTrigger className="w-[46vw] sm:w-48">
          <SelectValue placeholder={translate("ph.provenance")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.toutesLesProvenances")}</SelectItem>
          {(categories.data ?? []).map((category) => (
            <SelectItem key={category.id} value={String(category.id)}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status ?? ALL} onValueChange={(value) => onChange({ status: value === ALL ? undefined : (value as ClientListFilters["status"]) })}>
        <SelectTrigger className="w-[46vw] sm:w-40">
          <SelectValue placeholder={translate("ph.statut")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tousLesStatuts")}</SelectItem>
          {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.client_type ?? ALL}
        onValueChange={(value) => onChange({ client_type: value === ALL ? undefined : (value as ClientListFilters["client_type"]) })}
      >
        <SelectTrigger className="w-[46vw] sm:w-40">
          <SelectValue placeholder={translate("ph.type")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tousLesTypes")}</SelectItem>
          {Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.value_segment ?? ALL}
        onValueChange={(value) => onChange({ value_segment: value === ALL ? undefined : (value as ClientListFilters["value_segment"]) })}
      >
        <SelectTrigger className="w-[46vw] sm:w-40">
          <SelectValue placeholder={translate("ph.segment")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tousLesSegments")}</SelectItem>
          {Object.entries(VALUE_SEGMENT_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
