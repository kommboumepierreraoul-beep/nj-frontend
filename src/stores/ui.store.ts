import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  /** Thème clair/sombre (Doc/design_system_maquette_complete.md § 2.4, Doc/theme_sombre_addendum.md). */
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Applique le thème au document : classe `dark` sur <html> (consommée par
 * `:root.dark` dans globals.css) + miroir dans `localStorage["nj.theme"]`, lu
 * par le script anti-flash de `app/layout.tsx` avant le premier rendu. No-op
 * côté serveur.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("nj.theme", theme);
  } catch {
    /* localStorage indisponible (mode privé, quota) — le thème reste appliqué via la classe. */
  }
}

/** Préférences d'affichage pures (jamais de donnée métier) — voir aussi auth.store.ts pour le pourquoi de skipHydration. */
export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),

      theme: "light",
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
    }),
    {
      name: "nj.ui",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // Après réhydratation depuis localStorage, ré-aligne le DOM sur la valeur
      // persistée (le script anti-flash a pu deviner autre chose au tout premier
      // chargement, ex. première visite sans préférence enregistrée).
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
