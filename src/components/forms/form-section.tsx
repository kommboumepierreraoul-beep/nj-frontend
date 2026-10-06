import { cn } from "@/lib/utils";

/**
 * Section titrée d'un formulaire en modal/panneau (§ 2.3), calquée sur NJ
 * Global Trade Clients.dc.html lignes 684-692 : libellé de section en doré
 * avec filet de séparation, champs à 1/2/3 colonnes via `cols`.
 */
export function FormSection({
  title,
  description,
  cols = 1,
  children,
  className,
}: {
  title?: string;
  description?: string;
  cols?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
}) {
  const gridCols = cols === 3 ? "sm:grid-cols-3" : cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1";
  return (
    <section className={cn("flex flex-col gap-3.5", className)}>
      {title ? (
        <div className="flex items-center gap-3">
          <h3 className="whitespace-nowrap text-[10px] font-bold tracking-[0.14em] text-accent uppercase">{title}</h3>
          <div className="h-px flex-1 bg-border" />
        </div>
      ) : null}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      <div className={cn("grid grid-cols-1 gap-3.5", gridCols)}>{children}</div>
    </section>
  );
}

export function FormField({
  label,
  htmlFor,
  error,
  required,
  span,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  span?: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", span === 2 && "sm:col-span-2", span === 3 && "sm:col-span-3")}>
      <label htmlFor={htmlFor} className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
