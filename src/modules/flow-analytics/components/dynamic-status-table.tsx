import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { translate } from "@/i18n/translate";

export interface EnumTableRow<K extends string> {
  key: K;
  label: string;
}

export interface BarRow {
  key: string;
  label: string;
  code?: string;
  /** Largeur du remplissage, 0-100. */
  pct: number;
  /** Texte incrusté dans la barre (valeur) — vide pour une barre "pas de donnée". */
  inBarText?: string;
  /** Mention à droite de la barre. */
  meta?: string;
  barClassName?: string;
  /** Ligne grisée : valeur absente de la réponse ou réellement nulle, selon le bloc. */
  muted?: boolean;
}

/**
 * Liste de barres horizontales — label + code technique à gauche, barre
 * proportionnelle avec la valeur incrustée, mention à droite — calquée sur
 * les blocs `funnel`/`stages` de NJ Global Trade Flux.dc.html (lignes
 * 509-663). Réutilisée pour le pipeline actuel, le temps moyen par étape,
 * les abandons par étape et le taux de transformation (achat/vente),
 * plutôt qu'un tableau HTML — la maquette n'en utilise jamais pour ce type
 * de lecture.
 */
export function BarList({ rows, note, noteTone = "muted" }: { rows: BarRow[]; note?: React.ReactNode; noteTone?: "muted" | "warning" | "success" }) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-3.5">
          <div className="flex w-[140px] shrink-0 flex-col gap-0.5 sm:w-[170px]">
            <span className={cn("truncate text-[12.5px] font-semibold", row.muted ? "text-text-quaternary" : "text-foreground")}>{row.label}</span>
            {row.code ? <span className="truncate font-mono text-[10px] text-text-quaternary">{row.code}</span> : null}
          </div>
          <div className="relative h-7 min-w-0 flex-1 overflow-hidden rounded-lg bg-background">
            <div className={cn("absolute inset-y-0 left-0 rounded-lg transition-[width]", row.barClassName ?? "bg-accent")} style={{ width: `${row.pct}%` }} />
            {row.inBarText ? (
              <div className={cn("relative flex h-full items-center truncate px-2.5 text-[11.5px] font-bold", row.pct > 25 ? "text-white" : "text-muted-foreground")}>
                {row.inBarText}
              </div>
            ) : null}
          </div>
          {row.meta !== undefined ? (
            <div className={cn("w-[104px] shrink-0 text-right text-[12.5px] font-semibold", row.muted ? "text-text-quaternary" : "text-foreground")}>{row.meta}</div>
          ) : null}
        </div>
      ))}
      {note ? (
        <div
          className={cn(
            "flex items-start gap-2 border-t pt-3 text-[11.5px] leading-relaxed text-pretty",
            noteTone === "warning" && "border-warning-bg text-warning",
            noteTone === "success" && "border-success-bg text-success",
            noteTone === "muted" && "border-border text-muted-foreground",
          )}
        >
          <Info className="mt-0.5 h-[15px] w-[15px] shrink-0" />
          <p>{note}</p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Doc/spec_pages_analyse_flux.md § Bloc 4 flux vente — entonnoir de
 * conversion, barre proportionnelle à `valeur / commandes_creees`. Étape
 * absente de la réponse → "Pas de donnée sur la période", pas de barre à 0
 * (point d'attention en tête de la spec : une étape sans transition
 * n'apparaît pas du tout comme clé, ce n'est pas un vrai zéro).
 */
export function ConversionFunnel<K extends string>({ rows, data, total }: { rows: EnumTableRow<K>[]; data: Partial<Record<K, number>> | undefined; total: number }) {
  const barRows: BarRow[] = rows.map((row) => {
    const value = data?.[row.key];
    const has = value !== undefined;
    const pct = has && total > 0 ? Math.min(100, (value / total) * 100) : 0;
    return {
      key: row.key,
      label: row.label,
      code: row.key,
      pct,
      inBarText: has ? `${value} commande(s)` : translate("t.pasDeDonneeSurLaPeriode"),
      meta: has ? `${Math.round(pct)} %` : "—",
      barClassName: has ? "bg-[var(--color-link)]" : "bg-neutral-bg",
      muted: !has,
    };
  });
  return <BarList rows={barRows} />;
}
