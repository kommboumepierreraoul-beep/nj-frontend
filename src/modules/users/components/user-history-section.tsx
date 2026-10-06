"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data-display/empty-state";
import { ErrorState } from "@/components/data-display/error-state";
import { Pagination } from "@/components/data-display/pagination";
import { useAuditLogs } from "@/modules/audit/hooks/use-audit-logs";
import { resolveActionLabel } from "@/modules/audit/badges";
import { formatDateTime } from "@/lib/format";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_utilisateurs.md § C2 « Section Historique » — réutilise le Journal d'audit transversal (Doc/spec_pages_audit.md) filtré sur ce compte, plutôt qu'un flux dédié. */
export function UserHistorySection({ userId }: { userId: number }) {
  const [page, setPage] = useState(1);
  const query = useAuditLogs({ entity_type: "User", entity_id: userId, page, per_page: 10 });

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">{translate("t.historique")}</h2>
      <div className="mt-3">
        {query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : !query.data || query.data.data.length === 0 ? (
          <EmptyState title={translate("t.aucunEvenementEnregistrePourCeCompte")} />
        ) : (
          <div className="divide-y divide-border">
            {query.data.data.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div>
                  <p className="text-foreground">{resolveActionLabel("User", log.action)}</p>
                  <p className="text-xs text-muted-foreground">{log.actor ? log.actor.full_name : translate("t.utilisateurSupprime")}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
              </div>
            ))}
          </div>
        )}
        {query.data?.meta && !query.isLoading && !query.isError ? <Pagination meta={query.data.meta} onPageChange={setPage} /> : null}
      </div>
    </section>
  );
}
