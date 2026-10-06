"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { KeyRound, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/data-display/page-header";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { usePermissionsCatalog } from "@/modules/users/hooks/use-permissions-catalog";
import { routes } from "@/config/routes";
import type { Permission } from "@/types/permissions";
import { translate } from "@/i18n/translate";

function moduleOf(code: string): string {
  return code.split(".")[0] ?? code;
}

/**
 * Doc/spec_pages_utilisateurs.md § D1 « Catalogue des permissions » —
 * lecture seule (décision §10.3, les codes sont créés par migration/seed).
 * La colonne « nombre d'utilisateurs/rôles l'utilisant » suggérée par la
 * spec n'est pas affichée : aucun champ ne l'expose dans la réponse décrite
 * pour `GET /api/permissions` (simple catalogue `{code, label, description}`)
 * — mieux vaut l'omettre que d'afficher un chiffre inventé.
 */
export default function PermissionsCatalogPage() {
  const query = usePermissionsCatalog();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");

  const modules = useMemo(() => {
    const set = new Set((query.data ?? []).map((permission) => moduleOf(permission.code)));
    return Array.from(set).sort();
  }, [query.data]);

  const filtered = (query.data ?? []).filter((permission) => {
    const matchesModule = moduleFilter === "ALL" || moduleOf(permission.code) === moduleFilter;
    const matchesSearch = !search || permission.code.toLowerCase().includes(search.toLowerCase()) || permission.label.toLowerCase().includes(search.toLowerCase());
    return matchesModule && matchesSearch;
  });

  const columns: DataTableColumn<Permission>[] = [
    { key: "code", header: translate("col.code"), render: (row) => <code className="text-xs text-foreground">{row.code}</code> },
    { key: "label", header: translate("col.label"), render: (row) => row.label },
    { key: "description", header: translate("col.description"), render: (row) => <span className="text-muted-foreground">{row.description ?? "—"}</span> },
    { key: "module", header: translate("col.module"), render: (row) => <span className="text-muted-foreground">{moduleOf(row.code)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={translate("page.permissions.title")}
        badges={
          <>
            <span className="inline-flex h-[24px] items-center rounded-full border border-border bg-surface px-[10px] text-[11px] font-semibold whitespace-nowrap text-muted-foreground">
              {query.data?.length ?? "…"} {translate("t.codesSuffix")}
            </span>
            <Badge tone="neutral">{translate("guide.p.lectureSeule")}</Badge>
          </>
        }
        description={translate("page.permissions.desc")}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={routes.users.roles}>
                <KeyRound className="h-4 w-4" />
                {translate("page.roles.title")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={routes.users.list}>
                <Users className="h-4 w-4" />
                {translate("page.users.title")}
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-surface p-4">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={translate("page.permissions.searchPlaceholder")} className="pl-9" />
        </div>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={translate("page.permissions.allModules")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{translate("t.tousLesModules")}</SelectItem>
            {modules.map((module) => (
              <SelectItem key={module} value={module}>
                {module}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} isLoading={query.isLoading} isError={query.isError} error={query.error} onRetry={() => query.refetch()} rowKey={(row) => row.code} emptyTitle={translate("page.permissions.empty")} />
    </div>
  );
}
