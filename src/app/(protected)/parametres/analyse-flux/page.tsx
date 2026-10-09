"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { PageSuspense } from "@/components/layout/page-suspense";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { InfoBanner } from "@/components/data-display/info-banner";
import { FlowStageThresholdFormDialog } from "@/modules/flow-analytics/components/flow-stage-threshold-form-dialog";
import { useFlowStageThresholds } from "@/modules/flow-analytics/hooks/use-flow-stage-thresholds";
import { useDeleteFlowStageThreshold } from "@/modules/flow-analytics/hooks/use-flow-stage-threshold-mutations";
import { FLOW_TYPE_LABELS, FLOW_TYPE_TONES, THRESHOLD_TYPE_LABELS, formatByThresholdType } from "@/modules/flow-analytics/badges";
import { routes } from "@/config/routes";
import type { FlowStageThreshold, FlowType } from "@/modules/flow-analytics/types";
import { translate } from "@/i18n/translate";

const SECTIONS: FlowType[] = ["ACHAT", "VENTE", "ACTIVITE"];

function isFlowType(value: string | null): value is FlowType {
  return value === "ACHAT" || value === "VENTE" || value === "ACTIVITE";
}

export default function FlowAnalyticsThresholdsPage() {
  return (
    <PageSuspense>
      <FlowAnalyticsThresholdsPageContent />
    </PageSuspense>
  );
}

/**
 * Doc/spec_pages_analyse_flux.md § 2 « Paramètres → Analyse des flux » —
 * seuils groupés par `flow_type` (trois sections, dans cet ordre, l'API
 * trie déjà par `flow_type` puis `sort_order`). Ne modifie que la
 * configuration d'alerte, jamais une commande ou un paiement.
 *
 * § Onglet A — le lien « Ajuster ce seuil » de l'onglet Vue d'ensemble pointe
 * ici avec `?flow_type=...&stage_code=...` : conformément à la convention
 * de filtrage par URL (Doc/frontend_architecture_structure.md § 5, "un lien
 * partagé doit reproduire exactement la même vue"), cette page restreint
 * l'affichage à ce flux et met en évidence la ligne visée au lieu d'ignorer
 * ces paramètres.
 */
function FlowAnalyticsThresholdsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawFlowType = searchParams.get("flow_type");
  const highlightFlowType = isFlowType(rawFlowType) ? rawFlowType : null;
  const highlightStageCode = searchParams.get("stage_code");

  const query = useFlowStageThresholds({});
  const deleteMutation = useDeleteFlowStageThreshold();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FlowStageThreshold | null>(null);
  const [creatingFor, setCreatingFor] = useState<FlowType | null>(null);
  const [toDelete, setToDelete] = useState<FlowStageThreshold | null>(null);

  const thresholds = query.data ?? [];
  const sections = highlightFlowType ? [highlightFlowType] : SECTIONS;

  function columnsFor(): DataTableColumn<FlowStageThreshold>[] {
    return [
      {
        key: "stage",
        header: translate("col.step"),
        render: (row) => (
          <div>
            <p className="font-medium text-foreground">{row.label}</p>
            <p className="text-xs text-muted-foreground">{row.stage_code}</p>
          </div>
        ),
      },
      { key: "type", header: translate("col.thresholdType"), render: (row) => <Badge tone="neutral">{THRESHOLD_TYPE_LABELS[row.threshold_type]}</Badge> },
      { key: "value", header: translate("col.value"), render: (row) => formatByThresholdType(row.threshold_value, row.threshold_type) },
      { key: "status", header: translate("value.active"), render: (row) => <Badge tone={row.is_active ? "success" : "neutral"}>{row.is_active ? translate("value.active") : translate("value.inactive")}</Badge> },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (row) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => { setEditing(row); setFormOpen(true); }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setToDelete(row)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: translate("nav.settings"), href: routes.settings.hub }, { label: "Analyse des flux" }]}
        title={translate("page.flowThresholds.title")}
        description={translate("page.flowThresholds.desc")}
      />

      <InfoBanner>
        Les 10 seuils fournis par défaut (5 en Achat, 4 en Vente, 2 en Activité) sont des valeurs arbitraires, faute de référence chiffrée — à ajuster ou valider avant de considérer l&apos;onglet Vue d&apos;ensemble comme un outil de pilotage fiable.
      </InfoBanner>

      {highlightFlowType ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-border bg-surface-subtle px-4 py-2.5 text-[13px] text-muted-foreground">
          <span className="min-w-0 text-pretty">
            Affichage filtré sur le flux <strong className="text-foreground">{FLOW_TYPE_LABELS[highlightFlowType]}</strong>, depuis l&apos;onglet Vue d&apos;ensemble.
          </span>
          <Button variant="ghost" size="sm" onClick={() => router.push(routes.settings.flowAnalyticsThresholds)}>
            <X className="h-4 w-4" />
            Voir tous les seuils
          </Button>
        </div>
      ) : null}

      {query.isError ? (
        <DataTable columns={columnsFor()} data={undefined} isLoading={false} isError error={query.error} onRetry={() => query.refetch()} rowKey={(row) => row.id} />
      ) : (
        sections.map((flowType) => {
          const rows = thresholds.filter((threshold) => threshold.flow_type === flowType);
          return (
            <section key={flowType} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge tone={FLOW_TYPE_TONES[flowType]}>{FLOW_TYPE_LABELS[flowType]}</Badge>
                  <h2 className="text-sm font-semibold text-foreground">Seuils {FLOW_TYPE_LABELS[flowType].toLowerCase()}</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setCreatingFor(flowType);
                    setFormOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Nouveau seuil
                </Button>
              </div>
              <DataTable
                columns={columnsFor()}
                data={rows}
                isLoading={query.isLoading}
                rowKey={(row) => row.id}
                rowClassName={(row) => (highlightStageCode && row.stage_code === highlightStageCode ? "bg-amber-50 ring-1 ring-inset ring-amber-300" : undefined)}
                emptyTitle={`Aucun seuil configuré pour le flux ${FLOW_TYPE_LABELS[flowType].toLowerCase()}`}
              />
            </section>
          );
        })
      )}

      <FlowStageThresholdFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setCreatingFor(null);
        }}
        threshold={editing}
        defaultFlowType={creatingFor ?? "ACHAT"}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.flowThresholds.deleteTitle")}
        description={translate("page.flowThresholds.deleteDesc")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </div>
  );
}
