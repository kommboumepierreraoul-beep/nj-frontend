"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientsList } from "@/modules/clients/hooks/use-clients-list";
import { PAYMENT_STATUS_LABELS, SALES_ORDER_STATUS_LABELS, SALES_ORDER_TYPE_LABELS } from "../badges";
import type { SalesOrderListFilters } from "../types";
import { FilterBar } from "@/components/data-display/filter-bar";
import { translate } from "@/i18n/translate";

const ALL = "__all__";

/** Doc/spec_pages_commandes.md § 1 « Filtres disponibles ». */
export function SalesOrderFilters({ filters, onChange }: { filters: SalesOrderListFilters; onChange: (patch: Partial<SalesOrderListFilters>) => void }) {
  const clients = useClientsList({ per_page: 100 });

  return (
    <FilterBar>
      <Select value={filters.client_id ? String(filters.client_id) : ALL} onValueChange={(value) => onChange({ client_id: value === ALL ? undefined : Number(value) })}>
        <SelectTrigger className="w-[46vw] sm:w-56">
          <SelectValue placeholder={translate("ph.client")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tousLesClients")}</SelectItem>
          {(clients.data?.data ?? []).map((client) => (
            <SelectItem key={client.id} value={String(client.id)}>
              {client.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status ?? ALL} onValueChange={(value) => onChange({ status: value === ALL ? undefined : (value as SalesOrderListFilters["status"]) })}>
        <SelectTrigger className="w-[46vw] sm:w-48">
          <SelectValue placeholder={translate("ph.statut")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tousLesStatuts")}</SelectItem>
          {Object.entries(SALES_ORDER_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.payment_status ?? ALL}
        onValueChange={(value) => onChange({ payment_status: value === ALL ? undefined : (value as SalesOrderListFilters["payment_status"]) })}
      >
        <SelectTrigger className="w-[46vw] sm:w-52">
          <SelectValue placeholder={translate("ph.statutDePaiement")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tousLesStatutsDePaiement")}</SelectItem>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.type ?? ALL} onValueChange={(value) => onChange({ type: value === ALL ? undefined : (value as SalesOrderListFilters["type"]) })}>
        <SelectTrigger className="w-[46vw] sm:w-56">
          <SelectValue placeholder={translate("ph.typeDeCommande")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tousLesTypes")}</SelectItem>
          {Object.entries(SALES_ORDER_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
