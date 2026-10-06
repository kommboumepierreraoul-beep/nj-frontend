import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { translate } from "@/i18n/translate";
import { compactCurrency, compactNumber } from "../lib/compact";
import { METRIC_TONE_TEXT, PANEL_CONFIG, PANEL_ICON_TONE, panelHint, panelTitle } from "../config/panels";
import type { DashboardModulePanel, DashboardPanelBar, DashboardPanelMetric } from "../types";

function metricValue(metric: DashboardPanelMetric): { value: string; unit?: string } {
  if (metric.unite === "FCFA") return { value: compactNumber(metric.valeur), unit: "FCFA" };
  if (metric.unite === "%") return { value: `${metric.valeur}`, unit: "%" };
  if (typeof metric.valeur === "number") return { value: formatNumber(metric.valeur) };
  return { value: String(metric.valeur) };
}

/**
 * Grille des 8 panneaux modules — NJ Global Trade Dashboard.dc.html lignes
 * 616-664 : puce d'icône, titre + accroche, lien vers le module, grille de
 * métriques sur 2 colonnes, barres optionnelles, pied de carte optionnel.
 * Instantané tout-module, indépendant du filtre de période.
 */
export function ModulePanelsGrid({ panels }: { panels: DashboardModulePanel[] }) {
  return (
    <div className="grid items-start gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))" }}>
      {panels.map((panel) => {
        const config = PANEL_CONFIG[panel.code];
        if (!config) return null;
        const Icon = config.icon;
        const footLabel = config.footLabel;
        const footEntries = panel.pied ? Object.entries(panel.pied) : [];

        return (
          <div key={panel.code} className="flex flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <span className={cn("flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]", PANEL_ICON_TONE[config.tone])}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[10px] font-bold tracking-[0.14em] text-text-tertiary uppercase">{panelTitle(panel.code)}</span>
                <span className="text-xs text-text-tertiary text-pretty">{panelHint(panel.code)}</span>
              </div>
              <Link
                href={config.href}
                title={translate(config.linkKey)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-quaternary hover:bg-muted hover:text-foreground"
              >
                <ArrowUpRight className="h-[18px] w-[18px]" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-[18px] gap-y-3.5 px-5 py-4">
              {panel.metriques.map((metric) => {
                const { value, unit } = metricValue(metric);
                return (
                  <div key={metric.code} className="flex min-w-0 flex-col gap-[3px]">
                    <span className="text-[9px] font-bold tracking-[0.12em] text-text-quaternary uppercase">{config.metricLabel(metric.code)}</span>
                    <span className="flex items-baseline gap-[5px]">
                      <span
                        className={cn(
                          "text-[18px] font-bold tracking-[-0.02em] tabular-nums",
                          metric.ton ? METRIC_TONE_TEXT[metric.ton] : "text-foreground",
                        )}
                      >
                        {value}
                      </span>
                      {unit ? <span className="text-[10.5px] font-semibold text-text-quaternary">{unit}</span> : null}
                    </span>
                  </div>
                );
              })}
            </div>

            {panel.barres.length > 0 ? (
              <div className="flex flex-col gap-[11px] px-5 pt-1 pb-[18px]">
                {panel.barres.map((bar) => (
                  <PanelBar key={bar.code} bar={bar} label={config.barLabel?.(bar.code) ?? bar.code} />
                ))}
              </div>
            ) : null}

            {footEntries.length > 0 && footLabel ? (
              <div className="mt-auto border-t border-border bg-muted/40 px-5 py-3 text-[11.5px] leading-[1.45] font-medium text-text-tertiary text-pretty">
                {footEntries.map(([key, value], index) => (
                  <span key={key}>
                    {index > 0 ? " · " : ""}
                    {footLabel(key)} {formatNumber(value)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function PanelBar({ bar, label }: { bar: DashboardPanelBar; label: string }) {
  const value = bar.montant != null ? `${formatNumber(bar.valeur)} · ${compactCurrency(bar.montant)}` : formatNumber(bar.valeur);
  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[12.5px] font-medium text-muted-foreground">{label}</span>
        <span className="shrink-0 text-xs font-bold text-foreground tabular-nums">{value}</span>
      </div>
      <div className="h-[7px] overflow-hidden rounded-full bg-neutral-bg">
        <div className="h-full rounded-full bg-accent" style={{ width: `${bar.pourcentage}%` }} />
      </div>
    </div>
  );
}
