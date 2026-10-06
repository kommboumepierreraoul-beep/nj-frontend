"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/http/api-client";
import { endpoints } from "@/lib/http/endpoints";
import { toQueryString } from "@/lib/http/query-string";
import type { ApiCollection } from "@/types/api";
import type { AuthUser } from "@/modules/auth/types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_audit.md § Filtres — sélecteur « Auteur », « alimenté par
 * `GET /api/users` (module Utilisateurs), pas par cet endpoint ». Le module
 * Utilisateurs (Doc/spec_pages_utilisateurs.md) n'est pas encore construit à
 * ce stade de la session : ce composant appelle directement `GET /users`
 * avec le seul type déjà disponible (`AuthUser`, reflet de `UserResource`)
 * plutôt que d'attendre un module Utilisateurs complet — recherche simple
 * par nom/email, même pattern que `ClientPickerField`/`VariantPickerField`.
 */
export function ActorPickerField({ value, onChange }: { value?: number; onChange: (id: number | undefined) => void }) {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["users", "search", search],
    queryFn: () => apiClient.get<ApiCollection<AuthUser>>(`${endpoints.users.base}${toQueryString({ search: search || undefined, per_page: 8 })}`),
    enabled: search.length > 0,
  });
  const options = query.data?.data ?? [];
  const selected = options.find((user) => user.id === value);

  return (
    <div className="space-y-1.5">
      <Input
        value={selected ? selected.full_name : search}
        onChange={(event) => {
          setSearch(event.target.value);
          if (value) onChange(undefined);
        }}
        placeholder={translate("ph.rechercherUnAuteurParNomOuEmail")}
      />
      {search && !selected && options.length > 0 ? (
        <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-surface">
          {options.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => {
                onChange(user.id);
                setSearch("");
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-background"
            >
              {user.full_name} <span className="text-muted-foreground">({user.email})</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
