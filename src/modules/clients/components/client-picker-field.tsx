"use client";

import { useMemo, useState } from "react";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useClientsList } from "../hooks/use-clients-list";
import { useClient } from "../hooks/use-client";
import { translate } from "@/i18n/translate";

/**
 * Sélecteur client à recherche (§ « recherche par nom ») — combobox
 * (`components/ui/combobox.tsx`) avec recherche serveur : la liste se
 * recharge à la frappe (`useClientsList({ search })`), le client déjà
 * sélectionné est résolu séparément (`useClient`) pour afficher son nom même
 * quand il ne figure pas dans les résultats courants.
 */
export function ClientPickerField({
  value,
  onChange,
  excludeId,
  id,
}: {
  value?: number;
  onChange: (id: number | undefined) => void;
  excludeId?: number;
  id?: string;
}) {
  const [search, setSearch] = useState("");
  const list = useClientsList({ search: search || undefined, per_page: 20 });
  const selectedClient = useClient(value ?? 0);

  const options = useMemo<ComboboxOption[]>(() => {
    const rows = (list.data?.data ?? []).filter((client) => client.id !== excludeId);
    const merged = [...rows];
    // Garantit que l'option sélectionnée est présente même hors résultats courants.
    if (value && selectedClient.data && !merged.some((client) => client.id === value)) {
      merged.unshift(selectedClient.data);
    }
    return merged.map((client) => ({
      value: String(client.id),
      label: client.full_name,
      description: client.legal_name && client.legal_name !== client.full_name ? client.legal_name : undefined,
    }));
  }, [list.data, selectedClient.data, value, excludeId]);

  return (
    <Combobox
      id={id}
      value={value ? String(value) : undefined}
      onValueChange={(next) => onChange(next ? Number(next) : undefined)}
      options={options}
      onSearchChange={setSearch}
      loading={list.isFetching}
      placeholder={translate("ph.rechercherUnClientParNom")}
      searchPlaceholder={translate("ph.nomDuClient")}
      emptyText={translate("ph.aucunClientTrouve")}
    />
  );
}
