"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INVOICE_DOCUMENT_TYPE_LABELS, INVOICE_STATUS_LABELS } from "../badges";
import type { InvoiceListFilters } from "../types";
import { FilterBar } from "@/components/data-display/filter-bar";
import { translate } from "@/i18n/translate";

const ALL = "__all__";

/** Doc/design_system_maquette_complete.md § 3 — filtres du registre transverse des documents. */
export function InvoiceRegistryFilters({
  filters,
  onChange,
}: {
  filters: InvoiceListFilters;
  onChange: (patch: Partial<InvoiceListFilters>) => void;
}) {
  return (
    <FilterBar>
      <Input
        placeholder={translate("ph.numeroOuNomDeClient")}
        defaultValue={filters.search ?? ""}
        onChange={(event) => onChange({ search: event.target.value || undefined })}
        className="w-[64vw] sm:w-64"
      />

      <Select
        value={filters.document_type ?? ALL}
        onValueChange={(value) => onChange({ document_type: value === ALL ? undefined : (value as InvoiceListFilters["document_type"]) })}
      >
        <SelectTrigger className="w-[46vw] sm:w-44">
          <SelectValue placeholder={translate("ph.type")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tousLesTypes")}</SelectItem>
          {Object.entries(INVOICE_DOCUMENT_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? ALL}
        onValueChange={(value) => onChange({ status: value === ALL ? undefined : (value as InvoiceListFilters["status"]) })}
      >
        <SelectTrigger className="w-[46vw] sm:w-44">
          <SelectValue placeholder={translate("ph.statut")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tousLesStatuts")}</SelectItem>
          {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        Émis du
        <Input
          type="date"
          value={filters.from ?? ""}
          onChange={(event) => onChange({ from: event.target.value || undefined })}
          className="w-[150px]"
        />
        au
        <Input
          type="date"
          value={filters.to ?? ""}
          onChange={(event) => onChange({ to: event.target.value || undefined })}
          className="w-[150px]"
        />
      </label>
    </FilterBar>
  );
}
