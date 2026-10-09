"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { GlobalSearchDialog } from "./global-search-dialog";
import { GuidePanel } from "./guide-panel";
import { WhatsNewModal } from "@/components/onboarding/whats-new-modal";
import { TourHost } from "@/components/onboarding/tour-host";
import { resolvePageGuide } from "@/config/page-guides";
import { useUiStore } from "@/stores/ui.store";

/**
 * Coquille applicative calquée sur NJ Global Trade Dashboard.dc.html (ligne
 * 283) : la sidebar est en position fixe (voir AppSidebar) et le reste de la
 * mise en page compense avec `margin-left: sidebarWidth`, animé en même temps
 * que la largeur de la sidebar. En dessous du breakpoint `md`, la sidebar
 * devient un tiroir plein écran (voir AppSidebar) et le contenu n'a plus de
 * marge — c'est le seul écart structurel avec le template, qui est un
 * mockup desktop fixe (1440×900) sans version mobile.
 *
 * Raccourcis clavier ⌘K/Ctrl+K (recherche) et ⌘//Ctrl+/ (guide) montés ici
 * (§ 2.3, § 4.6) — identiques à `NJShell.mount()` de nj-shell.js lignes
 * 150-160 : Échap ferme le panneau ouvert en priorité (recherche puis guide).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [whatsNewSignal, setWhatsNewSignal] = useState(0);
  const pathname = usePathname();

  // Ferme le tiroir mobile automatiquement à chaque changement de page. Ajustement
  // fait pendant le rendu (plutôt que dans un useEffect) — pattern documenté React
  // pour "réinitialiser un état quand une prop change" (react.dev/learn/you-might-not-need-an-effect),
  // qui évite aussi l'erreur react-hooks/set-state-in-effect du React Compiler.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        setSearchOpen(true);
      } else if ((event.metaKey || event.ctrlKey) && key === "/") {
        event.preventDefault();
        setGuideOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <AppSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div
        className={
          collapsed
            ? "flex min-h-dvh flex-col md:ml-[76px] md:transition-[margin-left] md:duration-200"
            : "flex min-h-dvh flex-col md:ml-[252px] md:transition-[margin-left] md:duration-200"
        }
      >
        <AppHeader
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenGuide={() => setGuideOpen(true)}
          onOpenWhatsNew={() => setWhatsNewSignal((n) => n + 1)}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <GuidePanel open={guideOpen} onOpenChange={setGuideOpen} sections={resolvePageGuide(pathname)} />
      <WhatsNewModal openSignal={whatsNewSignal} />
      <TourHost />
    </div>
  );
}
