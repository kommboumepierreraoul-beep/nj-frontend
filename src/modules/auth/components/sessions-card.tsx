"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/data-display/error-state";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { useSessions } from "../hooks/use-sessions";
import { useLogoutAllOtherDevices, useRevokeSession } from "../hooks/use-session-mutations";
import { formatDateTime } from "@/lib/format";
import type { SessionItem } from "../types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_utilisateurs.md § B2 « Carte Sessions actives ». */
export function SessionsCard() {
  const query = useSessions();
  const revokeMutation = useRevokeSession();
  const logoutAllMutation = useLogoutAllOtherDevices();
  const [toRevoke, setToRevoke] = useState<SessionItem | null>(null);
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

  const hasOtherSessions = (query.data ?? []).some((session) => !session.is_current);

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Sessions actives</h2>
          <p className="mt-1 text-xs text-muted-foreground">{translate("t.appareilsEtNavigateursActuellementConnectesAVotreCompt")}</p>
        </div>
        <Button variant="outline" size="sm" disabled={!hasOtherSessions} onClick={() => setConfirmLogoutAll(true)}>
          <LogOut className="h-4 w-4" />
          Déconnecter tous les autres appareils
        </Button>
      </div>

      <div className="mt-4">
        {query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : !query.data || query.data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Aucune session active.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-background">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">{translate("t.appareil")}</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">{translate("t.derniereUtilisation")}</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">{translate("t.creeeLe")}</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">{translate("t.expireLe")}</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {query.data.map((session) => (
                  <tr key={session.id}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{session.name}</span>
                        {session.is_current ? <Badge tone="accent">Session actuelle</Badge> : null}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{session.last_used_at ? formatDateTime(session.last_used_at) : "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{formatDateTime(session.created_at)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{session.expires_at ? formatDateTime(session.expires_at) : "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      {!session.is_current ? (
                        <Button variant="ghost" size="icon" title={translate("t.revoquer")} onClick={() => setToRevoke(session)}>
                          <LogOut className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toRevoke)}
        onOpenChange={(open) => !open && setToRevoke(null)}
        title={translate("t.revoquerCetteSession")}
        description={`L'appareil « ${toRevoke?.name} » sera déconnecté immédiatement.`}
        confirmLabel={translate("t.revoquer")}
        isPending={revokeMutation.isPending}
        onConfirm={() => {
          if (toRevoke) revokeMutation.mutate(toRevoke.id, { onSuccess: () => setToRevoke(null) });
        }}
      />
      <ConfirmDialog
        open={confirmLogoutAll}
        onOpenChange={setConfirmLogoutAll}
        title={translate("t.deconnecterTousLesAutresAppareils")}
        description={translate("t.parPrudenceLeComportementExactDeCetteActionCoteSer")}
        confirmLabel={translate("t.deconnecter")}
        isPending={logoutAllMutation.isPending}
        onConfirm={() => logoutAllMutation.mutate()}
      />
    </div>
  );
}
