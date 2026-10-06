import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * « Carte KPI » (§ 2.3) : chiffre principal en gros, sous-texte plus petit
 * pour la mention secondaire, icône de contexte. Réutilisée par Analyse des
 * flux et la liste des utilisateurs ; les 3 cartes chiffrées du Tableau de
 * bord ont une mise en page propre à chacune (voir revenue-kpi-card.tsx,
 * pending-invoices-kpi-card.tsx, conversion-rate-kpi-card.tsx) et ne passent
 * plus par ce composant générique depuis l'alignement sur la maquette.
 *
 * Carte calquée sur NJ Global Trade Dashboard.dc.html (cartes de métriques,
 * ex. lignes 385-418) : fond blanc, bordure #E6E6E6, angles 14px, libellé en
 * petites capitales 10px espacées, chiffre 30px/800, puce d'icône 34×34 à
 * angles 9px plutôt qu'un cercle.
 */
export interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  subtext?: React.ReactNode;
  tone?: "default" | "success" | "warning" | "destructive";
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const TONE_ICON_CLASSES: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "bg-accent-bg text-accent-hover",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  destructive: "bg-destructive-bg text-destructive",
};

const TONE_VALUE_CLASSES: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export function KpiCard({ label, value, icon: Icon, subtext, tone = "default", onClick, className, children }: KpiCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={cn(
        "flex flex-col gap-3.5 rounded-[14px] border border-border bg-surface p-5 text-left",
        onClick && "cursor-pointer transition-[border-color,box-shadow] hover:border-accent hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-bold tracking-[0.14em] text-text-tertiary uppercase">{label}</span>
        {Icon ? (
          <span className={cn("flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]", TONE_ICON_CLASSES[tone])}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
        ) : null}
      </div>
      <div className={cn("text-[30px] leading-none font-extrabold tracking-[-0.03em] tabular-nums", TONE_VALUE_CLASSES[tone])}>{value}</div>
      {subtext ? <div className="text-[12.5px] text-muted-foreground">{subtext}</div> : null}
      {children}
    </Comp>
  );
}
