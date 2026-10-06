"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { LocaleProvider } from "@/i18n";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";

/**
 * Racine de tous les providers client, montée depuis app/layout.tsx. La
 * réhydratation manuelle des stores Zustand (skipHydration: true côté store)
 * n'a lieu qu'ici, après le premier rendu — jamais pendant le rendu serveur,
 * qui n'a pas accès à localStorage.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
    void useUiStore.persist.rehydrate();
  }, []);

  return (
    <LocaleProvider>
      <QueryProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </QueryProvider>
    </LocaleProvider>
  );
}
