"use client";

import { createElement, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, LayoutDashboard, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import {
  navigation,
  navLabel,
  isNavItemVisible,
  getVisibleChildren,
  type NavItem,
  type NavChild,
} from "@/config/navigation";
import { getNavIcon } from "@/config/nav-icons";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";
import { useUnreadCount } from "@/modules/notifications/hooks/use-unread-count";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { translate } from "@/i18n/translate";

const INERT_MESSAGE = "Cette section n'est pas encore disponible.";

interface AppSidebarProps {
  /** Tiroir mobile ouvert (< md) — la sidebar est fixe au-delà, voir AppShell. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

/**
 * Barre latérale calquée sur NJ Global Trade Dashboard.dc.html (lignes
 * 283-344 pour le markup, 915-943 pour les groupes, 1526-1542 pour la
 * logique de largeur/bascule). Deux ajouts par rapport au template d'origine
 * (mockup desktop fixe, non responsive) :
 *
 * - en dessous du breakpoint `md`, la sidebar devient un tiroir plein écran
 *   (252px, recouvrement + fond assombri) plutôt que de pousser le contenu ;
 * - les icônes Material Symbols du template sont remplacées par leurs
 *   équivalents lucide-react (voir src/config/nav-icons.tsx), sur demande
 *   explicite.
 */
export function AppSidebar({ mobileOpen, onCloseMobile }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const unreadCount = useUnreadCount().data ?? 0;
  const [openLabels, setOpenLabels] = useState<Record<string, boolean>>({});

  const isActiveHref = (href: string | null | undefined) =>
    !!href && (pathname === href || pathname.startsWith(`${href}/`));

  const goTo = (href: string | null) => {
    onCloseMobile();
    if (!href) {
      toast.info(INERT_MESSAGE);
      return;
    }
    router.push(href);
  };

  const dashboardActive = pathname === routes.dashboard.home;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#111111]/55 md:hidden"
          style={{ animation: "njFade 140ms ease" }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-[252px] flex-col bg-sidebar transition-transform duration-200 md:translate-x-0 md:transition-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "md:w-[76px] md:overflow-visible" : "md:w-[252px] md:overflow-hidden",
        )}
      >
        <div className="flex h-[68px] shrink-0 items-center gap-2.5 border-b border-sidebar-border px-3">
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center rounded-[10px] bg-white px-2.5 py-[7px]",
              collapsed && "md:hidden",
            )}
          >
            <img src="/logo.png" alt="NJ Global Trade Co. Ltd" className="h-[28px] w-auto shrink-0" />
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            title={collapsed ? translate("t.deployerLeMenu") : translate("guide.nav.collapse.label")}
            className={cn(
              "hidden h-10 w-10 shrink-0 items-center justify-center rounded-[10px] transition-opacity hover:opacity-85 md:flex",
              collapsed ? "mx-auto bg-accent text-accent-foreground" : "bg-sidebar-hover text-sidebar-label",
            )}
          >
            {collapsed ? <PanelLeftOpen className="h-[21px] w-[21px]" /> : <PanelLeftClose className="h-[21px] w-[21px]" />}
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            title="Fermer le menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-sidebar-hover text-sidebar-label md:hidden"
          >
            <X className="h-[21px] w-[21px]" />
          </button>
        </div>

        <nav
          className={cn(
            "flex flex-1 flex-col gap-[22px] overflow-y-auto px-3 py-[18px]",
            collapsed && "md:overflow-visible",
          )}
        >
          <div
            onClick={() => goTo(routes.dashboard.home)}
            className={cn(
              "flex h-[42px] cursor-pointer items-center gap-3 rounded-[10px] px-3",
              dashboardActive ? "" : "hover:bg-sidebar-hover",
            )}
            style={dashboardActive ? { backgroundColor: "rgba(229,168,23,0.12)" } : undefined}
          >
            <LayoutDashboard
              className="h-5 w-5 shrink-0"
              style={{ color: dashboardActive ? "var(--color-accent)" : "var(--color-sidebar-icon)" }}
            />
            <span
              className={cn("whitespace-nowrap text-[13.5px] font-semibold", collapsed && "md:hidden")}
              style={{ color: dashboardActive ? "var(--color-accent)" : "var(--color-sidebar-label)" }}
            >
              Tableau de bord
            </span>
          </div>

          {navigation.map((group) => {
            const items = group.items.filter((item) => {
              if (!isNavItemVisible(item, user)) return false;
              if (item.children && item.children.length > 0) {
                return item.href != null || getVisibleChildren(item, user).length > 0;
              }
              return true;
            });
            if (items.length === 0) return null;

            return (
              <div key={navLabel(group)} className="flex flex-col gap-0.5">
                <p
                  className={cn(
                    "whitespace-nowrap px-[13px] pb-2 text-[9.5px] font-semibold tracking-[0.16em] text-sidebar-icon uppercase",
                    collapsed && "md:hidden",
                  )}
                >
                  {navLabel(group)}
                </p>
                {items.map((item) => {
                  const children = getVisibleChildren(item, user);
                  return (
                    <SidebarItem
                      key={navLabel(item)}
                      item={item}
                      collapsed={collapsed}
                      mobileOpen={mobileOpen}
                      open={!!openLabels[item.label]}
                      selfActive={isActiveHref(item.href)}
                      childActive={children.some((c) => isActiveHref(c.href))}
                      visibleChildren={children}
                      unreadCount={unreadCount}
                      onToggle={() => setOpenLabels((prev) => ({ ...prev, [item.label]: !prev[item.label] }))}
                      onNavigate={goTo}
                      isActiveHref={isActiveHref}
                    />
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

/** Pastille de compteur (non-lues) — style repris de NJ Global Trade Dashboard.dc.html
 * (badge accent 18px, texte noir 9.5/700). */
function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-accent px-[5px] text-[9.5px] font-bold leading-none text-accent-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function SidebarItem({
  item,
  collapsed,
  mobileOpen,
  open,
  selfActive,
  childActive,
  visibleChildren,
  unreadCount,
  onToggle,
  onNavigate,
  isActiveHref,
}: {
  item: NavItem;
  collapsed: boolean;
  mobileOpen: boolean;
  open: boolean;
  /** L'entrée pointe elle-même vers la route active. */
  selfActive: boolean;
  /** Une de ses sous-entrées pointe vers la route active. */
  childActive: boolean;
  visibleChildren: NavChild[];
  unreadCount: number;
  onToggle: () => void;
  onNavigate: (href: string | null) => void;
  isActiveHref: (href: string | null | undefined) => boolean;
}) {
  // « Actif » au sens couleur : l'entrée ou l'un de ses enfants. Seul `selfActive`
  // reçoit le fond doré plein (comportement du template : seul l'écran courant est
  // teinté) ; `childActive` colore l'icône/le libellé en doré sans fond.
  const active = selfActive || childActive;
  const childBadge = (child: NavChild) =>
    child.href === routes.notifications.list ? <CountBadge count={unreadCount} /> : null;
  const hasChildren = visibleChildren.length > 0;
  // Sur mobile le tiroir est toujours "déployé" (pleine largeur, libellés visibles) —
  // seul l'état "collapsed" du bureau produit le rail réduit + les bulles flottantes.
  const rail = collapsed && !mobileOpen;
  const showFlyout = rail && open && hasChildren;
  const showInline = !rail && open && hasChildren;
  // `getNavIcon` résout dynamiquement une icône par clé — react-hooks/static-components
  // (React Compiler) refuse d'utiliser un composant sélectionné dynamiquement comme
  // balise JSX (`<Icon />`), même quand la table de correspondance est statique
  // (voir src/config/nav-icons.tsx). `createElement` produit le même élément sans
  // passer par la syntaxe JSX que la règle inspecte.
  const icon = createElement(getNavIcon(item.icon), {
    className: "h-5 w-5 shrink-0",
    style: { color: active ? "var(--color-accent)" : "var(--color-sidebar-icon)" },
  });

  const totalUnreadInChildren = visibleChildren.some((c) => c.href === routes.notifications.list) ? unreadCount : 0;

  return (
    <div className="relative flex flex-col">
      <div
        onClick={() => (hasChildren ? onToggle() : onNavigate(item.href ?? null))}
        className={cn(
          "flex h-10 cursor-pointer items-center gap-3 rounded-[10px] px-3",
          !selfActive && "hover:bg-sidebar-hover",
          !hasChildren && item.href === null && "opacity-50",
        )}
        style={selfActive ? { backgroundColor: "rgba(229,168,23,0.12)" } : undefined}
      >
        {icon}
        <span
          className={cn(
            "flex-1 truncate text-[13.5px]",
            active ? "font-semibold" : "font-medium",
            collapsed && "md:hidden",
          )}
          style={{ color: active ? "var(--color-accent)" : "var(--color-sidebar-label)" }}
        >
          {navLabel(item)}
        </span>
        {/* Compteur non-lues remonté sur l'entête « Mon espace » quand le sous-menu est fermé. */}
        {!open && !collapsed && totalUnreadInChildren > 0 ? <CountBadge count={totalUnreadInChildren} /> : null}
        {hasChildren && (
          <ChevronDown
            className={cn("h-[18px] w-[18px] shrink-0 transition-transform", active ? "text-accent" : "text-sidebar-icon")}
            style={{ transform: `rotate(${rail ? -90 : open ? 180 : 0}deg)` }}
          />
        )}
      </div>

      {showFlyout && (
        <div
          className="absolute left-[calc(100%+10px)] top-[-4px] z-[45] flex min-w-[210px] flex-col gap-0.5 rounded-[13px] border border-sidebar-flyout-border bg-sidebar-flyout-bg p-2 shadow-[0_18px_42px_rgba(0,0,0,0.5)]"
          style={{ animation: "njFade 120ms ease" }}
        >
          <div className="whitespace-nowrap px-2.5 pb-2 pt-1.5 text-[9.5px] font-bold tracking-[0.14em] text-accent">
            {navLabel(item)}
          </div>
          {visibleChildren.map((child) => {
            const childIsActive = isActiveHref(child.href);
            return (
              <div
                key={navLabel(child)}
                onClick={() => onNavigate(child.href)}
                className={cn(
                  "flex h-[34px] cursor-pointer items-center gap-[9px] whitespace-nowrap rounded-[8px] px-2.5 text-[12.5px] font-medium",
                  !child.href && "text-sidebar-flyout-child/50",
                  child.href && !childIsActive && "text-sidebar-flyout-child hover:bg-[#262626] hover:text-white",
                  childIsActive && "bg-white/[0.06] text-white",
                )}
              >
                {/* Barre d'accent (template ligne 322) : dorée quand actif, transparente sinon. */}
                <span className={cn("h-4 w-[3px] shrink-0 rounded-[2px]", childIsActive ? "bg-accent" : "bg-transparent")} />
                <span className="flex-1 truncate">{navLabel(child)}</span>
                {childBadge(child)}
              </div>
            );
          })}
        </div>
      )}

      {showInline && (
        <div className="mb-1.5 ml-5 mt-0.5 flex flex-col border-l border-sidebar-inline-border pl-[13px]">
          {visibleChildren.map((child) => {
            const childIsActive = isActiveHref(child.href);
            return (
              <div
                key={navLabel(child)}
                onClick={() => onNavigate(child.href)}
                className={cn(
                  "relative flex h-[34px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-[8px] pr-2.5 pl-3 text-[12.5px]",
                  !child.href && "text-sidebar-inline-child/50",
                  child.href && !childIsActive && "font-normal text-sidebar-inline-child hover:text-white",
                  childIsActive && "font-medium text-white",
                )}
              >
                {/* Repère d'actif : barre dorée débordant sur le filet de gauche. */}
                {childIsActive ? <span className="absolute -left-[14px] top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-[2px] bg-accent" /> : null}
                <span className="flex-1 truncate">{navLabel(child)}</span>
                {childBadge(child)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
