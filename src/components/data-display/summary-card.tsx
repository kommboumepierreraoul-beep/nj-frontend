import { cn } from "@/lib/utils";

export interface SummaryField {
  label: string;
  value: React.ReactNode;
  /** Classe de grille optionnelle (ex. `"sm:col-span-2"`) pour les champs longs (notes, adresse…). */
  className?: string;
}

/**
 * Carte « résumé » en tête de fiche détail (§ 2.4 « Corps de page »), calquée
 * sur NJ Global Trade Fournisseurs.dc.html lignes 372-406 : titre en petites
 * capitales (+ un indicateur optionnel à droite, ex. le score de fiabilité),
 * puis une grille de champs séparée par un filet fin, et un bandeau d'alerte
 * optionnel en pied de carte (ex. « Fournisseur en liste noire »). Reprise
 * pour la fiche fournisseur, le détail RFQ et le détail commande fournisseur.
 */
export function SummaryCard({
  title,
  indicator,
  fields,
  alert,
  className,
}: {
  title: string;
  indicator?: React.ReactNode;
  fields: SummaryField[];
  alert?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 rounded-[14px] border border-border bg-surface p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{title}</span>
        {indicator}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-border pt-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((field, index) => (
          <div key={index} className={cn("flex min-w-0 flex-col gap-1", field.className)}>
            <span className="text-[9.5px] font-semibold tracking-[0.13em] text-text-tertiary uppercase">{field.label}</span>
            <span className="text-pretty break-words text-[13.5px] leading-snug font-medium text-foreground">{field.value}</span>
          </div>
        ))}
      </div>
      {alert}
    </div>
  );
}
