import { formatCurrency } from "@/lib/format";
import { getActiveLocale } from "@/i18n/locale";
import { translate } from "@/i18n/translate";
import { compactCurrency, compactNumber } from "../lib/compact";
import type { DashboardMonthlyPerformance } from "../types";

const ENGAGED_COLOR = "#E5A817";

/** « juil. 2026 » à partir d'une clé `2026-07`. */
function monthLabel(key: string): { label: string; year: string } {
  const [y, m] = key.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  const locale = getActiveLocale() === "en" ? "en-US" : "fr-FR";
  return {
    label: new Intl.DateTimeFormat(locale, { month: "short" }).format(date).replace(".", ""),
    year: y,
  };
}

/**
 * « Performance mensuelle » — NJ Global Trade Dashboard.dc.html lignes 501-545 :
 * deux colonnes par mois sur six mois (doré = CA engagé à la date de commande,
 * vert = net encaissé à la date du mouvement), axe des ordonnées à 4 crans,
 * légende, et un pied à 4 statistiques de synthèse. Indépendant du filtre de
 * période de la page (fenêtre = 6 derniers mois glissants).
 */
export function MonthlyPerformanceCard({ data }: { data: DashboardMonthlyPerformance }) {
  const max = Math.max(1, ...data.mois.flatMap((point) => [point.ca_engage, point.net_encaisse]));
  const step = max / 3;
  const axis = [3, 2, 1, 0].map((index) => compactNumber(step * index));

  const stats = [
    { label: translate("dashboard.monthly.stat.engaged6m"), value: compactCurrency(data.resume.engage_6m), color: "text-accent-hover" },
    { label: translate("dashboard.monthly.stat.collected6m"), value: compactCurrency(data.resume.encaisse_6m), color: "text-success" },
    {
      label: translate("dashboard.monthly.stat.bestMonth"),
      value: data.resume.meilleur_mois
        ? (() => {
            const { label, year } = monthLabel(data.resume.meilleur_mois);
            return `${label} ${year}`;
          })()
        : "—",
      color: "text-foreground",
    },
    {
      label: translate("dashboard.monthly.stat.cashConversion"),
      value: `${data.resume.conversion_caisse_pourcentage} %`,
      color: "text-link",
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10px] font-bold tracking-[0.14em] text-text-tertiary uppercase">{translate("dashboard.monthly.title")}</span>
          <span className="text-xs text-text-tertiary text-pretty">{translate("dashboard.monthly.hint")}</span>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Legend color={ENGAGED_COLOR} label={translate("dashboard.monthly.legend.engaged")} />
          <Legend color="var(--color-success)" label={translate("dashboard.monthly.legend.collected")} />
        </div>
      </div>

      <div className="flex flex-1 items-end gap-3.5 px-5 pt-5 pb-3.5" style={{ minHeight: 240 }}>
        <div className="flex h-[200px] w-[54px] shrink-0 flex-col items-end justify-between pb-[26px]">
          {axis.map((tick, index) => (
            <span key={index} className="text-[10px] font-semibold text-text-quaternary tabular-nums">
              {tick}
            </span>
          ))}
        </div>
        <div className="flex h-[200px] min-w-0 flex-1 items-end justify-between gap-2 border-b border-l border-border px-1">
          {data.mois.map((point) => {
            const { label, year } = monthLabel(point.mois);
            const engagedPct = (point.ca_engage / max) * 100;
            const collectedPct = (Math.max(0, point.net_encaisse) / max) * 100;
            const active = point.ca_engage > 0 || point.net_encaisse !== 0;
            return (
              <div key={point.mois} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-[7px]">
                <div
                  className="flex flex-1 items-end justify-center gap-1"
                  title={`${label} ${year} — ${translate("dashboard.monthly.legend.engaged")} ${formatCurrency(point.ca_engage)}, ${translate("dashboard.monthly.legend.collected")} ${formatCurrency(point.net_encaisse)}`}
                >
                  <span
                    className="w-[42%] max-w-[26px] rounded-t-[4px]"
                    style={{ height: `${engagedPct}%`, minHeight: 2, background: ENGAGED_COLOR }}
                  />
                  <span
                    className="w-[42%] max-w-[26px] rounded-t-[4px] bg-success"
                    style={{ height: `${collectedPct}%`, minHeight: 2 }}
                  />
                </div>
                <div className="flex h-[26px] flex-col items-center gap-px">
                  <span className={active ? "text-[11px] font-semibold text-muted-foreground" : "text-[11px] font-semibold text-text-quaternary"}>
                    {label}
                  </span>
                  <span className="text-[9.5px] font-medium text-text-quaternary">{year}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-border bg-muted/40 px-5 py-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold tracking-[0.12em] text-text-quaternary uppercase">{stat.label}</span>
            <span className={`text-sm font-bold tabular-nums ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[7px]">
      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
      <span className="text-[11.5px] font-semibold whitespace-nowrap text-muted-foreground">{label}</span>
    </div>
  );
}
