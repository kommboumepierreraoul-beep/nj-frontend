"use client";
import { translate } from "@/i18n/translate";

/**
 * Doc/spec_pages_audit.md § « Panneau détail » — jamais de JSON brut : diff
 * lisible clé → valeur, 4 cas normaux (création/suppression/modification/
 * sans valeurs), lignes identiques grisées dans le cas modification.
 */
export function AuditDiffView({ oldValue, newValue }: { oldValue: Record<string, unknown> | null; newValue: Record<string, unknown> | null }) {
  if (!oldValue && !newValue) {
    return <p className="text-sm text-muted-foreground">{translate("t.aucuneValeurAssocieeACetteAction")}</p>;
  }

  if (!oldValue && newValue) {
    return <ValueList title={translate("t.valeursEnregistrees")} values={newValue} />;
  }

  if (oldValue && !newValue) {
    return <ValueList title={translate("t.dernierEtatConnuAvantSuppression")} values={oldValue} />;
  }

  const before = oldValue ?? {};
  const after = newValue ?? {};
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{translate("t.modifications")}</p>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-background/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">{translate("t.champ")}</th>
              <th className="px-3 py-2 text-left">{translate("t.avant")}</th>
              <th className="px-3 py-2 text-left">{translate("t.apres")}</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => {
              const changed = JSON.stringify(before[key]) !== JSON.stringify(after[key]);
              return (
                <tr key={key} className={changed ? "bg-warning/10 text-foreground" : "text-muted-foreground"}>
                  <td className="border-t border-border px-3 py-2 font-medium">{key}</td>
                  <td className="border-t border-border px-3 py-2">{formatValue(before[key])}</td>
                  <td className="border-t border-border px-3 py-2">{formatValue(after[key])}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ValueList({ title, values }: { title: string; values: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <dl className="space-y-1.5 rounded-md border border-border bg-background/40 p-3 text-sm">
        {Object.entries(values).map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{key}</dt>
            <dd className="text-right text-foreground">{formatValue(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
