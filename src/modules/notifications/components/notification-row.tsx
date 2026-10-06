import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/format";
import { PRIORITY_LABELS, PRIORITY_TONES } from "../badges";
import type { Notification } from "../types";

/**
 * Ligne de notification partagée par le panneau de la cloche (§1) et la page
 * « Toutes mes notifications » (§2) : indicateur non-lu, badge de priorité,
 * titre (gras si non lue), corps, horodatage relatif.
 */
export function NotificationRow({ notification, onClick, truncateBody = false }: { notification: Notification; onClick?: () => void; truncateBody?: boolean }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
        !notification.is_read && "bg-accent-bg/40",
        onClick && "hover:bg-background",
      )}
    >
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", notification.is_read ? "bg-transparent" : "bg-accent")} />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={PRIORITY_TONES[notification.priority]}>{PRIORITY_LABELS[notification.priority]}</Badge>
          <span className={cn("text-sm text-foreground", !notification.is_read && "font-semibold")}>{notification.title}</span>
        </div>
        <p className={cn("text-sm text-muted-foreground", truncateBody && "line-clamp-2")}>{notification.body}</p>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.created_at)}</p>
      </div>
    </Comp>
  );
}
