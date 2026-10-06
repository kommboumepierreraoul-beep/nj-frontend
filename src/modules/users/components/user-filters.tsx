"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS } from "../badges";
import type { AdminUserListFilters } from "../types";
import type { UserRole } from "@/types/permissions";
import { FilterBar } from "@/components/data-display/filter-bar";
import { translate } from "@/i18n/translate";

const ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN"];

/** Doc/spec_pages_utilisateurs.md § C1 « Barre d'outils » — filtres booléens gérés en state local (pas `useQueryParams`, qui ne supporte pas les valeurs booléennes). */
export function UserFilters({ filters, onChange }: { filters: AdminUserListFilters; onChange: (patch: Partial<AdminUserListFilters>) => void }) {
  return (
    <FilterBar>
      <div className="relative w-[64vw] sm:w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search ?? ""}
          onChange={(event) => onChange({ search: event.target.value || undefined })}
          placeholder={translate("ph.rechercherParNomOuEmail")}
          className="pl-9"
        />
      </div>

      <Select value={filters.role ?? "ALL"} onValueChange={(value) => onChange({ role: value === "ALL" ? undefined : (value as UserRole) })}>
        <SelectTrigger className="w-[190px]">
          <SelectValue placeholder={translate("ph.tousLesRoles")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{translate("t.tousLesRoles")}</SelectItem>
          {ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {ROLE_LABELS[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.is_active === undefined ? "ALL" : filters.is_active ? "ACTIVE" : "INACTIVE"}
        onValueChange={(value) => onChange({ is_active: value === "ALL" ? undefined : value === "ACTIVE" })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={translate("ph.tousLesStatuts")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{translate("t.tousLesStatuts")}</SelectItem>
          <SelectItem value="ACTIVE">{translate("t.actif")}</SelectItem>
          <SelectItem value="INACTIVE">{translate("t.inactif")}</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
        <Switch id="must-change-password" checked={filters.must_change_password ?? false} onCheckedChange={(value) => onChange({ must_change_password: value || undefined })} />
        <Label htmlFor="must-change-password" className="text-sm">
          {translate("t.motDePasseAChanger")}
        </Label>
      </div>
    </FilterBar>
  );
}
