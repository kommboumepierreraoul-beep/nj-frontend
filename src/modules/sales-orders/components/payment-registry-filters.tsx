"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientsList } from "@/modules/clients/hooks/use-clients-list";
import { useCurrencies } from "@/modules/reference-data/hooks/use-currencies";
import { PAYMENT_DIRECTION_LABELS, PAYMENT_METHOD_LABELS } from "../badges";
import type { SalesOrderPaymentListFilters } from "../types";
import { FilterBar } from "@/components/data-display/filter-bar";
import { translate } from "@/i18n/translate";

const ALL = "__all__";

/**
 * Doc/design_system_maquette_complete.md § 6.2 — mêmes familles de filtres que la
 * maquette (sens, méthode, client, devise, statut), plus une recherche libre
 * (n° de reçu / référence externe / référence de commande), déportée côté serveur
 * (GET /sales-order-payments?search=...).
 */
export function PaymentRegistryFilters({
  filters,
  onChange,
}: {
  filters: SalesOrderPaymentListFilters;
  onChange: (patch: Partial<SalesOrderPaymentListFilters>) => void;
}) {
  const clients = useClientsList({ per_page: 100 });
  const currencies = useCurrencies();

  return (
    <FilterBar>
      <div className="relative w-[64vw] sm:w-64">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search ?? ""}
          onChange={(event) => onChange({ search: event.target.value || undefined })}
          placeholder={translate("ph.nDeRecuReferenceCommande")}
          className="pl-8"
        />
      </div>

      <Select
        value={filters.direction ?? ALL}
        onValueChange={(value) => onChange({ direction: value === ALL ? undefined : (value as SalesOrderPaymentListFilters["direction"]) })}
      >
        <SelectTrigger className="w-[46vw] sm:w-44">
          <SelectValue placeholder={translate("ph.sens")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tousLesSens")}</SelectItem>
          {Object.entries(PAYMENT_DIRECTION_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.payment_method ?? ALL}
        onValueChange={(value) => onChange({ payment_method: value === ALL ? undefined : (value as SalesOrderPaymentListFilters["payment_method"]) })}
      >
        <SelectTrigger className="w-[46vw] sm:w-48">
          <SelectValue placeholder={translate("ph.methode")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.toutesLesMethodes")}</SelectItem>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.is_voided === undefined ? ALL : String(filters.is_voided)}
        onValueChange={(value) => onChange({ is_voided: value === ALL ? undefined : value === "true" })}
      >
        <SelectTrigger className="w-[46vw] sm:w-40">
          <SelectValue placeholder={translate("ph.statut")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.tousLesStatuts")}</SelectItem>
          <SelectItem value="false">{translate("t.actifs")}</SelectItem>
          <SelectItem value="true">{translate("t.annules")}</SelectItem>
        </SelectContent>
      </Select>

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

      <Select value={filters.currency_id ? String(filters.currency_id) : ALL} onValueChange={(value) => onChange({ currency_id: value === ALL ? undefined : Number(value) })}>
        <SelectTrigger className="w-[46vw] sm:w-32">
          <SelectValue placeholder={translate("ph.devise")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{translate("t.toutesDevises")}</SelectItem>
          {(currencies.data ?? []).map((currency) => (
            <SelectItem key={currency.id} value={String(currency.id)}>
              {currency.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
