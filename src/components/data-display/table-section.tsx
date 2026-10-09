import { cn } from "@/lib/utils";

/**
 * En-tête de bloc au-dessus d'un `DataTable` (§ 2.3), calqué sur NJ Global
 * Trade Fournisseurs.dc.html lignes 456-465 : titre en petites capitales +
 * une phrase d'aide, bouton d'ajout à droite, le tout dans la même carte
 * blanche que le tableau (pas un bouton isolé au-dessus). Le `DataTable`
 * enfant doit recevoir `className="rounded-t-none border-0"` pour fusionner
 * visuellement avec cet en-tête plutôt que de dupliquer la bordure.
 */
export function TableSection({
  title,
  hint,
  action,
  children,
  className,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[14px] border border-border bg-surface", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-[18px] py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{title}</span>
          {hint ? <span className="text-xs text-text-tertiary">{hint}</span> : null}
        </div>
        {action ? <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}
