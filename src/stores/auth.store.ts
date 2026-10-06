import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "@/modules/auth/types";
import { hasPermission as checkPermission, hasRole as checkRole } from "@/lib/auth/permissions";
import type { UserRole } from "@/types/permissions";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** true une fois la relecture de localStorage terminée côté client (voir AppProviders). */
  hasHydrated: boolean;

  setSession: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
  hasPermission: (code: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}

/**
 * Source de vérité unique pour la session : utilisateur, token et permissions
 * dérivées vivent ici, persistés en localStorage (choix assumé — voir
 * Doc/frontend_architecture_structure.md § Authentification : le backend a
 * `supports_credentials: false`, donc pas de cookie httpOnly cross-origin
 * possible sans passer par un proxy serveur, ce que ce projet n'a pas choisi
 * de faire). `src/lib/http/api-client.ts` lit le token directement via
 * `useAuthStore.getState().token`, en dehors de React.
 *
 * `skipHydration: true` + réhydratation manuelle dans AppProviders : évite
 * tout accès à `localStorage` pendant le rendu serveur (qui ferait planter le
 * SSR de la première page).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      setSession: (user, token) => set({ user, token, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ user: null, token: null, isAuthenticated: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      hasPermission: (code) => checkPermission(get().user, code),
      hasRole: (role) => checkRole(get().user, role),
    }),
    {
      name: "nj.auth",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
