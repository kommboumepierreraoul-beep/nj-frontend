import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type RowActionTone = "neutral" | "accent" | "success" | "destructive";

const TONE_CLASSES: Record<RowActionTone, string> = {
  neutral: "bg-surface-subtle text-muted-foreground hover:bg-border hover:text-foreground",
  accent: "bg-accent-bg text-accent-hover hover:brightness-95",
  success: "bg-success-bg text-success hover:brightness-95",
  destructive: "bg-destructive-bg text-destructive hover:brightness-95",
};

/**
 * Boutons d'action d'une ligne de tableau — style repris de
 * « NJ Global Trade Fournisseurs.dc.html » (puces h-32, angles 8px, fond
 * teinté, icône + libellé court, alignées à droite). `label` facultatif :
 * sans lui, la puce est carrée (icône seule).
 *
 * En vue mobile (< sm) le libellé est masqué : icône seule, pour économiser
 * l'espace horizontal de la colonne d'actions. `title` (infobulle) reste le
 * texte accessible dans les deux vues.
 */
export function RowActionButton({
  icon: Icon,
  label,
  onClick,
  title,
  tone = "neutral",
  disabled,
}: {
  icon: LucideIcon;
  label?: string;
  onClick: (event: React.MouseEvent) => void;
  title: string;
  tone?: RowActionTone;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={label ?? title}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
      className={cn(
        "flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg px-2 text-[12px] font-semibold",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        "disabled:pointer-events-none disabled:opacity-40",
        TONE_CLASSES[tone],
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label ? <span className="hidden whitespace-nowrap sm:inline">{label}</span> : null}
    </button>
  );
}

export function RowActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-1">{children}</div>;
}
