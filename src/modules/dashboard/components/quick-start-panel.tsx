"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Compass, PlayCircle, Sparkles, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { hasAnyPermission } from "@/lib/auth/permissions";
import { QUICK_START_ACTIONS, QUICK_START_STORAGE_KEY, type QuickStartAction } from "@/config/quick-start";
import { TOUR_PENDING_KEY, TOUR_START_EVENT, TOURS } from "@/config/tours";
import { translate } from "@/i18n/translate";

function readDismissed(): boolean {
  try {
    return localStorage.getItem(QUICK_START_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDismissed(value: boolean) {
  try {
    if (value) localStorage.setItem(QUICK_START_STORAGE_KEY, "1");
    else localStorage.removeItem(QUICK_START_STORAGE_KEY);
  } catch {
    /* localStorage indisponible — le panneau se réaffichera au prochain chargement. */
  }
}

/**
 * Mode d'accueil simplifié (voir src/config/quick-start.ts) : 5–6 actions
 * essentielles pour le démarrage, en haut du tableau de bord. Chaque action
 * peut lancer une visite guidée interactive (src/config/tours.ts) sur sa page
 * cible. Se masque en un clic et ne retire rien du menu — les 44 écrans
 * restent tous accessibles depuis la barre latérale.
 */
export function QuickStartPanel() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Lecture localStorage post-montage (jamais au SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (readDismissed()) setDismissed(true);
  }, []);

  const actions = QUICK_START_ACTIONS.filter(
    (action) => !action.anyPermission || action.anyPermission.length === 0 || hasAnyPermission(user, action.anyPermission),
  );

  if (actions.length === 0) return null;

  function startTour(action: QuickStartAction) {
    if (!action.tourId) return;
    const tour = TOURS[action.tourId];
    if (!tour) return;
    if (pathname === tour.route) {
      window.dispatchEvent(new CustomEvent(TOUR_START_EVENT, { detail: action.tourId }));
      return;
    }
    try {
      localStorage.setItem(TOUR_PENDING_KEY, action.tourId);
    } catch {
      /* noop — la visite ne démarrera pas mais la navigation, si. */
    }
    router.push(tour.route);
  }

  if (dismissed) {
    return (
      <button
        type="button"
        onClick={() => {
          writeDismissed(false);
          setDismissed(false);
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
      >
        <Compass className="h-4 w-4" />
        {translate("quickStart.reopen")}
      </button>
    );
  }

  return (
    <section className="overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-accent-bg text-link">
            <Sparkles className="h-[18px] w-[18px]" />
          </span>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold text-foreground">{translate("quickStart.title")}</h2>
            <p className="text-[12.5px] leading-[1.45] text-muted-foreground text-pretty">{translate("quickStart.subtitle")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            writeDismissed(true);
            setDismissed(true);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          title={translate("quickStart.hide")}
          aria-label={translate("quickStart.hide")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <div key={action.id} className="group flex flex-col bg-surface px-5 py-4">
            <Link
              href={action.href}
              className="flex items-start gap-3 focus-visible:outline-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-border bg-background text-muted-foreground transition-colors group-hover:border-accent group-hover:text-accent">
                <action.icon className="h-[18px] w-[18px]" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-1 text-[13px] font-semibold text-foreground">
                  {translate(action.titleKey)}
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-quaternary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span className="text-[11.5px] leading-[1.4] text-muted-foreground text-pretty">{translate(action.descKey)}</span>
              </div>
            </Link>
            {action.tourId ? (
              <button
                type="button"
                onClick={() => startTour(action)}
                className="mt-2 ml-12 inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-semibold text-link transition-colors hover:border-accent hover:bg-accent-bg"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                {translate("quickStart.startTour")}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <p className="border-t border-border px-5 py-2.5 text-[11.5px] text-text-tertiary">{translate("quickStart.footer")}</p>
    </section>
  );
}
