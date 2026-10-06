"use client";

import Link from "next/link";
import { CircleCheck, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data-display/empty-state";
import { ErrorState } from "@/components/data-display/error-state";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { TableSection } from "@/components/data-display/table-section";
import { useBottlenecks } from "../hooks/use-flow-reports";
import { FLOW_TYPE_ICONS, FLOW_TYPE_LABELS, FLOW_TYPE_TONES } from "../badges";
import { routes } from "@/config/routes";
import type { Bottleneck, FlowAnalyticsFilters } from "../types";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_analyse_flux.md § Onglet A — onglet par défaut à l'ouverture
 * de la page, tableau `goulots` déjà trié par sévérité décroissante côté API
 * (jamais retrié ici). État vide = message positif, pas une erreur, très
 * probable au lancement du module (§ Points de cadrage n°4).
 */
export function BottlenecksTab({ filters }: { filters: FlowAnalyticsFilters }) {
  const query = useBottlenecks(filters, true);

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  if (query.isLoading || !query.data) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  const goulots = query.data.goulots;

  if (goulots.length === 0) {
    return (
      <EmptyState
        size="lg"
        icon={CircleCheck}
        title={translate("t.aucunGoulotDetecteSurCettePeriode")}
        description={translate("t.toutesLesEtapesSuiviesRestentSousLeurSeuilConfigur")}
      />
    );
  }

  const maxGap = Math.max(...goulots.map((row) => row.ecart), 1);

  const columns: DataTableColumn<Bottleneck>[] = [
    {
      key: "flow",
      header: "Flux",
      width: "130px",
      render: (row) => {
        const Icon = FLOW_TYPE_ICONS[row.flow_type];
        return (
          <Badge tone={FLOW_TYPE_TONES[row.flow_type]}>
            <Icon className="mr-1 h-3 w-3" />
            {FLOW_TYPE_LABELS[row.flow_type]}
          </Badge>
        );
      },
    },
    {
      key: "stage",
      header: translate("col.step"),
      width: "minmax(240px,1.4fr)",
      render: (row) => (
        <div>
          <p className="text-pretty text-[13.5px] font-semibold text-foreground">{row.label}</p>
          <p className="font-mono text-[10.5px] text-text-quaternary">{row.stage_code}</p>
        </div>
      ),
    },
    {
      key: "observed",
      header: translate("t.valeurObservee"),
      align: "right",
      width: "150px",
      render: (row) => (
        <span className="tabular-nums">
          <span className="text-[15px] font-bold text-foreground">{row.valeur_observee}</span> <span className="text-[11px] text-text-quaternary">{row.unite}</span>
        </span>
      ),
    },
    {
      key: "threshold",
      header: translate("t.seuilConfigure"),
      align: "right",
      width: "140px",
      render: (row) => (
        <span className="tabular-nums text-muted-foreground">
          {row.seuil} <span className="text-[11px] text-text-quaternary">{row.unite}</span>
        </span>
      ),
    },
    {
      key: "gap",
      header: translate("t.ecart"),
      width: "minmax(150px,1fr)",
      render: (row) => (
        <div className="flex w-full min-w-0 flex-col gap-1.5">
          <span className="tabular-nums text-[13px] font-bold text-destructive">
            +{row.ecart} {row.unite}
          </span>
          <div className="h-[7px] w-full overflow-hidden rounded-full bg-neutral-bg">
            <div className="h-full rounded-full bg-destructive transition-[width]" style={{ width: `${(row.ecart / maxGap) * 100}%` }} />
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "56px",
      render: (row) => (
        <Link
          href={`${routes.settings.flowAnalyticsThresholds}?flow_type=${row.flow_type}&stage_code=${row.stage_code}`}
          title={translate("t.ajusterCeSeuilDansLesParametres")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" />
        </Link>
      ),
    },
  ];

  return (
    <TableSection
      title={translate("t.goulotsDEtranglement")}
      hint={translate("t.etapesDontLaValeurObserveeDepasseLeSeuilConfigureT")}
    >
      <DataTable columns={columns} data={goulots} rowKey={(row) => `${row.flow_type}-${row.stage_code}`} className="rounded-t-none border-0" />
      <div className="border-t border-border bg-surface-subtle px-[18px] py-3 text-[12px] text-muted-foreground text-pretty">
        {goulots.length} goulot(s) détecté(s). Si un seuil paraît mal calibré, ajustez-le plutôt que de courir après un faux blocage.
      </div>
    </TableSection>
  );
}
