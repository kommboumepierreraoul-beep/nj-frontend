"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useCurrentUser } from "../hooks/use-current-user";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

/**
 * Protège un groupe de routes côté client. Le token vivant en localStorage
 * (choix assumé — pas de cookie httpOnly, voir auth.store.ts), aucune
 * vérification n'est possible côté serveur (middleware/Server Component) :
 * un bref squelette de chargement le temps de relire localStorage est le
 * compromis accepté. Voir Doc/frontend_architecture_structure.md § Authentification.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mustChangePassword = useAuthStore((state) => state.user?.must_change_password ?? false);

  useCurrentUser();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      const returnTo = encodeURIComponent(pathname);
      router.replace(`${routes.auth.login}?returnTo=${returnTo}`);
      return;
    }

    if (mustChangePassword && pathname !== routes.auth.changePassword) {
      router.replace(routes.auth.changePassword);
    }
  }, [hasHydrated, isAuthenticated, mustChangePassword, pathname, router]);

  if (!hasHydrated || !isAuthenticated) {
    return <FullScreenSpinner />;
  }

  return <>{children}</>;
}

function FullScreenSpinner() {
  return (
    <div className="flex h-dvh items-center justify-center bg-background">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground"
        role="status"
        aria-label={translate("field.chargement")}
      />
    </div>
  );
}
