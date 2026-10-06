"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GuidedTour } from "./guided-tour";
import { TOUR_PENDING_KEY, TOUR_START_EVENT, TOURS, tourSeenKey } from "@/config/tours";

function readPending(): string | null {
  try {
    return localStorage.getItem(TOUR_PENDING_KEY);
  } catch {
    return null;
  }
}

function clearPending() {
  try {
    localStorage.removeItem(TOUR_PENDING_KEY);
  } catch {
    /* noop */
  }
}

function markSeen(id: string, completed: boolean) {
  try {
    localStorage.setItem(tourSeenKey(id), completed ? "done" : "skipped");
  } catch {
    /* noop */
  }
}

/**
 * Démarre une visite guidée (src/config/tours.ts) quand :
 *  - `localStorage[nj.tour.pending]` désigne une visite dont la route == pathname
 *    (déclenché par le panneau « Prise en main » qui pose la clé puis navigue) ;
 *  - un évènement `nj:start-tour` porte un id dont la route == pathname (bouton
 *    « Suivez le guide » quand on est déjà sur la bonne page).
 *
 * Monté une seule fois par AppShell.
 */
export function TourHost() {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string | null>(null);

  const tryStart = useCallback(
    (id: string | null) => {
      if (!id) return;
      const tour = TOURS[id];
      if (tour && tour.route === pathname) {
        setActiveId(id);
        clearPending();
      }
    },
    [pathname],
  );

  // Visite en attente après navigation (lecture localStorage post-montage).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    tryStart(readPending());
  }, [tryStart]);

  // Demande explicite depuis la page courante.
  useEffect(() => {
    const onStart = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      tryStart(id);
    };
    window.addEventListener(TOUR_START_EVENT, onStart as EventListener);
    return () => window.removeEventListener(TOUR_START_EVENT, onStart as EventListener);
  }, [tryStart]);

  if (!activeId) return null;
  const tour = TOURS[activeId];
  if (!tour) return null;

  return (
    <GuidedTour
      steps={tour.steps}
      open
      onClose={(completed) => {
        markSeen(activeId, completed);
        setActiveId(null);
      }}
    />
  );
}
