"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight, CheckCheck, CheckCircle2, Clock, MailWarning, Minus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/data-display/page-header";
import { TableSection } from "@/components/data-display/table-section";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { PageSuspense } from "@/components/layout/page-suspense";
import { InfoBanner } from "@/components/data-display/info-banner";
import { useQueryParams } from "@/hooks/use-query-params";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useNotificationsList } from "@/modules/notifications/hooks/use-notifications-list";
import { useUnreadCount } from "@/modules/notifications/hooks/use-unread-count";
import { useMarkAllNotificationsRead, useMarkNotificationRead } from "@/modules/notifications/hooks/use-notification-mutations";
import { NotificationFilters } from "@/modules/notifications/components/notification-filters";
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_TONES, PRIORITY_LABELS, PRIORITY_TONES } from "@/modules/notifications/badges";
import { routes } from "@/config/routes";
import type { Notification, NotificationListFilters } from "@/modules/notifications/types";
import { translate } from "@/i18n/translate";

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

/** Doc/spec_pages_notifications.md § 2 « Toutes mes notifications » — historique complet paginé, tri fixé par l'API (plus récent d'abord), aucune autre action que la lecture (pas de suppression/archivage, hors périmètre). */
export default function NotificationsPage() {
  return (
    <PageSuspense>
      <NotificationsPageContent />
    </PageSuspense>
  );
}

function NotificationsPageContent() {
  const router = useRouter();
  const [filters, setFilters] = useQueryParams<Required<Pick<NotificationListFilters, "page" | "per_page">> & NotificationListFilters>({
    page: 1,
    per_page: 20,
    category: undefined,
    priority: undefined,
    read: undefined,
  });

  const query = useNotificationsList(filters);
  const unreadCountQuery = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = unreadCountQuery.data ?? 0;
  const hasUnread = (query.data?.data ?? []).some((notification) => !notification.is_read);
  const meta = query.data?.meta;

  function handleRowClick(notification: Notification) {
    if (!notification.is_read) markRead.mutate(notification.id);
    const link = notification.data?.link;
    if (typeof link === "string" && link) router.push(link);
  }

  const columns: DataTableColumn<Notification>[] = [
    {
      key: "status",
      header: "",
      width: "24px",
      render: (row) => (
        <span
          title={row.is_read ? "Lue" : "Non lue"}
          className={cn("h-[9px] w-[9px] rounded-full border-[1.5px]", row.is_read ? "border-border-2 bg-transparent" : "border-accent bg-accent")}
        />
      ),
    },
    {
      key: "priority",
      header: translate("col.priority"),
      width: "110px",
      render: (row) => <Badge tone={PRIORITY_TONES[row.priority]}>{PRIORITY_LABELS[row.priority]}</Badge>,
    },
    {
      key: "category",
      header: translate("col.category"),
      width: "150px",
      render: (row) => {
        const Icon = CATEGORY_ICONS[row.category];
        return (
          <Badge tone={CATEGORY_TONES[row.category]} className="max-w-full">
            <Icon className="mr-1 h-3 w-3 shrink-0" />
            <span className="truncate">{CATEGORY_LABELS[row.category]}</span>
          </Badge>
        );
      },
    },
    {
      key: "notification",
      header: translate("col.notification"),
      width: "minmax(320px,1fr)",
      render: (row) => (
        <div className="min-w-0 space-y-1 py-1">
          <p className={cn("text-[13px] leading-snug text-foreground text-pretty", !row.is_read && "font-bold")}>{row.title}</p>
          <p className="text-[11.5px] leading-relaxed text-muted-foreground text-pretty">{row.body}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: translate("col.date"),
      width: "150px",
      render: (row) => (
        <div title={formatDateTime(row.created_at)} className="flex flex-col gap-0.5">
          <span className="text-[12.5px] font-semibold text-foreground">{formatRelativeTime(row.created_at)}</span>
          <span className="text-[10.5px] tabular-nums text-text-quaternary">{formatDateTime(row.created_at)}</span>
        </div>
      ),
    },
    {
      key: "link",
      header: translate("col.link"),
      width: "40px",
      align: "right",
      render: (row) => {
        const hasLink = typeof row.data?.link === "string" && row.data.link;
        const Icon = hasLink ? ArrowUpRight : Minus;
        return (
          <span title={hasLink ? translate("t.ouvreLEcranConcerne") : translate("t.nePointeVersAucunEcran")} className="flex items-center justify-center">
            <Icon className="h-4 w-4 text-text-tertiary" />
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Tableau de bord", href: routes.dashboard.home }, { label: "Mon espace" }, { label: "Toutes mes notifications" }]}
        title={translate("page.notifications.title")}
        badges={
          unreadCount > 0 ? (
            <Badge tone="warning">
              <MailWarning className="mr-1 h-3 w-3" />
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </Badge>
          ) : (
            <Badge tone="success">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Tout est lu
            </Badge>
          )
        }
        description={translate("page.notifications.desc")}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push(routes.notifications.preferences)}>
              <SlidersHorizontal className="h-4 w-4" />
              Préférences
            </Button>
            <Button onClick={() => markAllRead.mutate()} disabled={!hasUnread || markAllRead.isPending}>
              <CheckCheck className="h-4 w-4" />
              Tout marquer comme lu
            </Button>
          </>
        }
      />

      <InfoBanner>
        <span className="font-bold text-foreground">{translate("t.cesNotificationsRestentInternesALEquipe")} </span>
        Aucune n&apos;est envoyée au client, y compris les alertes de relance : elles signalent qu&apos;une relance manuelle est à faire, depuis « Factures en attente » du tableau de bord, avec
        votre propre message. Vous ne voyez et ne modifiez que vos propres notifications — aucun rôle n&apos;en change l&apos;affichage.
      </InfoBanner>

      <NotificationFilters filters={filters} onChange={(patch) => setFilters({ ...patch, page: 1 })} />

      <TableSection
        title={translate("page.notifications.section")}
        hint={meta ? `${meta.total} notification${meta.total > 1 ? "s" : ""} correspondant aux filtres actifs — les plus récentes d'abord, ordre fixé par l'API.` : undefined}
        action={
          <div className="flex items-center gap-2">
            <label className="text-[11.5px] font-medium text-muted-foreground">{translate("t.parPage")}</label>
            <Select value={String(filters.per_page ?? 20)} onValueChange={(value) => setFilters({ per_page: Number(value), page: 1 })}>
              <SelectTrigger className="h-[34px] w-[70px] px-2.5 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        <DataTable
          className="rounded-t-none border-0"
          columns={columns}
          data={query.data?.data}
          meta={query.data?.meta}
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          onRetry={() => query.refetch()}
          onPageChange={(page) => setFilters({ page })}
          onRowClick={handleRowClick}
          rowKey={(row) => row.id}
          emptyTitle={translate("page.notifications.empty")}
          emptyDescription={translate("page.notifications.emptyDesc")}
        />
      </TableSection>

      <div className="flex items-start gap-2.5 px-0.5">
        <Clock className="mt-0.5 h-[17px] w-[17px] shrink-0 text-text-tertiary" />
        <p className="text-xs leading-relaxed text-text-tertiary text-pretty">
          Compteur rafraîchi toutes les 45 secondes par sondage. Pas de notification poussée en temps réel dans ce lot — un délai de moins d&apos;une minute est normal.
        </p>
      </div>
    </div>
  );
}
