"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnreadCount } from "../hooks/use-unread-count";
import { useNotificationsList } from "../hooks/use-notifications-list";
import { useMarkAllNotificationsRead, useMarkNotificationRead } from "../hooks/use-notification-mutations";
import { NotificationRow } from "./notification-row";
import { routes } from "@/config/routes";
import type { Notification } from "../types";
import { translate } from "@/i18n/translate";
import { cn } from "@/lib/utils";

/**
 * Doc/spec_pages_notifications.md § 1 « Cloche de notifications » — présente
 * dans l'en-tête sur toutes les pages authentifiées. Le panneau ne charge la
 * liste qu'à l'ouverture (`enabled` lié à `open`), le compteur non-lues est
 * sondé en continu par `useUnreadCount` indépendamment de l'état du panneau.
 *
 * `tone` : "onDark" (défaut) pour la pastille de contrôles sombre de l'en-tête
 * desktop, "plain" pour un usage isolé (bouton mobile sur fond clair). Le
 * voyant non-lues pulse tant qu'il reste des notifications non lues.
 */
export function NotificationBell({ tone = "onDark", className }: { tone?: "onDark" | "plain"; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const unreadCount = useUnreadCount();
  const list = useNotificationsList({ per_page: 10 }, open);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const count = unreadCount.data ?? 0;

  function handleRowClick(notification: Notification) {
    if (!notification.is_read) markRead.mutate(notification.id);
    setOpen(false);
    const link = notification.data?.link;
    if (typeof link === "string" && link) router.push(link);
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          title={translate("t.notifications")}
          aria-label={
            count > 0
              ? translate("notif.bell.ariaUnread", { count: count > 99 ? "99+" : count })
              : translate("t.notifications")
          }
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors sm:h-8 sm:w-8",
            tone === "onDark" ? "text-white hover:bg-[#262626]" : "text-muted-foreground hover:bg-background hover:text-foreground",
            className,
          )}
        >
          <Bell className="h-[19px] w-[19px]" />
          {count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/60" />
              <span
                className={cn(
                  "relative inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white ring-2",
                  tone === "onDark" ? "ring-[#111111] dark:ring-[#26282d]" : "ring-surface",
                )}
              >
                {count > 99 ? "99+" : count}
              </span>
            </span>
          ) : null}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={10}
          className="z-[75] flex w-[min(400px,92vw)] flex-col overflow-hidden rounded-lg border border-border bg-surface text-foreground shadow-[0_18px_48px_rgba(0,0,0,0.18)]"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{translate("t.notifications")}</p>
            {count > 0 ? (
              <button type="button" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending} className="text-xs font-medium text-accent-hover hover:underline disabled:opacity-50">
                Tout marquer comme lu
              </button>
            ) : null}
          </div>

          <div className="max-h-[60vh] divide-y divide-border overflow-y-auto">
            {list.isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))}
              </div>
            ) : !list.data || list.data.data.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">{translate("t.aucuneNotificationPourLInstant")}</p>
            ) : (
              list.data.data.map((notification) => (
                <NotificationRow key={notification.id} notification={notification} onClick={() => handleRowClick(notification)} truncateBody />
              ))
            )}
          </div>

          <div className="border-t border-border px-4 py-2.5 text-center">
            <Link href={routes.notifications.list} onClick={() => setOpen(false)} className="text-xs font-medium text-accent-hover hover:underline">
              Voir toutes mes notifications
            </Link>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
