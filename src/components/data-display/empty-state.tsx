import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { translate } from "@/i18n/translate";
import { cn } from "@/lib/utils";

/**
 * Liste vide (§ 4.5) : message neutre, distinct du cas erreur — jamais
 * fusionné avec ErrorState. `size="lg"` reprend l'état vide d'un tableau tel
 * que NJ Global Trade Clients.dc.html lignes 589-597 (puce d'icône 54×54 à
 * angles 16px, titre 16.5px/700, texte 13.5px sur 380px max) ; `size="sm"`
 * (par défaut) sert aux emplacements plus compacts (carte, section).
 */
export function EmptyState({
  title = translate("state.empty.default"),
  description,
  icon: Icon = Inbox,
  action,
  size = "sm",
  className,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  size?: "sm" | "lg";
  className?: string;
}) {
  if (size === "lg") {
    return (
      <div className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
        <span className="flex h-[54px] w-[54px] items-center justify-center rounded-[16px] bg-background text-text-quaternary">
          <Icon className="h-[25px] w-[25px]" />
        </span>
        <p className="text-[16.5px] font-bold tracking-[-0.02em] text-foreground">{title}</p>
        {description ? (
          <p className="max-w-[380px] text-[13.5px] leading-[1.5] text-muted-foreground text-pretty">{description}</p>
        ) : null}
        {action}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-2 px-6 py-14 text-center", className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
